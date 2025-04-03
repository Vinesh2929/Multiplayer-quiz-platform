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
    const fetchData = async () => {
      try {
        // Fetch quizzes from your C++ backend
        const quizzesResponse = await fetch('http://localhost:5001/api/quizzes');
        const quizzesData = await quizzesResponse.json();
        
        if (quizzesData.quizzes) {
          // Transform the data to match your frontend structure
          const transformedQuizzes = quizzesData.quizzes.map(quiz => ({
            id: quiz._id?.$oid || '', // Handle MongoDB ObjectId
            title: quiz.title || 'Untitled Quiz',
            description: quiz.description || '',
            questions: quiz.questions?.length || 0,
            plays: 0, // You'll need to add this to your backend or calculate it
            createdAt: quiz.created_at || new Date().toISOString(),
            lastPlayed: quiz.last_played || new Date().toISOString(),
            isPublic: quiz.isPublic || false,
            category: quiz.category || 'General',
            timeLimit: quiz.timeLimit || 30
          }));
          
          setQuizzes(transformedQuizzes);
          
          // Calculate stats based on quizzes
          setStats({
            totalQuizzes: transformedQuizzes.length,
            totalPlays: transformedQuizzes.reduce((sum, quiz) => sum + quiz.plays, 0),
            totalPlayers: 0, // You'll need to track this in your backend
            averageScore: 0 // You'll need to track this in your backend
          });
        }

        // TODO: Fetch recent games from your backend when you implement that endpoint
        const mockRecentGames = [
          {
            id: 'g1',
            quizId: quizzesData.quizzes[0]?._id?.$oid || 'q1',
            quizTitle: quizzesData.quizzes[0]?.title || 'Sample Quiz',
            date: new Date().toISOString(),
            players: 0,
            averageScore: 0
          }
        ];
        
        setRecentGames(mockRecentGames);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
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
        <h1>Welcome{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}!</h1>
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
                  <span className="quiz-category">{quiz.category}</span>
                </div>
                <p className="quiz-description">{quiz.description}</p>
                <div className="quiz-meta">
                  <span>{quiz.questions} Questions</span>
                  <span>{quiz.timeLimit} sec/question</span>
                  <span>{quiz.plays} Plays</span>
                </div>
                <div className="quiz-date">
                  <span>Created: {formatDate(quiz.createdAt)}</span>
                </div>
                <div className="quiz-actions">
                <Link 
                  to={{
                      pathname: `/game-lobby/${quiz.id}`,
                      state: { quizId: quiz.id } // Pass the quiz ID as state
                      }} 
                    className="btn btn-sm btn-primary"
                    >
                     Play
                  </Link>
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