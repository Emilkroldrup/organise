use mongodb::{Client, bson::{doc, oid::ObjectId}};
use mongodb::error::Error;
use futures_util::TryStreamExt;
use crate::models::note::Note;
use thiserror::Error;
use actix_web::HttpResponse;
use chrono::Utc;
use validator::Validate;

#[derive(Error, Debug)]
pub enum NotesServiceError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] Error),
    #[error("Invalid ObjectId: {0}")]
    InvalidObjectId(#[from] mongodb::bson::oid::Error),
    #[error("Note not found")]
    NoteNotFound,
    #[error("Validation error: {0}")]
    ValidationError(validator::ValidationErrors),
}

/// Retrieves all Note documents from the MongoDB "notes" collection.
pub async fn get_all_notes(client: &Client) -> Result<Vec<Note>, NotesServiceError> {
    let collection = get_notes_collection(client);
    let cursor = collection.find(doc! {}).await?;
    collect_notes(cursor).await.map_err(NotesServiceError::from)
}

/// Inserts a new Note document into the MongoDB "notes" collection.
pub async fn add_note(client: &Client, mut note: Note) -> Result<(), NotesServiceError> {
    if let Err(e) = note.validate() {
        return Err(NotesServiceError::ValidationError(e));
    }

    let collection = get_notes_collection(client);
    note.id = Some(ObjectId::new());
    note.created_at = Some(Utc::now().to_rfc3339());
    note.updated_at = Some(Utc::now().to_rfc3339());
    collection.insert_one(note).await?;
    Ok(())
}

/// Updates an existing Note document in the MongoDB "notes" collection.
pub async fn update_note(client: &Client, note_id: &str, mut updated_note: Note) -> Result<(), NotesServiceError> {
    if let Err(e) = updated_note.validate() {
        return Err(NotesServiceError::ValidationError(e));
    }

    let collection = get_notes_collection(client);
    let object_id = ObjectId::parse_str(note_id)?;
    let filter = doc! { "_id": object_id };
    
    // Check if note exists
    let existing_note = collection.find_one(filter.clone()).await?;
    if existing_note.is_none() {
        return Err(NotesServiceError::NoteNotFound);
    }

    updated_note.updated_at = Some(Utc::now().to_rfc3339());
    let update = doc! { 
        "$set": { 
            "title": updated_note.title, 
            "content": updated_note.content,
            "updated_at": updated_note.updated_at,
            "tags": updated_note.tags,
            "is_archived": updated_note.is_archived
        } 
    };
    collection.update_one(filter, update).await?;
    Ok(())
}

/// Removes an existing Note document from the MongoDB "notes" collection.
pub async fn remove_note(client: &Client, note_id: &str) -> Result<(), NotesServiceError> {
    let collection = get_notes_collection(client);
    let object_id = ObjectId::parse_str(note_id)?;
    let filter = doc! { "_id": object_id };
    
    // Check if note exists
    let existing_note = collection.find_one(filter.clone()).await?;
    if existing_note.is_none() {
        return Err(NotesServiceError::NoteNotFound);
    }

    collection.delete_one(filter).await?;
    Ok(())
}

/// Toggles the archive status of a note
pub async fn toggle_archive(client: &Client, note_id: &str) -> Result<(), NotesServiceError> {
    let collection = get_notes_collection(client);
    let object_id = ObjectId::parse_str(note_id)?;
    let filter = doc! { "_id": object_id };
    
    // Check if note exists
    let existing_note = collection.find_one(filter.clone()).await?;
    if existing_note.is_none() {
        return Err(NotesServiceError::NoteNotFound);
    }

    let update = doc! { 
        "$set": { 
            "is_archived": true,
            "updated_at": Utc::now().to_rfc3339()
        } 
    };
    collection.update_one(filter, update).await?;
    Ok(())
}

/// Helper function to get the "notes" collection.
fn get_notes_collection(client: &Client) -> mongodb::Collection<Note> {
    let db = client.database("organise");
    db.collection::<Note>("notes")
}

/// Helper function to collect notes from a cursor.
async fn collect_notes(mut cursor: mongodb::Cursor<Note>) -> Result<Vec<Note>, Error> {
    let mut notes = Vec::new();
    while let Some(note) = cursor.try_next().await? {
        notes.push(note);
    }
    Ok(notes)
}

// Custom function to convert NotesServiceError to HttpResponse
pub fn error_response(error: NotesServiceError) -> HttpResponse {
    match error {
        NotesServiceError::DatabaseError(e) => HttpResponse::InternalServerError().body(format!("Database error: {}", e)),
        NotesServiceError::InvalidObjectId(e) => HttpResponse::BadRequest().body(format!("Invalid ObjectId: {}", e)),
        NotesServiceError::NoteNotFound => HttpResponse::NotFound().body("Note not found"),
        NotesServiceError::ValidationError(e) => HttpResponse::BadRequest().json(e),
    }
} 