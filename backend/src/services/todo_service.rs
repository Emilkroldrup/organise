use mongodb::{Client, bson::{doc, oid::ObjectId}};
use mongodb::error::Error;
use futures_util::TryStreamExt;
use crate::models::todo::Todo;
use thiserror::Error;
use actix_web::HttpResponse;
use chrono::Utc;
use validator::Validate;

#[derive(Error, Debug)]
pub enum TodoServiceError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] Error),
    #[error("Invalid ObjectId: {0}")]
    InvalidObjectId(#[from] mongodb::bson::oid::Error),
    #[error("Todo not found")]
    TodoNotFound,
    #[error("Validation error: {0}")]
    ValidationError(validator::ValidationErrors),
}

/// Retrieves all Todo documents from the MongoDB "todos" collection.
pub async fn get_all_todos(client: &Client) -> Result<Vec<Todo>, TodoServiceError> {
    let collection = get_todo_collection(client);
    let cursor = collection.find(doc! {}).await?;
    collect_todos(cursor).await.map_err(TodoServiceError::from)
}

/// Inserts a new Todo document into the MongoDB "todos" collection.
pub async fn add_todo(client: &Client, mut todo: Todo) -> Result<(), TodoServiceError> {
    if let Err(e) = todo.validate() {
        return Err(TodoServiceError::ValidationError(e));
    }

    let collection = get_todo_collection(client);
    todo.id = Some(ObjectId::new());
    todo.created_at = Utc::now().to_rfc3339();
    todo.updated_at = Some(Utc::now().to_rfc3339());
    collection.insert_one(todo).await?;
    Ok(())
}

/// Updates an existing Todo document in the MongoDB "todos" collection.
pub async fn update_todo(client: &Client, todo_id: &str, mut updated_todo: Todo) -> Result<(), TodoServiceError> {
    if let Err(e) = updated_todo.validate() {
        return Err(TodoServiceError::ValidationError(e));
    }

    let collection = get_todo_collection(client);
    let object_id = ObjectId::parse_str(todo_id)?;
    let filter = doc! { "_id": object_id };
    
    // Check if todo exists
    let existing_todo = collection.find_one(filter.clone()).await?;
    if existing_todo.is_none() {
        return Err(TodoServiceError::TodoNotFound);
    }

    updated_todo.updated_at = Some(Utc::now().to_rfc3339());
    let update = doc! { 
        "$set": { 
            "title": updated_todo.title, 
            "description": updated_todo.description, 
            "completed": updated_todo.completed, 
            "priority": updated_todo.priority,
            "updated_at": updated_todo.updated_at
        } 
    };
    collection.update_one(filter, update).await?;
    Ok(())
}

/// Removes an existing Todo document from the MongoDB "todos" collection.
pub async fn remove_todo(client: &Client, todo_id: &str) -> Result<(), TodoServiceError> {
    let collection = get_todo_collection(client);
    let object_id = ObjectId::parse_str(todo_id)?;
    let filter = doc! { "_id": object_id };
    
    // Check if todo exists
    let existing_todo = collection.find_one(filter.clone()).await?;
    if existing_todo.is_none() {
        return Err(TodoServiceError::TodoNotFound);
    }

    collection.delete_one(filter).await?;
    Ok(())
}

/// Sets the completion status of an existing Todo document in the MongoDB "todos" collection.
pub async fn set_todo_completion(client: &Client, todo_id: &str) -> Result<(), TodoServiceError> {
    let collection = get_todo_collection(client);
    let object_id = ObjectId::parse_str(todo_id)?;
    let filter = doc! { "_id": object_id };
    
    // Check if todo exists
    let existing_todo = collection.find_one(filter.clone()).await?;
    if existing_todo.is_none() {
        return Err(TodoServiceError::TodoNotFound);
    }

    let update = doc! { 
        "$set": { 
            "completed": true,
            "updated_at": Utc::now().to_rfc3339()
        } 
    };
    collection.update_one(filter, update).await?;
    Ok(())
}

/// Helper function to get the "todos" collection.
fn get_todo_collection(client: &Client) -> mongodb::Collection<Todo> {
    let db = client.database("organise");
    db.collection::<Todo>("todos")
}

/// Helper function to collect todos from a cursor.
async fn collect_todos(mut cursor: mongodb::Cursor<Todo>) -> Result<Vec<Todo>, Error> {
    let mut todos = Vec::new();
    while let Some(todo) = cursor.try_next().await? {
        todos.push(todo);
    }
    Ok(todos)
}

// Custom function to convert TodoServiceError to HttpResponse
pub fn error_response(error: TodoServiceError) -> HttpResponse {
    match error {
        TodoServiceError::DatabaseError(e) => HttpResponse::InternalServerError().body(format!("Database error: {}", e)),
        TodoServiceError::InvalidObjectId(e) => HttpResponse::BadRequest().body(format!("Invalid ObjectId: {}", e)),
        TodoServiceError::TodoNotFound => HttpResponse::NotFound().body("Todo not found"),
        TodoServiceError::ValidationError(e) => HttpResponse::BadRequest().json(e),
    }
}
