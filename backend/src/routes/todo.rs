use actix_web::{get, post, web, HttpResponse, Responder};
use mongodb::Client;

use crate::services::todo_service;
use crate::models::todo::Todo;

#[get("/todos")]
async fn get_todos(db: web::Data<Client>) -> impl Responder {
    match todo_service::get_all_todos(&db).await {
        Ok(todos) => HttpResponse::Ok().json(todos),
        Err(e) => HttpResponse::InternalServerError().body(format!("Error fetching todos: {:?}", e)),
    }
}

#[post("/todos")]
async fn create_todo(db: web::Data<Client>, new_todo: web::Json<Todo>) -> impl Responder {
    match todo_service::add_todo(&db, new_todo.into_inner()).await {
        Ok(_) => HttpResponse::Ok().body("Todo created successfully"),
        Err(e) => HttpResponse::InternalServerError().body(format!("Error creating todo: {:?}", e)),
    }
}

pub fn init_todo_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_todos);
    cfg.service(create_todo);
}
