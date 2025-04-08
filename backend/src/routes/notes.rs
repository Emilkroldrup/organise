use actix_web::{get, post, put, delete, web, HttpResponse, Responder};
use mongodb::Client;
use serde::{Deserialize, Serialize};
use crate::models::note::Note;
use crate::services::notes_service;
use validator::Validate;

#[derive(Serialize, Deserialize)]
struct NoteData {
    title: String,
    content: String,
    tags: Option<Vec<String>>,
}

#[get("/notes")]
async fn get_notes(client: web::Data<Client>) -> impl Responder {
    match notes_service::get_all_notes(&client).await {
        Ok(notes) => HttpResponse::Ok().json(notes),
        Err(e) => notes_service::error_response(e),
    }
}

#[post("/notes")]
async fn create_note(client: web::Data<Client>, note_data: web::Json<NoteData>) -> impl Responder {
    let new_note = Note::new(note_data.title.clone(), note_data.content.clone());
    
    if let Err(validation_error) = new_note.validate() {
        return HttpResponse::BadRequest().json(validation_error);
    }

    match notes_service::add_note(&client, new_note).await {
        Ok(_) => HttpResponse::Created().json("Note created successfully"),
        Err(e) => notes_service::error_response(e),
    }
}

#[put("/notes/{id}")]
async fn update_note(
    client: web::Data<Client>,
    note_id: web::Path<String>,
    note_data: web::Json<NoteData>,
) -> impl Responder {
    let updated_note = Note::new(note_data.title.clone(), note_data.content.clone());
    
    if let Err(validation_error) = updated_note.validate() {
        return HttpResponse::BadRequest().json(validation_error);
    }

    match notes_service::update_note(&client, &note_id, updated_note).await {
        Ok(_) => HttpResponse::Ok().json("Note updated successfully"),
        Err(e) => notes_service::error_response(e),
    }
}

#[delete("/notes/{id}")]
async fn delete_note(client: web::Data<Client>, note_id: web::Path<String>) -> impl Responder {
    match notes_service::remove_note(&client, &note_id).await {
        Ok(_) => HttpResponse::Ok().json("Note deleted successfully"),
        Err(e) => notes_service::error_response(e),
    }
}

#[post("/notes/{id}/archive")]
async fn archive_note(client: web::Data<Client>, note_id: web::Path<String>) -> impl Responder {
    match notes_service::toggle_archive(&client, &note_id).await {
        Ok(_) => HttpResponse::Ok().json("Note archived successfully"),
        Err(e) => notes_service::error_response(e),
    }
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_notes);
    cfg.service(create_note);
    cfg.service(update_note);
    cfg.service(delete_note);
    cfg.service(archive_note);
}
