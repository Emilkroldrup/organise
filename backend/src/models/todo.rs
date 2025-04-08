use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct Todo {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[validate(length(min = 1, max = 100, message = "Title must be between 1 and 100 characters"))]
    pub title: String,
    #[validate(length(min = 1, message = "Description cannot be empty"))]
    pub description: String,
    pub completed: bool,
    #[validate(length(min = 1, message = "Priority cannot be empty"))]
    pub priority: String,
    pub created_at: String,
    pub updated_at: Option<String>,
}

impl From<TodoSchema> for Todo {
    fn from(schema: TodoSchema) -> Self {
        Todo {
            id: None,
            title: schema.title,
            description: schema.description,
            completed: schema.completed,
            priority: schema.priority,
            created_at: schema.created_at,
            updated_at: None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct TodoSchema {
    #[validate(length(min = 1, max = 100, message = "Title must be between 1 and 100 characters"))]
    pub title: String,
    #[validate(length(min = 1, message = "Description cannot be empty"))]
    pub description: String,
    pub completed: bool,
    #[validate(length(min = 1, message = "Priority cannot be empty"))]
    pub priority: String,
    pub created_at: String,
}
