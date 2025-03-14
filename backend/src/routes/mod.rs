pub mod todo;
pub mod notes;

use actix_web::web;

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .configure(todo::init_todo_routes)
            .configure(notes::init_routes)
    );
}
