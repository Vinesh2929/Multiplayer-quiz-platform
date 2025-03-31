import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinGame.css';

const JoinGame = () => {
  const [gameCode, setGameCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!gameCode.trim()) {
      return setError('Please enter a game code');
    }

    if (!nickname.trim()) {
      return setError('Please enter a nickname');
    }

    // In a real app, you would validate the game code with your backend
    setIsJoining(true);

    // Simulate API call to join game
    setTimeout(() => {
      // For demo purposes, let's say any 6-digit code works
      if (gameCode.length === 6 && /^\d+$/.test(gameCode)) {
        // Store player info in session storage
        sessionStorage.setItem('quizzlyPlayer', JSON.stringify({
          nickname,
          gameCode
        }));
        
        // Navigate to game lobby
        navigate(`/lobby/${gameCode}`);
      } else {
        setError('Invalid game code. Please check and try again.');
        setIsJoining(false);
      }
    }, 1500);
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
  };

  return (
    <div className="join-game-container">
      <div className="join-game-card">
        <h1 className="join-title">Join a Game</h1>
        
        {error && <div className="join-error">{error}</div>}
        
        <form className="join-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="gameCode" className="form-label">Game Code</label>
            <div className="game-code-input">
              <input
                type="text"
                id="gameCode"
                className="form-control"
                value={gameCode}
                onChange={handleGameCodeChange}
                placeholder="Enter 6-digit code"
                maxLength="6"
                autoComplete="off"
                disabled={isJoining}
              />
            </div>
            <div className="input-hint">Ask your teacher or host for the 6-digit game code</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="nickname" className="form-label">Your Nickname</label>
            <input
              type="text"
              id="nickname"
              className="form-control"
              value={nickname}
              onChange={handleNicknameChange}
              placeholder="Enter a nickname"
              maxLength="15"
              autoComplete="off"
              disabled={isJoining}
            />
            <div className="input-hint">This is how you'll appear on the leaderboard</div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-lg btn-block join-button"
            disabled={isJoining}
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </button>
        </form>
        
        <div className="join-info">
          <h3>How to Play</h3>
          <ol className="steps-list">
            <li>Enter the game code provided by your host</li>
            <li>Choose a nickname to appear on the leaderboard</li>
            <li>Click "Join Game" to enter the lobby</li>
            <li>Wait for the host to start the game</li>
            <li>Answer questions as quickly as you can to earn points</li>
          </ol>
        </div>
        
        <div className="create-your-own">
          <p>Want to create your own quiz?</p>
          <a href="/register" className="btn btn-outline">Sign Up Now</a>
        </div>
      </div>
      
      <div className="recent-games">
        <h2>Recently Played Games</h2>
        <div className="recent-games-list">
          <div className="recent-game">
            <div className="recent-game-icon">🌍</div>
            <div className="recent-game-info">
              <h3>Geography Trivia</h3>
              <p>Played 2 days ago</p>
            </div>
            <button className="btn btn-sm btn-outline">Play Again</button>
          </div>
          
          <div className="recent-game">
            <div className="recent-game-icon">🧪</div>
            <div className="recent-game-info">
              <h3>Science Quiz</h3>
              <p>Played 5 days ago</p>
            </div>
            <button className="btn btn-sm btn-outline">Play Again</button>
          </div>
          
          <div className="recent-game">
            <div className="recent-game-icon">💻</div>
            <div className="recent-game-info">
              <h3>JavaScript Basics</h3>
              <p>Played 1 week ago</p>
            </div>
            <button className="btn btn-sm btn-outline">Play Again</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinGame;