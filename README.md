# Samagama FAQ & AI Knowledge Platform

Welcome to the Samagama FAQ platform. This is a comprehensive, AI-driven knowledge base built using the MERN stack (MongoDB, Express, React, Node.js) with integrated Groq API for dynamic semantic search and AI automated response generation.

## Project Structure

This repository is organized into three main services:

- `/client` - The main user-facing frontend application (React, Vite). Features a dynamic Community Board, semantic search, and user SP tracking.
- `/admin` - The administrative dashboard (React, Vite). Used for moderating community questions, reviewing AI suggestions, and viewing system analytics.
- `/backend` - The API server (Node.js, Express, MongoDB). Handles authentication, semantic clustering using HNSW, database interactions, and Groq LLM integrations.
- `/Seed` - Contains testing scripts and seed data for the MongoDB database.

## Prerequisites

Make sure you have the following installed:
- Node.js (v18 or higher recommended)
- MongoDB (Local or Atlas cluster)
- A Groq API Key

## Environment Setup

You need to configure your environment variables before running the project. 

1. Navigate to the `/backend` directory.
2. Rename the provided `.env.example` file to `.env`.
3. Fill in your actual credentials (MongoDB URI, JWT secret, and Groq API key).

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/samagama

# Security
JWT_SECRET=your_super_secret_jwt_key

# AI / Inference Integration
GROQ_API_KEY=gsk_your_actual_key_here
```

*Note: Never commit your `.env` file to version control.*

## Installation & Running Locally

You will need to run three separate processes for the complete platform to function locally.

### 1. Start the Backend API
```bash
cd backend
npm install
npm run dev
```
*The backend will run on `http://localhost:5000`*

### 2. Start the Client Application
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
*The client app will run on `http://localhost:3000`*

### 3. Start the Admin Dashboard
Open a third terminal window:
```bash
cd admin
npm install
npm run dev
```
*The admin panel will run on `http://localhost:3001`*

## Features

- **Semantic Search**: Utilizes `Xenova/all-MiniLM-L6-v2` local embeddings combined with MongoDB Vector Search to instantly find the most relevant FAQs.
- **AI Master Generator**: Leverages the Groq API to automatically cluster un-answered community questions and draft comprehensive "Master FAQs".
- **Dynamic Analytics**: Real-time aggregation of question status, volume trends, and active categories via the Admin panel using Recharts.
- **Gamification (SP Ledger)**: Users earn Samagama Points (SP) for asking and answering questions, validated through the Admin moderation queue.

## License
Proprietary / Private Repository. Do not distribute without permission.
