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

## Tech Stack

- **Framework**: [Modelence](https://modelence.com)
- **Frontend**: React, React Router, TanStack Query, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB with Atlas Vector Search
- **AI**: OpenAI API for embeddings and text generation

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
