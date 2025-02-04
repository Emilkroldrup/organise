use mongodb::{Client, options::ClientOptions};
use std::env;

/// Asynchronously establishes a connection to MongoDB using the MONGO_URI environment variable.
pub async fn establish_connection() -> mongodb::error::Result<Client> {
    // Load the MongoDB URI from the environment variable.
    let uri = env::var("MONGO_URI")
        .expect("MONGO_URI environment variable not set");
    
    // Parse the connection string into client options.
    let mut client_options = ClientOptions::parse(&uri).await?;
    
    // Optionally, set an application name.
    client_options.app_name = Some("OrganiseApp".to_string());
    
    // Create the MongoDB client with the specified options.
    let client = Client::with_options(client_options)?;
    
    println!("Successfully connected to MongoDB");

    Ok(client)
}
