import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinGame.css';

const JoinGame = () => {
  const [activeGames, setActiveGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

<<<<<<< HEAD
  useEffect(() => {
    // Simulate fetching active games from an API
    const fetchActiveGames = async () => {
      setTimeout(() => {
        const games = [
          { id: '123456', name: 'Geography Trivia', host: 'Teacher1' },
          { id: '654321', name: 'Science Quiz', host: 'Teacher2' },
          { id: '112233', name: 'JavaScript Basics', host: 'Teacher3' },
        ];
        setActiveGames(games);
        setLoading(false);
      }, 1000);
    };

    fetchActiveGames();
  }, []);

  const handleJoinGame = (gameId) => {
    navigate(`/lobby/${gameId}`);
=======
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsJoining(true);
  
    if (!gameCode.trim() || !nickname.trim()) {
      setError('Game code and nickname are required');
      setIsJoining(false);
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/join-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameCode, nickname })
      });
  
      const result = await response.json();
  
      if (result.success) {
        sessionStorage.setItem('quizzlyPlayer', JSON.stringify({ gameCode, nickname }));
        navigate(`/lobby/${gameCode}`);
      } else {
        setError(result.error || 'Failed to join game');
      }
    } catch (err) {
      setError('Server error: ' + err.message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleGameCodeChange = (e) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
    setGameCode(value);
  };

  const handleNicknameChange = (e) => {
    // Limit nickname to 15 characters
    const value = e.target.value.slice(0, 15);
    setNickname(value);
>>>>>>> 3a42b00b54308718ad477c0eacaed296b7f0fd5a
  };

  return (
    <div className="join-game-page">
      <h1 className="page-title">Join a Game</h1>
      <div className="popout-window">
        {loading ? (
          <div className="loading">Loading active games...</div>
        ) : activeGames.length ? (
          <ul className="games-list">
            {activeGames.map((game) => (
              <li key={game.id} className="game-item">
                <div className="game-details">
                  <span className="game-name">{game.name}</span>
                  <span className="game-host">Host: {game.host}</span>
                </div>
                <button className="join-btn" onClick={() => handleJoinGame(game.id)}>
                  Join
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-games">No active games available.</div>
        )}
      </div>
    </div>
  );
};

export default JoinGame;
