# Organise App Backend

This is the backend for the Organise App, built in Rust using Actix Web. It provides a RESTful API that connects to MongoDB Atlas and serves data to the frontend. The project follows a modular design with a clear separation between configuration, database connectivity, models, routes, and business logic (services).

## Table of Contents

- [Organise App Backend](#organise-app-backend)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Setup \& Installation](#setup--installation)
  - [Folder Structure](#folder-structure)
  - [Usage](#usage)

## Requirements

- **Rust & Cargo:** Install via [rustup](https://rustup.rs/).
- **MongoDB Atlas:** An account with a valid connection URI.
- **.env File:** Contains environment variables (see [Setup & Installation](#setup--installation)).

## Setup & Installation

1. **Clone the Repository:**
    ```bash
    git clone
    cd backend
    ```

2. **Create a `.env` File:**

    Create a file named `.env` in the root of this folder and add:
    ```env
    MONGO_URI="mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority"
    PORT=8080
    ```

3. **Build and Run:**
    ```bash
    cargo build
    cargo run
    ```
    The server will run on the port specified in `.env` (default: 8080).

## Folder Structure

- **Cargo.toml:** Project metadata and dependency definitions.
- **.env:** Environment configuration (not committed to version control).
- **src/**: Contains the source code:
  - **main.rs:** Application entry point.
  - **lib.rs:** Central library file re-exporting modules.
  - **config.rs:** Configuration handling.
  - **models/**: Data model definitions.
  - **db/**: Database connection logic.
  - **routes/**: HTTP endpoint definitions.
  - **services/**: Business logic and core functionality.

## Usage

Run the backend server with:
```bash
cargo run
