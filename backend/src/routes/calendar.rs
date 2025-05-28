use actix_web::{web, HttpResponse, Responder};
use chrono::{DateTime, Utc};
use mongodb::Client;
use crate::models::calendar::{CalendarEvent, GoogleCalendarCredentials, GoogleCalendarToken};
use crate::services::calendar_service;

/// Get all calendar events
pub async fn get_all_events(client: web::Data<Client>) -> impl Responder {
    match calendar_service::get_all_events(&client).await {
        Ok(events) => HttpResponse::Ok().json(events),
        Err(e) => calendar_service::error_response(e),
    }
}

/// Get events by date range
pub async fn get_events_by_date_range(
    client: web::Data<Client>,
    start_date: web::Query<DateTime<Utc>>,
    end_date: web::Query<DateTime<Utc>>,
) -> impl Responder {
    match calendar_service::get_events_by_date_range(&client, start_date.into_inner(), end_date.into_inner()).await {
        Ok(events) => HttpResponse::Ok().json(events),
        Err(e) => calendar_service::error_response(e),
    }
}

/// Add a new calendar event
pub async fn add_event(
    client: web::Data<Client>,
    event: web::Json<CalendarEvent>,
) -> impl Responder {
    match calendar_service::add_event(&client, event.into_inner()).await {
        Ok(_) => HttpResponse::Created().finish(),
        Err(e) => calendar_service::error_response(e),
    }
}

/// Update an existing calendar event
pub async fn update_event(
    client: web::Data<Client>,
    event_id: web::Path<String>,
    event: web::Json<CalendarEvent>,
) -> impl Responder {
    match calendar_service::update_event(&client, &event_id, event.into_inner()).await {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(e) => calendar_service::error_response(e),
    }
}

/// Delete a calendar event
pub async fn delete_event(
    client: web::Data<Client>,
    event_id: web::Path<String>,
) -> impl Responder {
    match calendar_service::remove_event(&client, &event_id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => calendar_service::error_response(e),
    }
}

/// Sync with Google Calendar
pub async fn sync_google_calendar(
    client: web::Data<Client>,
    credentials: web::Json<GoogleCalendarCredentials>,
    token: web::Json<GoogleCalendarToken>,
) -> impl Responder {
    match calendar_service::sync_with_google_calendar(&client, &credentials, &token).await {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(e) => calendar_service::error_response(e),
    }
}

/// Configure the calendar routes
pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/calendar")
            .route("/events", web::get().to(get_all_events))
            .route("/events/range", web::get().to(get_events_by_date_range))
            .route("/events", web::post().to(add_event))
            .route("/events/{id}", web::put().to(update_event))
            .route("/events/{id}", web::delete().to(delete_event))
            .route("/sync/google", web::post().to(sync_google_calendar))
    );
}