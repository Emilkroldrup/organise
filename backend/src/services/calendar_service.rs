use mongodb::{Client, bson::{doc, oid::ObjectId}};
use mongodb::error::Error;
use futures_util::TryStreamExt;
use crate::models::calendar::{CalendarEvent, GoogleCalendarCredentials, GoogleCalendarToken};
use thiserror::Error;
use actix_web::HttpResponse;
use chrono::{DateTime, Utc};
use validator::Validate;
use reqwest;
use serde_json::json;

#[derive(Error, Debug)]
pub enum CalendarServiceError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] Error),
    #[error("Invalid ObjectId: {0}")]
    InvalidObjectId(#[from] mongodb::bson::oid::Error),
    #[error("Event not found")]
    EventNotFound,
    #[error("Validation error: {0}")]
    ValidationError(validator::ValidationErrors),
    #[error("Google Calendar API error: {0}")]
    GoogleApiError(String),
    #[error("Authentication error: {0}")]
    AuthError(String),
}

/// Retrieves all calendar events from the MongoDB "calendar_events" collection.
pub async fn get_all_events(client: &Client) -> Result<Vec<CalendarEvent>, CalendarServiceError> {
    let collection = get_calendar_collection(client);
    let cursor = collection.find(doc! {}).await?;
    collect_events(cursor).await.map_err(CalendarServiceError::from)
}

/// Retrieves calendar events for a specific time range.
pub async fn get_events_by_date_range(
    client: &Client, 
    start_date: DateTime<Utc>, 
    end_date: DateTime<Utc>
) -> Result<Vec<CalendarEvent>, CalendarServiceError> {
    let collection = get_calendar_collection(client);
    let filter = doc! {
        "$or": [
            {
                "start_time": { "$gte": start_date, "$lte": end_date }
            },
            {
                "end_time": { "$gte": start_date, "$lte": end_date }
            },
            {
                "$and": [
                    { "start_time": { "$lte": start_date } },
                    { "end_time": { "$gte": end_date } }
                ]
            }
        ]
    };
    let cursor = collection.find(filter).await?;
    collect_events(cursor).await.map_err(CalendarServiceError::from)
}

/// Inserts a new calendar event into the MongoDB "calendar_events" collection.
pub async fn add_event(client: &Client, mut event: CalendarEvent) -> Result<(), CalendarServiceError> {
    if let Err(e) = event.validate() {
        return Err(CalendarServiceError::ValidationError(e));
    }

    let collection = get_calendar_collection(client);
    event.id = Some(ObjectId::new());
    event.created_at = Some(Utc::now());
    event.updated_at = Some(Utc::now());
    collection.insert_one(event).await?;
    Ok(())
}

/// Updates an existing calendar event in the MongoDB "calendar_events" collection.
pub async fn update_event(client: &Client, event_id: &str, mut updated_event: CalendarEvent) -> Result<(), CalendarServiceError> {
    if let Err(e) = updated_event.validate() {
        return Err(CalendarServiceError::ValidationError(e));
    }

    let collection = get_calendar_collection(client);
    let object_id = ObjectId::parse_str(event_id)?;
    let filter = doc! { "_id": object_id };
    
    // Check if event exists
    let existing_event = collection.find_one(filter.clone()).await?;
    if existing_event.is_none() {
        return Err(CalendarServiceError::EventNotFound);
    }

    updated_event.updated_at = Some(Utc::now());
    let update = doc! { 
        "$set": { 
            "title": updated_event.title, 
            "description": updated_event.description, 
            "start_time": updated_event.start_time, 
            "end_time": updated_event.end_time,
            "location": updated_event.location,
            "color_id": updated_event.color_id,
            "is_all_day": updated_event.is_all_day,
            "recurrence": updated_event.recurrence,
            "attendees": updated_event.attendees,
            "updated_at": updated_event.updated_at
        } 
    };
    collection.update_one(filter, update).await?;
    Ok(())
}

/// Removes an existing calendar event from the MongoDB "calendar_events" collection.
pub async fn remove_event(client: &Client, event_id: &str) -> Result<(), CalendarServiceError> {
    let collection = get_calendar_collection(client);
    let object_id = ObjectId::parse_str(event_id)?;
    let filter = doc! { "_id": object_id };
    
    // Check if event exists
    let existing_event = collection.find_one(filter.clone()).await?;
    if existing_event.is_none() {
        return Err(CalendarServiceError::EventNotFound);
    }

    collection.delete_one(filter).await?;
    Ok(())
}

/// Syncs events with Google Calendar
pub async fn sync_with_google_calendar(
    client: &Client, 
    credentials: &GoogleCalendarCredentials,
    token: &GoogleCalendarToken
) -> Result<(), CalendarServiceError> {
    // This is a placeholder for the actual Google Calendar API integration
    // In a real implementation, you would:
    // 1. Use the Google Calendar API client to fetch events
    // 2. Compare with local events and update accordingly
    // 3. Handle pagination and rate limiting
    
    // Example of how you might make an API call:
    let client = reqwest::Client::new();
    let url = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
    
    let response = client.get(url)
        .header("Authorization", format!("Bearer {}", token.access_token))
        .send()
        .await
        .map_err(|e| CalendarServiceError::GoogleApiError(e.to_string()))?;
    
    if !response.status().is_success() {
        return Err(CalendarServiceError::GoogleApiError(format!(
            "Google API returned error: {}", 
            response.status()
        )));
    }
    
    // Process the response and update local events
    // This is just a placeholder
    Ok(())
}

/// Helper function to get the "calendar_events" collection.
fn get_calendar_collection(client: &Client) -> mongodb::Collection<CalendarEvent> {
    let db = client.database("organise");
    db.collection::<CalendarEvent>("calendar_events")
}

/// Helper function to collect events from a cursor.
async fn collect_events(mut cursor: mongodb::Cursor<CalendarEvent>) -> Result<Vec<CalendarEvent>, Error> {
    let mut events = Vec::new();
    while let Some(event) = cursor.try_next().await? {
        events.push(event);
    }
    Ok(events)
}

// Custom function to convert CalendarServiceError to HttpResponse
pub fn error_response(error: CalendarServiceError) -> HttpResponse {
    match error {
        CalendarServiceError::DatabaseError(e) => HttpResponse::InternalServerError().body(format!("Database error: {}", e)),
        CalendarServiceError::InvalidObjectId(e) => HttpResponse::BadRequest().body(format!("Invalid ObjectId: {}", e)),
        CalendarServiceError::EventNotFound => HttpResponse::NotFound().body("Event not found"),
        CalendarServiceError::ValidationError(e) => HttpResponse::BadRequest().json(e),
        CalendarServiceError::GoogleApiError(e) => HttpResponse::InternalServerError().body(format!("Google Calendar API error: {}", e)),
        CalendarServiceError::AuthError(e) => HttpResponse::Unauthorized().body(format!("Authentication error: {}", e)),
    }
} 