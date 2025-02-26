use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct Todo {
    pub id: Option<String>,
    pub title: String,
    pub completed: bool,
}
