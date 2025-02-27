use actix_web::{get, post, put, delete, web, HttpResponse, Responder};
use mongodb::Client;
use utoipa::OpenApi;

use crate::services::todo_service;
use crate::models::todo::TodoSchema;

#[derive(OpenApi)]
#[openapi(
    paths(get_todos, create_todo, edit_todo, delete_todo),
    components(schemas(TodoSchema)),
    servers(
        (url = "/api", description = "Base URL for API endpoints")
    )
)]
pub struct ApiDoc;

#[utoipa::path(get, path = "/todos", responses((status = 200, description = "List all todos", body = [TodoSchema])))]
#[get("/todos")]
async fn get_todos(db: web::Data<Client>) -> impl Responder {
    match todo_service::get_all_todos(&db).await {
        Ok(todos) => HttpResponse::Ok().json(todos),
        Err(e) => HttpResponse::InternalServerError().body(format!("Error fetching todos: {:?}", e)),
    }
}

#[utoipa::path(post, path = "/todos", request_body = TodoSchema, responses((status = 200, description = "Create a new todo")))]
#[post("/todos")]
async fn create_todo(db: web::Data<Client>, new_todo: web::Json<TodoSchema>) -> impl Responder {
    match todo_service::add_todo(&db, new_todo.into_inner().into()).await {
        Ok(_) => HttpResponse::Ok().body("Todo created successfully"),
        Err(e) => HttpResponse::InternalServerError().body(format!("Error creating todo: {:?}", e)),
    }
}

#[utoipa::path(put, path = "/todos/{id}", request_body = TodoSchema, responses((status = 200, description = "Edit a todo")))]
#[put("/todos/{id}")]
async fn edit_todo(db: web::Data<Client>, todo_id: web::Path<String>, updated_todo: web::Json<TodoSchema>) -> impl Responder {
    match todo_service::update_todo(&db, &todo_id, updated_todo.into_inner().into()).await {
        Ok(_) => HttpResponse::Ok().body("Todo updated successfully"),
        Err(e) => HttpResponse::InternalServerError().body(format!("Error updating todo: {:?}", e)),
    }
}

#[utoipa::path(delete, path = "/todos/{id}", responses((status = 200, description = "Delete a todo")))]
#[delete("/todos/{id}")]
async fn delete_todo(db: web::Data<Client>, todo_id: web::Path<String>) -> impl Responder {
    match todo_service::remove_todo(&db, &todo_id).await {
        Ok(_) => HttpResponse::Ok().body("Todo deleted successfully"),
        Err(e) => HttpResponse::InternalServerError().body(format!("Error deleting todo: {:?}", e)),
    }
}

pub fn init_todo_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_todos);
    cfg.service(create_todo);
    cfg.service(edit_todo);
    cfg.service(delete_todo);
}

// Additional error handling
impl From<todo_service::TodoServiceError> for HttpResponse {
    fn from(error: todo_service::TodoServiceError) -> Self {
        match error {
            todo_service::TodoServiceError::DatabaseError(e) => HttpResponse::InternalServerError().body(format!("Database error: {}", e)),
            todo_service::TodoServiceError::InvalidObjectId(e) => HttpResponse::BadRequest().body(format!("Invalid ObjectId: {}", e)),
        }
    }
}
