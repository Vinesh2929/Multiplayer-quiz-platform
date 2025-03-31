import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';
import JoinGame from './pages/JoinGame';

// Import other pages - add only the ones you've actually created files for
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import EditQuiz from './pages/EditQuiz';
import PlayQuiz from './pages/PlayQuiz';
import GameLobby from './pages/GameLobby';
import QuizResults from './pages/QuizResults';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/join" element={<JoinGame />} />
            
            {/* Add other routes only if you've created their components */}
            {/* Uncomment each route after you've created its component file */}
            
            { <Route path="/login" element={<Login />} /> }
            { <Route path="/register" element={<Register />} /> }
            { <Route path="/dashboard" element={<Dashboard />} /> }
            {<Route path="/create-quiz" element={<CreateQuiz />} /> }
            {<Route path="/edit-quiz/:id" element={<EditQuiz />} />}
            {/* <Route path="/play/:id" element={<PlayQuiz />} /> */}
            {/* <Route path="/lobby/:id" element={<GameLobby />} /> */}
            {/* <Route path="/results/:id" element={<QuizResults />} /> */}
            {/* <Route path="/404" element={<NotFound />} /> */}
            
            {/* This catch-all route must always be last */}
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;