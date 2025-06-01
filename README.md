# Project Setup and Running Instructions

This project consists of a client (Next.js) and server (Node.js/Express) application.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- TypeScript

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd <project-directory>
```

2. **Install Server Dependencies**
```bash
cd server
npm install
```

3. **Install Client Dependencies**
```bash
cd client
npm install
```

## Configuration

1. Create a `.env` file in the root directory using the provided `.env.example` template
2. Update the environment variables according to your setup

## Running the Application

1. **Start the Server**
```bash
cd server
npm run dev
```
The server will start on http://localhost:3000

2. **Start the Client**
```bash
cd client
npm run dev
```
The client will start on http://localhost:3001

## Project Structure

```
├── client/                 # Next.js frontend
│   ├── public/            # Static files
│   └── src/              
│       ├── pages/         # Next.js pages
│       └── styles/        # CSS styles
│
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── db.ts            # Database configuration
│
└── .env                  # Environment variables
```

## Available API Endpoints

- `/api/auth` - Authentication routes
- `/api/files` - File management
- `/api/upload` - File upload
- `/api/admin` - Admin routes

## Environment Variables

See `.env.example` for required environment variables...
