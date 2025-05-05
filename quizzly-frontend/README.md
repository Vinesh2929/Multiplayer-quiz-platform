# Real-Time Multiplayer Quiz Application

A web-based, real-time, multiplayer quiz platform inspired by Kahoot, built with a React (Vite) frontend and a C++ backend server using Boost.Beast and MongoDB.

This project was developed as a final project for SE3313 (Software Engineering) at Western University.

## 🚀 Features

- User account registration and login (with bcrypt password hashing)
- Quiz creation, editing, and management
- Hosting and joining live quiz sessions via lobby codes
- Real-time gameplay using WebSocket communication
- Dynamic score updates and live leaderboard
- Concurrency management with C++ threads and mutexes
- Persistent data storage with MongoDB

## 🛠️ Technology Stack

- **Frontend:** React (Vite)
- **Backend:** C++ (httplib, Boost.Beast, MongoDB C++ Driver)
- **Database:** MongoDB
- **Protocols:** HTTP (for API endpoints), WebSockets (for real-time multiplayer communication)

## 💻 How to Run

### Prerequisites

- Node.js and npm
- C++ compiler with C++17 support
- MongoDB installed and running
- Boost libraries installed
- CMake (for C++ backend build)

### Running the Frontend

1. Navigate to the `frontend/` directory
2. Install dependencies:

```bash
npm install
