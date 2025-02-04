
---

```md
# Source Code Overview

This folder contains the primary source code for the Organise App backend. The code is organized into several modules to promote separation of concerns and maintainability.

## Structure

- **main.rs:** The application entry point; it sets up the server, loads environment variables, and initializes the MongoDB client.
- **lib.rs:** Acts as the central library, re-exporting modules for easier testing and modularity.
- **config.rs:** Manages configuration (e.g., reading environment variables).
- **models/**: Defines data structures used throughout the app.
- **db/**: Contains logic for database connectivity.
- **routes/**: Defines HTTP endpoints and request handlers.
- **services/**: Contains business logic and functions that interact with the database.

Each subfolder below has its own README that provides more details.
