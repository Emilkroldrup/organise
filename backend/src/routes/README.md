# Routes

This folder defines the HTTP routes (endpoints) for the Organise App backend.

## Contents

- **todo.rs:**  
  Implements API endpoints for managing todo items, including routes for retrieving all todos and creating a new todo.
- **mod.rs:**  
  Aggregates all route modules and provides a function to register them with the Actix Web application.

## Purpose

- **Separation of Concerns:** Isolates the HTTP handling layer from business logic.
- **Organization:** Provides a clear mapping between endpoints and their associated logic.
