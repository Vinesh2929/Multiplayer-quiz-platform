import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalPlays: 0,
    totalPlayers: 0,
    averageScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch user's quizzes
    setTimeout(() => {
      const mockQuizzes = [
        {
          id: 'q1',
          title: 'Geography Trivia',
          description: 'Test your knowledge of world geography',
          questions: 10,
          plays: 156,
          createdAt: '2025-03-15T14:22:00Z',
          lastPlayed: '2025-03-28T09:15:00Z',
          isPublic: true
        },
        {
          id: 'q2',
          title: 'Science Quiz',
          description: 'Challenge yourself with science facts and discoveries',
          questions: 15,
          plays: 78,
          createdAt: '2025-03-10T11:45:00Z',
          lastPlayed: '2025-03-25T16:30:00Z',
          isPublic: true
        },
        {
          id: 'q3',
          title: 'JavaScript Basics',
          description: 'Test your JavaScript programming knowledge',
          questions: 12,
          plays: 42,
          createdAt: '2025-03-05T08:30:00Z',
          lastPlayed: '2025-03-22T14:00:00Z',
          isPublic: false
        }
      ];

      const mockRecentGames = [
        {
          id: 'g1',
          quizId: 'q1',
          quizTitle: 'Geography Trivia',
          date: '2025-03-28T09:15:00Z',
          players: 12,
          averageScore: 78
        },
        {
          id: 'g2',
          quizId: 'q2',
          quizTitle: 'Science Quiz',
          date: '2025-03-25T16:30:00Z',
          players: 8,
          averageScore: 65
        },
        {
          id: 'g3',
          quizId: 'q3',
          quizTitle: 'JavaScript Basics',
          date: '2025-03-22T14:00:00Z',
          players: 5,
          averageScore: 82
        }
      ];

      const mockStats = {
        totalQuizzes: 3,
        totalPlays: 276,
        totalPlayers: 185,
        averageScore: 75
      };

      setQuizzes(mockQuizzes);
      setRecentGames(mockRecentGames);
      setStats(mockStats);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome!</h1>
        <Link to="/create-quiz" className="btn btn-primary">
          Create New Quiz
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <h3>{stats.totalQuizzes}</h3>
          <p>Quizzes Created</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalPlays}</h3>
          <p>Total Plays</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalPlayers}</h3>
          <p>Total Players</p>
        </div>
        <div className="stat-card">
          <h3>{stats.averageScore}%</h3>
          <p>Average Score</p>
        </div>
      </div>

      {/* My Quizzes */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>My Quizzes</h2>
          <Link to="/my-quizzes" className="section-link">
            View All
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any quizzes yet.</p>
            <Link to="/create-quiz" className="btn btn-primary">
              Create Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="quizzes-grid">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-card-header">
                  <h3 className="quiz-title">{quiz.title}</h3>
                  <span className={`quiz-status ${quiz.isPublic ? 'public' : 'private'}`}>
                    {quiz.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <p className="quiz-description">{quiz.description}</p>
                <div className="quiz-meta">
                  <span>{quiz.questions} Questions</span>
                  <span>{quiz.plays} Plays</span>
                </div>
                <div className="quiz-date">
                  <span>Created: {formatDate(quiz.createdAt)}</span>
                </div>
                <div className="quiz-actions">
                  <Link to={`/play/${quiz.id}`} className="btn btn-sm btn-primary">
                    Play
                  </Link>
                  {/* When the user clicks "Edit," the quiz id is passed via the URL */}
                  <Link to={`/edit-quiz/${quiz.id}`} className="btn btn-sm btn-outline">
                    Edit
                  </Link>
                  <button className="btn btn-sm btn-outline">Share</button>
                </div>
              </div>
            ))}
            <div className="create-quiz-card">
              <div className="create-quiz-content">
                <span className="plus-icon">+</span>
                <h3>Create New Quiz</h3>
                <p>Add a new quiz to your collection</p>
                <Link to="/create-quiz" className="btn btn-primary">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Recent Games */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Recent Games</h2>
          <Link to="/game-history" className="section-link">
            View History
          </Link>
        </div>

        {recentGames.length === 0 ? (
          <div className="empty-state">
            <p>You haven't hosted any games yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="games-table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Date</th>
                  <th>Players</th>
                  <th>Avg. Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentGames.map((game) => (
                  <tr key={game.id}>
                    <td>{game.quizTitle}</td>
                    <td>{formatDate(game.date)}</td>
                    <td>{game.players}</td>
                    <td>{game.averageScore}%</td>
                    <td>
                      <Link to={`/results/${game.id}`} className="btn btn-sm btn-outline">
                        Results
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;