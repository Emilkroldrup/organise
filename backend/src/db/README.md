# Database Module

This folder handles all database connectivity for the Organise App backend.

## Contents

- **connection.rs:**  
  Contains the logic to establish a connection to MongoDB Atlas using the connection string from the `.env` file. It sets up and returns a MongoDB client that is used throughout the application.

## Purpose

- **Encapsulation:** Keeps database-related code separate from business logic.
- **Maintainability:** Makes it easier to update or replace the database layer without affecting other parts of the project.
