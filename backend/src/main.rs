use actix_cors::Cors;
use actix_web::{App, HttpServer};
use dotenv::dotenv;
use env_logger;
use std::env;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use backend::db::connection;
use backend::routes;
use backend::routes::todo::ApiDoc;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let server_address = format!("0.0.0.0:{}", port);

    let mongo_client = connection::establish_connection()
        .await
        .expect("Failed to initialize MongoDB client");

    println!("Starting server at {}", server_address);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        App::new()
            .app_data(actix_web::web::Data::new(mongo_client.clone()))
            .configure(routes::init_routes)
            .service(SwaggerUi::new("/api-docs/{_:.*}").url("/api-doc/openapi.json", ApiDoc::openapi()))
            .wrap(cors)
    })
    .bind(server_address)?
    .run()
    .await
}
