import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GameLobby.css';

const GameLobby = () => {
  const { id: gameCode } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [hostInfo, setHostInfo] = useState({
    name: 'Quiz Host',
    avatar: '👨‍🏫'
  });
  const [quizInfo, setQuizInfo] = useState({
    title: 'Awesome Quiz',
    description: 'Get ready for an exciting challenge!',
    questions: 10
  });
  const [countdown, setCountdown] = useState(null);
  const [playerNickname, setPlayerNickname] = useState('');
  
  // Load player info from session storage
  useEffect(() => {
    const storedPlayer = sessionStorage.getItem('quizzlyPlayer');
    if (!storedPlayer) {
      // Redirect to join page if no player info exists
      navigate('/join');
      return;
    }
    
    const playerData = JSON.parse(storedPlayer);
    if (playerData.gameCode !== gameCode) {
      // Redirect if game codes don't match
      navigate('/join');
      return;
    }
    
    setPlayerNickname(playerData.nickname);
    
    // Mock fetching game data
    fetchGameData();
    
    // Start player polling
    const interval = setInterval(updatePlayers, 3000);
    return () => clearInterval(interval);
  }, [gameCode, navigate]);
  
  // Simulate fetching game data
  const fetchGameData = () => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setHostInfo({
        name: 'Professor Smith',
        avatar: '👨‍🏫'
      });
      
      setQuizInfo({
        title: 'Science Quiz: The Basics',
        description: 'Test your knowledge of fundamental scientific concepts.',
        questions: 15
      });
      
      // Initial players
      setPlayers([
        { id: 1, nickname: 'ScienceWhiz', avatar: '🧠', isReady: true },
        { id: 2, nickname: 'QuizMaster', avatar: '🏆', isReady: true },
        { id: 3, nickname: playerNickname || 'You', avatar: '😎', isReady: true, isYou: true },
        { id: 4, nickname: 'BrainiacGamer', avatar: '🎮', isReady: false }
      ]);
    }, 1000);
  };
  
  // Simulate player updates
  const updatePlayers = () => {
    if (countdown !== null) return; // Don't update during countdown
    
    // Randomly add a player sometimes
    if (players.length < 8 && Math.random() > 0.6) {
      const avatars = ['🦊', '🐱', '🐶', '🦁', '🐼', '🐯', '🦄', '🐢', '🦖', '🐬'];
      const names = ['QuizKid', 'BrainPower', 'ThinkTank', 'MindMaster', 'QuizWizard', 'GameChamp', 'BrainStorm', 'TriviaAce'];
      
      const newPlayer = {
        id: Date.now(),
        nickname: names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100),
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        isReady: Math.random() > 0.3
      };
      
      setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
    }
    
    // Toggle ready status for existing players
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.isYou) return player;
        if (Math.random() > 0.8) {
          return {...player, isReady: !player.isReady};
        }
        return player;
      })
    );
    
    // Simulate game starting after enough players
    if (players.length >= 4 && players.every(p => p.isReady) && Math.random() > 0.7) {
      startCountdown();
    }
  };
  
  const startCountdown = () => {
    setCountdown(5);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to game
          navigate(`/play/${gameCode}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const toggleReady = () => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.isYou ? {...player, isReady: !player.isReady} : player
      )
    );
  };
  
  const leaveGame = () => {
    sessionStorage.removeItem('quizzlyPlayer');
    navigate('/join');
  };
  
  const currentPlayer = players.find(p => p.isYou);
  
  return (
    <div className="game-lobby">
      {countdown !== null && (
        <div className="countdown-overlay">
          <div className="countdown-content">
            <h2>Game Starting in</h2>
            <div className="countdown-number">{countdown}</div>
            <p>Get ready!</p>
          </div>
        </div>
      )}
      
      <div className="lobby-header">
        <div className="game-info">
          <h1>{quizInfo.title}</h1>
          <p className="game-description">{quizInfo.description}</p>
          <div className="game-meta">
            <span className="game-code">Game Code: <strong>{gameCode}</strong></span>
            <span className="question-count">{quizInfo.questions} Questions</span>
          </div>
        </div>
        
        <div className="host-info">
          <div className="host-avatar">{hostInfo.avatar}</div>
          <div className="host-details">
            <span className="host-label">Host</span>
            <h3 className="host-name">{hostInfo.name}</h3>
          </div>
        </div>
      </div>
      
      <div className="lobby-content">
        <div className="lobby-main">
          <h2>Waiting for Players ({players.length})</h2>
          <p className="lobby-instruction">Game will start when all players are ready</p>
          
          <div className="players-grid">
            {players.map(player => (
              <div 
                key={player.id} 
                className={`player-card ${player.isReady ? 'ready' : 'not-ready'} ${player.isYou ? 'is-you' : ''}`}
              >
                <div className="player-avatar">{player.avatar}</div>
                <div className="player-name">{player.nickname} {player.isYou && '(You)'}</div>
                <div className="player-status">
                  {player.isReady ? 'Ready ✓' : 'Not Ready...'}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lobby-sidebar">
          <div className="player-info">
            <div className="player-avatar large">{currentPlayer?.avatar || '😎'}</div>
            <h3 className="player-name">{playerNickname}</h3>
            <div className="player-status-badge">
              {currentPlayer?.isReady ? 'Ready to Play' : 'Not Ready'}
            </div>
          </div>
          
          <div className="lobby-actions">
            <button 
              className={`btn ${currentPlayer?.isReady ? 'btn-outline' : 'btn-primary'} btn-block`}
              onClick={toggleReady}
            >
              {currentPlayer?.isReady ? 'Cancel Ready' : 'Ready Up'}
            </button>
            
            <button 
              className="btn btn-outline btn-block"
              onClick={leaveGame}
            >
              Leave Game
            </button>
          </div>
          
          <div className="lobby-rules">
            <h3>How to Play</h3>
            <ul>
              <li>Questions appear on screen for everyone at the same time</li>
              <li>Answer as quickly as you can - speed matters!</li>
              <li>Correct answers earn points based on speed</li>
              <li>The faster you answer correctly, the more points you get</li>
              <li>Final scores appear on the leaderboard at the end</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;