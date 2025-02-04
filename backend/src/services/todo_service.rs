use mongodb::{Client, bson::{doc, oid::ObjectId}};
use mongodb::error::Error;
use futures_util::TryStreamExt;
use crate::models::todo::Todo;

/// Retrieves all Todo documents from the MongoDB "todos" collection.
pub async fn get_all_todos(client: &Client) -> Result<Vec<Todo>, Error> {
    let collection = get_todo_collection(client);
    let mut cursor = collection.find(doc! {}).await?;
    collect_todos(cursor).await
}

/// Inserts a new Todo document into the MongoDB "todos" collection.
pub async fn add_todo(client: &Client, mut todo: Todo) -> Result<(), Error> {
    let collection = get_todo_collection(client);
    todo.id = Some(ObjectId::new().to_hex());
    collection.insert_one(todo).await?;
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
