use actix_web::{App, HttpServer};
use dotenv::dotenv;
use env_logger;
use std::env;
use utoipa_swagger_ui::SwaggerUi;

// Import your modules (adjust paths if needed)
use backend::db::connection;
use backend::routes;
use backend::ApiDoc;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let server_address = format!("0.0.0.0:{}", port);

    // Establish connection to MongoDB Atlas.
    let mongo_client = connection::establish_connection()
        .await
        .expect("Failed to initialize MongoDB client");

    println!("Starting server at {}", server_address);

    HttpServer::new(move || {
        App::new()
            // Make the MongoDB client available to all handlers.
            .app_data(actix_web::web::Data::new(mongo_client.clone()))
            // Register the Swagger UI service.
            .service(
                SwaggerUi::new("/docs")
                    .url("/api-doc/openapi.json", ApiDoc::openapi())
            )
            // Configure your API routes.
            .configure(routes::init_routes)
    })
    .bind(server_address)?
    .run()
    .await
}
