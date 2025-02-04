# Services

This folder contains the business logic for the Organise App backend. Services abstract core functionalities and operations, keeping them separate from the HTTP layer.

## Contents

- **todo_service.rs:**  
  Implements functions to handle operations for todo items, such as:
  - Retrieving all todo items from the database.
  - Inserting new todo items into the database.

## Purpose

- **Modularity:** Isolates business logic from route handlers, which simplifies testing and future enhancements.
- **Reusability:** Centralizes core functionalities so they can be reused across different parts of the application.
