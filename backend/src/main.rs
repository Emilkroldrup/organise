use actix_web::{web, App, HttpServer};
use dotenv::dotenv;
use env_logger;
use backend::routes;
use backend::db::connection;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let server_address = format!("0.0.0.0:{}", port);

    // Establish a connection to MongoDB Atlas.
    let mongo_client = connection::establish_connection()
        .await
        .expect("Failed to initialize MongoDB client");

    println!("Starting server at {}", server_address);

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(mongo_client.clone()))
            .configure(routes::init_routes)
    })
    .bind(server_address)?
    .run()
    .await
}
