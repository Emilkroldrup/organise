use mongodb::bson::{doc, oid::ObjectId};
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct Note {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[validate(length(min = 1, max = 100, message = "Title must be between 1 and 100 characters"))]
    pub title: String,
    #[validate(length(min = 1, message = "Content cannot be empty"))]
    pub content: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub tags: Option<Vec<String>>,
    pub is_archived: Option<bool>,
    pub user_id: Option<String>,
}

impl Note {
    pub fn new(title: String, content: String) -> Self {
        Note {
            id: None,
            title,
            content,
            created_at: None,
            updated_at: None,
            tags: Some(Vec::new()),
            is_archived: Some(false),
            user_id: None,
        }
    }
}
