mod config;
mod routes;
mod models;
mod db;

use actix_web::{web, App, HttpServer};
use dotenv::dotenv;
use env_logger;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables from a .env file
    dotenv().ok();
    // Initialize logger
    env_logger::init();

    // Read port from environment or default to 8080
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let server_address = format!("0.0.0.0:{}", port);

    println!("Starting server at {}", server_address);

    HttpServer::new(|| {
        App::new()
            .configure(routes::init_routes)
    })
    .bind(server_address)?
    .run()
    .await
}
