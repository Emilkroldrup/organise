pub mod todo;
pub mod notes;
pub mod calendar;

use actix_web::web;

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .configure(todo::init_routes)
            .configure(notes::init_routes)
            .configure(calendar::init_routes)
    );
}
