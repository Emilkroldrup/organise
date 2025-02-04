use mongodb::{Client, bson::{doc, oid::ObjectId}};
use mongodb::error::Error;
use futures_util::TryStreamExt;
use crate::models::todo::Todo;

/// Retrieves all Todo documents from the MongoDB "todos" collection.
pub async fn get_all_todos(client: &Client) -> Result<Vec<Todo>, Error> {
    let db = client.database("organise");
    let collection = db.collection::<Todo>("todos");
    
    // Create a cursor to iterate over the todos.
    let mut cursor = collection.find(doc! {}).await?;
    let mut todos = Vec::new();
    
    // Collect all documents into a Vec<Todo>.
    while let Some(todo) = cursor.try_next().await? {
        todos.push(todo);
    }
    Ok(todos)
}

/// Inserts a new Todo document into the MongoDB "todos" collection.
pub async fn add_todo(client: &Client, mut todo: Todo) -> Result<(), Error> {
    let db = client.database("organise");
    let collection = db.collection::<Todo>("todos");
    
    // Ensure the todo has a unique ObjectId.
    todo.id = Some(ObjectId::new().to_hex());
    
    // Insert the new todo document.
    collection.insert_one(todo).await?;
    Ok(())
}
