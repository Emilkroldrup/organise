# Models

This folder contains data model definitions for the Organise App backend. Models represent the data structures used to communicate with the database and the API.

## Example

- **todo.rs:**  
  Defines the `Todo` struct, which typically includes fields such as:
  - `id`: Unique identifier (stored as an `Option<String>` to accommodate MongoDB ObjectIds).
  - `title`: The title or description of the todo.
  - `completed`: A boolean indicating whether the todo is completed.

Models use Serde for serialization and deserialization.
