import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './GameLobby.css';

const GameLobby = () => {
  const { id: gameCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for game data
  const [players, setPlayers] = useState([]);
  const [hostInfo, setHostInfo] = useState({
    name: 'Quiz Host',
    avatar: '👨‍🏫'
  });
  const [quizInfo, setQuizInfo] = useState({
    title: 'Loading quiz...',
    description: '',
    questions: 0,
    timeLimit: 30
  });
  const [countdown, setCountdown] = useState(null);
  const [playerNickname, setPlayerNickname] = useState('');
  const [quizId, setQuizId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize lobby with quiz and player data
  useEffect(() => {
    // Get quiz ID from navigation state
    const { quizId } = location.state || {};
    setQuizId(quizId);

    // Load player info from session storage
    /*const storedPlayer = sessionStorage.getItem('quizzlyPlayer');
    if (!storedPlayer) {
      navigate('/join');
      return;
    }
    
    const playerData = JSON.parse(storedPlayer);
    if (playerData.gameCode !== gameCode) {
      navigate('/join');
      return;
    }*/
    
    setPlayerNickname(playerData.nickname);
    
    // Add current player to players list
    setPlayers([{
      id: Date.now(),
      nickname: playerData.nickname,
      avatar: '😎',
      isReady: false,
      isYou: true
    }]);

    // Fetch quiz data if ID exists
    if (quizId) {
      fetchQuizData(quizId);
    } else {
      setIsLoading(false);
    }

    // Start player polling
    const interval = setInterval(updatePlayers, 3000);
    return () => clearInterval(interval);
  }, [gameCode, navigate, location.state]);

  // Fetch quiz data from backend
  const fetchQuizData = async (quizId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/quizzes/${quizId}`);
      if (!response.ok) throw new Error('Failed to load quiz');
      
      const data = await response.json();
      setQuizInfo({
        title: data.title || 'Untitled Quiz',
        description: data.description || '',
        questions: data.questions?.length || 0,
        timeLimit: data.timeLimit || 30
      });
      
      // Set host info from quiz data if available
      if (data.created_by) {
        setHostInfo({
          name: data.created_by,
          avatar: '👨‍🏫'
        });
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      // Fallback to mock data
      setQuizInfo({
        title: 'General Knowledge Quiz',
        description: 'Test your knowledge on various topics',
        questions: 10,
        timeLimit: 30
      });
    } finally {
      setIsLoading(false);
    }
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
    if (players.length >= 2 && players.every(p => p.isReady)) {
      startCountdown();
    }
  };
  
  const startCountdown = () => {
    setCountdown(5);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to game with both gameCode and quizId
          navigate(`/play/${gameCode}`, { state: { quizId } });
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
    navigate('/dashboard');
  };
  
  const currentPlayer = players.find(p => p.isYou) || {};

  if (isLoading) {
    return (
      <div className="game-lobby-loading">
        <div className="spinner"></div>
        <p>Loading game lobby...</p>
      </div>
    );
  }

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
            <span className="time-limit">{quizInfo.timeLimit}s per question</span>
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
          <h2>Players ({players.length})</h2>
          <p className="lobby-instruction">
            {players.every(p => p.isReady) 
              ? 'All players ready! Starting soon...' 
              : 'Waiting for players to ready up...'}
          </p>
          
          <div className="players-grid">
            {players.map(player => (
              <div 
                key={player.id} 
                className={`player-card ${player.isReady ? 'ready' : 'not-ready'} ${player.isYou ? 'is-you' : ''}`}
              >
                <div className="player-avatar">{player.avatar}</div>
                <div className="player-name">
                  {player.nickname} {player.isYou && <span className="you-badge">(You)</span>}
                </div>
                <div className="player-status">
                  {player.isReady ? 'Ready ✓' : 'Not Ready...'}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lobby-sidebar">
          <div className="player-info">
            <div className="player-avatar large">{currentPlayer.avatar || '😎'}</div>
            <h3 className="player-name">{playerNickname}</h3>
            <div className={`player-status-badge ${currentPlayer.isReady ? 'ready' : ''}`}>
              {currentPlayer.isReady ? 'Ready to Play' : 'Not Ready'}
            </div>
          </div>
          
          <div className="lobby-actions">
            <button 
              className={`btn ${currentPlayer.isReady ? 'btn-outline' : 'btn-primary'} btn-block`}
              onClick={toggleReady}
            >
              {currentPlayer.isReady ? 'Cancel Ready' : 'Ready Up'}
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
              <li>Answer questions as quickly as possible</li>
              <li>Faster correct answers earn more points</li>
              <li>Each question has a {quizInfo.timeLimit} second limit</li>
              <li>The player with most points wins!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;