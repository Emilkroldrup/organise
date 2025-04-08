use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;
use validator::Validate;
use chrono::{DateTime, Utc};
use mongodb::bson::{DateTime as BsonDateTime};
use std::time::SystemTime;

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct CalendarEvent {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[validate(length(min = 1, max = 100))]
    pub title: String,
    #[validate(length(min = 1, max = 500))]
    pub description: Option<String>,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub location: Option<String>,
    pub is_all_day: bool,
    pub recurrence_rule: Option<String>,
    pub attendees: Vec<String>,
    pub color: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct CalendarEventSchema {
    #[validate(length(min = 1, max = 100, message = "Title must be between 1 and 100 characters"))]
    pub title: String,
    #[validate(length(min = 1, message = "Description cannot be empty"))]
    pub description: String,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub location: Option<String>,
    pub color_id: Option<String>,
    pub is_all_day: bool,
    pub recurrence: Option<Vec<String>>,
    pub attendees: Option<Vec<String>>,
}

impl From<CalendarEventSchema> for CalendarEvent {
    fn from(schema: CalendarEventSchema) -> Self {
        CalendarEvent {
            id: None,
            title: schema.title,
            description: Some(schema.description),
            start_time: schema.start_time,
            end_time: schema.end_time,
            location: schema.location,
            is_all_day: schema.is_all_day,
            recurrence_rule: None,
            attendees: schema.attendees.unwrap_or_default(),
            color: schema.color_id,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct GoogleCalendarCredentials {
    #[validate(length(min = 1))]
    pub client_id: String,
    #[validate(length(min = 1))]
    pub client_secret: String,
    #[validate(length(min = 1))]
    pub redirect_uri: String,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct GoogleCalendarToken {
    #[validate(length(min = 1))]
    pub access_token: String,
    #[validate(length(min = 1))]
    pub refresh_token: String,
    pub expires_at: DateTime<Utc>,
}

impl CalendarEvent {
    pub fn new(
        title: String,
        description: Option<String>,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
        location: Option<String>,
        is_all_day: bool,
        recurrence_rule: Option<String>,
        attendees: Vec<String>,
        color: Option<String>,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: None,
            title,
            description,
            start_time,
            end_time,
            location,
            is_all_day,
            recurrence_rule,
            attendees,
            color,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn validate(&self) -> Result<(), String> {
        if self.start_time >= self.end_time {
            return Err("End time must be after start time".to_string());
        }
        self.validate().map_err(|e| e.to_string())
    }
}

impl From<CalendarEvent> for mongodb::bson::Document {
    fn from(event: CalendarEvent) -> Self {
        let mut doc = mongodb::bson::Document::new();
        if let Some(id) = event.id {
            doc.insert("_id", id);
        }
        doc.insert("title", event.title);
        if let Some(description) = event.description {
            doc.insert("description", description);
        }
        
        // Convert DateTime to SystemTime for MongoDB
        let start_time = SystemTime::UNIX_EPOCH + std::time::Duration::from_millis(event.start_time.timestamp_millis() as u64);
        let end_time = SystemTime::UNIX_EPOCH + std::time::Duration::from_millis(event.end_time.timestamp_millis() as u64);
        let created_at = SystemTime::UNIX_EPOCH + std::time::Duration::from_millis(event.created_at.timestamp_millis() as u64);
        let updated_at = SystemTime::UNIX_EPOCH + std::time::Duration::from_millis(event.updated_at.timestamp_millis() as u64);
        
        doc.insert("start_time", BsonDateTime::from(start_time));
        doc.insert("end_time", BsonDateTime::from(end_time));
        
        if let Some(location) = event.location {
            doc.insert("location", location);
        }
        doc.insert("is_all_day", event.is_all_day);
        if let Some(recurrence_rule) = event.recurrence_rule {
            doc.insert("recurrence_rule", recurrence_rule);
        }
        doc.insert("attendees", event.attendees);
        if let Some(color) = event.color {
            doc.insert("color", color);
        }
        doc.insert("created_at", BsonDateTime::from(created_at));
        doc.insert("updated_at", BsonDateTime::from(updated_at));
        doc
    }
}

impl TryFrom<mongodb::bson::Document> for CalendarEvent {
    type Error = mongodb::bson::document::ValueAccessError;

    fn try_from(doc: mongodb::bson::Document) -> Result<Self, Self::Error> {
        // Convert MongoDB DateTime to chrono DateTime
        let start_time = DateTime::<Utc>::from_timestamp_millis(doc.get_datetime("start_time")?.timestamp_millis()).unwrap_or_default();
        let end_time = DateTime::<Utc>::from_timestamp_millis(doc.get_datetime("end_time")?.timestamp_millis()).unwrap_or_default();
        let created_at = DateTime::<Utc>::from_timestamp_millis(doc.get_datetime("created_at")?.timestamp_millis()).unwrap_or_default();
        let updated_at = DateTime::<Utc>::from_timestamp_millis(doc.get_datetime("updated_at")?.timestamp_millis()).unwrap_or_default();
        
        Ok(CalendarEvent {
            id: doc.get_object_id("_id").ok().map(|id| id.clone()),
            title: doc.get_str("title")?.to_string(),
            description: doc.get_str("description").ok().map(|s| s.to_string()),
            start_time,
            end_time,
            location: doc.get_str("location").ok().map(|s| s.to_string()),
            is_all_day: doc.get_bool("is_all_day")?,
            recurrence_rule: doc.get_str("recurrence_rule").ok().map(|s| s.to_string()),
            attendees: doc.get_array("attendees")?.iter().map(|v| v.as_str().unwrap_or_default().to_string()).collect(),
            color: doc.get_str("color").ok().map(|s| s.to_string()),
            created_at,
            updated_at,
        })
    }
} 