mod config;
mod routes;
mod models;
mod db;

use actix_web::{web, App, HttpServer};
use dotenv::dotenv;
use env_logger;
use db::connection;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables from the .env file.
    dotenv().ok();
    env_logger::init();

    // Read the port number from the environment (or default to 8080).
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let server_address = format!("0.0.0.0:{}", port);

    // Establish a connection to MongoDB Atlas.
    let mongo_client = connection::establish_connection()
        .await
        .expect("Failed to initialize MongoDB client");

    println!("Starting server at {}", server_address);

    HttpServer::new(move || {
        App::new()
            // Add MongoDB client as shared state.
            .app_data(web::Data::new(mongo_client.clone()))
            .configure(routes::init_routes)
    })
    .bind(server_address)?
    .run()
    .await
}
