use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use mongodb::bson::oid::ObjectId;

#[derive(Debug, Serialize, Deserialize)]
pub struct Todo {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub title: String,
    pub description: String,
    pub completed: bool,
    pub priority: String,
    pub created_at: String,
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
        }
    }
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct TodoSchema {
    pub title: String,
    pub description: String,
    pub completed: bool,
    pub priority: String,
    pub created_at: String,
}
