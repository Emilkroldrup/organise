use actix_web::{get, post, put, delete, web, HttpResponse, Responder};
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::Document;
use mongodb::Client;
use serde::{Deserialize, Serialize};
use crate::models::note::Note;
use futures_util::TryStreamExt;

#[derive(Serialize, Deserialize)]
struct NoteData {
    title: String,
    content: String,
}

#[get("/notes")]
async fn get_notes(client: web::Data<Client>) -> impl Responder {
    let collection = client.database("organise").collection::<Note>("notes");
    let cursor = collection.find(Document::new()).await.unwrap();
    let notes: Vec<Note> = cursor.try_collect().await.unwrap();
    HttpResponse::Ok().json(notes)
}

#[post("/notes")]
async fn create_note(client: web::Data<Client>, note_data: web::Json<NoteData>) -> impl Responder {
    let collection = client.database("organise").collection::<Note>("notes");
    let new_note = Note::new(note_data.title.clone(), note_data.content.clone());
    let result = collection.insert_one(new_note).await.unwrap();
    HttpResponse::Ok().json(result.inserted_id)
}

#[put("/notes/{id}")]
async fn update_note(client: web::Data<Client>, note_id: web::Path<String>, note_data: web::Json<NoteData>) -> impl Responder {
    let collection = client.database("organise").collection::<Note>("notes");
    let id = ObjectId::parse_str(&*note_id).unwrap();
    let filter = doc! { "_id": id };
    let update = doc! {
        "$set": {
            "title": &note_data.title,
            "content": &note_data.content,
        }
    };
    let result = collection.update_one(filter, update).await.unwrap();
    HttpResponse::Ok().json(result.modified_count)
}

#[delete("/notes/{id}")]
async fn delete_note(client: web::Data<Client>, note_id: web::Path<String>) -> impl Responder {
    let collection = client.database("organise").collection::<Note>("notes");
    let id = ObjectId::parse_str(&*note_id).unwrap();
    let filter = doc! { "_id": id };
    let result = collection.delete_one(filter).await.unwrap();
    HttpResponse::Ok().json(result.deleted_count)
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_notes);
    cfg.service(create_note);
    cfg.service(update_note);
    cfg.service(delete_note);
}
