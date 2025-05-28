use actix_web::{get, post, put, patch, delete, web, HttpResponse, Responder};
use mongodb::Client;
use crate::services::todo_service;
use crate::models::todo::TodoSchema;
use validator::Validate;

#[get("/todos")]
async fn get_todos(db: web::Data<Client>) -> impl Responder {
    match todo_service::get_all_todos(&db).await {
        Ok(todos) => HttpResponse::Ok().json(todos),
        Err(e) => todo_service::error_response(e),
    }
}

#[post("/todos")]
async fn create_todo(db: web::Data<Client>, new_todo: web::Json<TodoSchema>) -> impl Responder {
    if let Err(validation_error) = new_todo.validate() {
        return HttpResponse::BadRequest().json(validation_error);
    }

    match todo_service::add_todo(&db, new_todo.into_inner().into()).await {
        Ok(_) => HttpResponse::Created().json("Todo created successfully"),
        Err(e) => todo_service::error_response(e),
    }
}

#[put("/todos/{id}")]
async fn edit_todo(
    db: web::Data<Client>,
    todo_id: web::Path<String>,
    updated_todo: web::Json<TodoSchema>,
) -> impl Responder {
    if let Err(validation_error) = updated_todo.validate() {
        return HttpResponse::BadRequest().json(validation_error);
    }

    match todo_service::update_todo(&db, &todo_id, updated_todo.into_inner().into()).await {
        Ok(_) => HttpResponse::Ok().json("Todo updated successfully"),
        Err(e) => todo_service::error_response(e),
    }
}

#[delete("/todos/{id}")]
async fn delete_todo(db: web::Data<Client>, todo_id: web::Path<String>) -> impl Responder {
    match todo_service::remove_todo(&db, &todo_id).await {
        Ok(_) => HttpResponse::Ok().json("Todo deleted successfully"),
        Err(e) => todo_service::error_response(e),
    }
}

#[patch("/todos/{id}/toggle")]
async fn toggle_todo_completion(db: web::Data<Client>, todo_id: web::Path<String>) -> impl Responder {
    match todo_service::set_todo_completion(&db, &todo_id).await {
        Ok(_) => HttpResponse::Ok().json("Todo completion status updated successfully"),
        Err(e) => todo_service::error_response(e),
    }
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_todos);
    cfg.service(create_todo);
    cfg.service(edit_todo);
    cfg.service(delete_todo);
    cfg.service(toggle_todo_completion);
}