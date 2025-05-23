import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinGame.css';

const JoinGame = () => {
  const [activeGames, setActiveGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
