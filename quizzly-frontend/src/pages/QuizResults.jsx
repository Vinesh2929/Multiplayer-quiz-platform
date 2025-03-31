import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import './QuizResults.css';

const QuizResults = () => {
  const { id: quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  
  useEffect(() => {
    // If results were passed via state, use them
    if (location.state?.score !== undefined) {
      setResults({
        score: location.state.score,
        answers: location.state.answers,
        totalQuestions: location.state.totalQuestions,
        quizTitle: location.state.quizTitle
      });
      setLoading(false);
      
      // Fetch leaderboard data
      fetchLeaderboard();
    } else {
      // Otherwise, fetch results from API
      fetchResults();
    }
  }, [location, quizId]);
  
  // Mock fetch results
  const fetchResults = () => {
    // Simulate API call
    setTimeout(() => {
      // Mock data
      const mockResults = {
        score: 350,
        totalQuestions: 5,
        quizTitle: 'Science Quiz: The Basics',
        answers: [
          { questionId: 'q1', isCorrect: true, score: 120 },
          { questionId: 'q2', isCorrect: false, score: 0 },
          { questionId: 'q3', isCorrect: true, score: 100 },
          { questionId: 'q4', isCorrect: true, score: 130 },
          { questionId: 'q5', isCorrect: false, score: 0 }
        ]
      };
      
      setResults(mockResults);
      setLoading(false);
      
      // Fetch leaderboard data
      fetchLeaderboard();
    }, 1000);
  };
  
  // Mock fetch leaderboard
  const fetchLeaderboard = () => {
    // Simulate API call
    setTimeout(() => {
      // Generate mock leaderboard with current player included
      const playerNickname = JSON.parse(sessionStorage.getItem('quizzlyPlayer'))?.nickname || 'You';
      
      const mockLeaderboard = [
        { rank: 1, name: 'ScienceWhiz', score: 480, isCurrentPlayer: false },
        { rank: 2, name: playerNickname, score: location.state?.score || 350, isCurrentPlayer: true },
        { rank: 3, name: 'BrainiacGamer', score: 320, isCurrentPlayer: false },
        { rank: 4, name: 'QuizMaster', score: 290, isCurrentPlayer: false },
        { rank: 5, name: 'MindExplorer', score: 270, isCurrentPlayer: false },
        { rank: 6, name: 'ThinkTank', score: 240, isCurrentPlayer: false },
        { rank: 7, name: 'QuizWizard', score: 210, isCurrentPlayer: false },
        { rank: 8, name: 'GameChamp', score: 180, isCurrentPlayer: false }
      ];
      
      setLeaderboard(mockLeaderboard);
    }, 1500);
  };
  
  // Calculate accuracy percentage
  const calculateAccuracy = () => {
    if (!results || !results.answers || results.answers.length === 0) return 0;
    
    const correctAnswers = results.answers.filter(a => a.isCorrect).length;
    return Math.round((correctAnswers / results.totalQuestions) * 100);
  };
  
  // Calculate performance score (0-100)
  const calculatePerformance = () => {
    if (!results || !results.answers || results.answers.length === 0) return 0;
    
    // Assuming maximum possible score is 150 points per question (100 base + 50 time bonus)
    const maxPossibleScore = results.totalQuestions * 150;
    return Math.round((results.score / maxPossibleScore) * 100);
  };
  
  // Play again with same quiz
  const playAgain = () => {
    navigate(`/play/${quizId}`);
  };
  
  // Share results
  const shareResults = () => {
    // In a real app, this would generate a shareable link or open a share dialog
    alert('Share functionality would be implemented here');
  };
  
  if (loading) {
    return (
      <div className="results-loading">
        <div className="spinner"></div>
        <p>Loading your results...</p>
      </div>
    );
  }
  
  return (
    <div className="quiz-results">
      <div className="results-header">
        <h1>Quiz Results</h1>
        <p className="quiz-title">{results.quizTitle}</p>
      </div>
      
      <div className="results-container">
        <div className="results-summary">
          <div className="score-card">
            <div className="score-value">{results.score}</div>
            <div className="score-label">Final Score</div>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{calculateAccuracy()}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{results.answers.filter(a => a.isCorrect).length}/{results.totalQuestions}</div>
              <div className="stat-label">Correct Answers</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{calculatePerformance()}/100</div>
              <div className="stat-label">Performance</div>
            </div>
          </div>
          
          <div className="results-actions">
            <button className="btn btn-primary" onClick={playAgain}>
              Play Again
            </button>
            <button className="btn btn-outline" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            <button className="btn btn-outline" onClick={shareResults}>
              Share Results
            </button>
          </div>
        </div>
        
        {showDetails && (
          <div className="results-details">
            <h2>Question Details</h2>
            
            <div className="details-list">
              {results.answers.map((answer, index) => (
                <div 
                  key={answer.questionId} 
                  className={`detail-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <div className="question-number">Q{index + 1}</div>
                  <div className="answer-result">
                    {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </div>
                  <div className="answer-score">
                    +{answer.score} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="leaderboard-section">
          <h2>Leaderboard</h2>
          
          {leaderboard.length === 0 ? (
            <div className="leaderboard-loading">
              <div className="spinner small"></div>
              <p>Loading leaderboard...</p>
            </div>
          ) : (
            <div className="leaderboard">
              <div className="leaderboard-header">
                <span className="rank-header">Rank</span>
                <span className="name-header">Player</span>
                <span className="score-header">Score</span>
              </div>
              
              <div className="leaderboard-body">
                {leaderboard.map((player) => (
                  <div 
                    key={player.rank} 
                    className={`leaderboard-row ${player.isCurrentPlayer ? 'current-player' : ''}`}
                  >
                    <div className="leaderboard-rank">
                      {player.rank <= 3 ? (
                        <div className={`trophy rank-${player.rank}`}>
                          {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                        </div>
                      ) : (
                        <span>{player.rank}</span>
                      )}
                    </div>
                    <div className="leaderboard-name">
                      {player.name} {player.isCurrentPlayer && '(You)'}
                    </div>
                    <div className="leaderboard-score">{player.score}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="results-footer">
          <Link to="/dashboard" className="btn btn-outline">
            Back to Dashboard
          </Link>
          <Link to="/join" className="btn btn-primary">
            Join Another Game
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;