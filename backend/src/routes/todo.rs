use actix_web::{get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Todo {
    pub id: Option<i32>,
    pub title: String,
    pub completed: bool,
}

#[get("/todos")]
async fn get_todos() -> impl Responder {
    HttpResponse::Ok().body("Get all todos")
}

#[post("/todos")]
async fn create_todo(todo: web::Json<Todo>) -> impl Responder {
    HttpResponse::Ok().body(format!("Create todo: {:?}", todo))
}

pub fn init_todo_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_todos);
    cfg.service(create_todo);
}
