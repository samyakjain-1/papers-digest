# arXiv Paper Digest

This project is a web application for browsing, saving, and understanding research papers from the arXiv API. It provides a personalized feed for logged-in users, AI-powered abstract simplification, and vector-based similarity search to discover related papers.

## Features

- **Browse Papers**: Fetch and browse the latest papers from the arXiv API.
- **Search and Filter**: Search for papers by title or abstract, and sort by date or relevance.
- **User Authentication**: Sign up, log in, and manage your user session.
- **Save Papers**: Logged-in users can save their favorite papers to a personalized feed.
- **AI-Powered Abstract Simplification**: Generate a simplified, easy-to-understand summary of any paper's abstract using OpenAI's GPT-4o.
- **Vector-Based Similarity Search**: Find semantically similar papers using vector embeddings and MongoDB Atlas Vector Search.
- **Personalized Feed**: For logged-in users, the home page displays a personalized feed of papers similar to their saved papers.

## Architecture

The application is built with the **Modelence** framework, which provides a modular architecture for both the frontend and backend.

-   **Backend**: The backend is a Node.js application that uses a modular structure. The core logic is encapsulated in the `paper` module, which handles all paper-related functionality, including data fetching, database operations, and AI-powered features.
-   **Frontend**: The frontend is a React application that uses React Router for navigation and TanStack Query for data fetching and state management. The UI is built with Tailwind CSS.
-   **Database**: The application uses MongoDB as its database, with MongoDB Atlas Vector Search for the similarity search feature.

## Technical Implementation

### Data Fetching

-   The application fetches the latest papers from the arXiv API in the AI, Machine Learning, and Computation and Language categories.
-   The `fetchAndInsertPapers` function in `src/server/paper/actions/fetch.ts` handles the data fetching process. It parses the XML response from the arXiv API and uses an upsert operation to add new papers to the database and update existing ones.

### AI-Powered Features

-   **Abstract Simplification**: The `simplifyAbstract` function in `src/server/paper/actions/simplify.ts` uses the OpenAI API with the `gpt-4o` model to generate a simplified summary of a paper's abstract. The prompt is carefully engineered to produce a clear and easy-to-understand summary for a non-technical audience.
-   **Vector Embeddings**: The `embedPaper` and `embedAllPapers` functions in `src/server/paper/actions/embed.ts` use the OpenAI API with the `text-embedding-ada-002` model to generate vector embeddings for the paper abstracts. These embeddings are stored in the `embedding` field in the database.
-   **Similarity Search**: The `findSimilarPapers` function in `src/server/paper/actions/similar.ts` uses a MongoDB Atlas Vector Search index to find papers with similar abstracts. It performs a k-NN search on the `embedding` field and returns a list of the most similar papers.

## Setup and Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/samyakjain-1/papers-digest.git
    cd papers-digest
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.modelence.env` file in the `papers` directory and add the following environment variables:

    ```env
    MONGODB_URI="your_mongodb_atlas_connection_string"
    OPENAI_API_KEY="your_openai_api_key"
    ```

4.  **Create a MongoDB Atlas Vector Search Index**:
    *   In your MongoDB Atlas dashboard, navigate to the "Search" tab for your `papers` collection.
    *   Create a new search index with the following JSON configuration:
        ```json
        {
          "mappings": {
            "dynamic": false,
            "fields": {
              "embedding": {
                "type": "knnVector",
                "dimensions": 1536,
                "similarity": "cosine"
              }
            }
          }
        }
        ```

5.  **Start the development server**:
    ```bash
    npm run dev
    ```

## Usage

1.  **Fetch Papers**:
    *   On the home page, click the "Fetch Latest Papers" button to populate the database with the latest papers from the arXiv API.

2.  **Generate Embeddings**:
    *   To enable the similarity search, you need to generate embeddings for the papers. Click the "Generate All Embeddings" button on the home page to start this process. This may take some time.

3.  **Explore**:
    *   You can now browse, search, and save papers. Log in to access your personalized feed and save your favorite papers.
