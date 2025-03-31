import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-container">
        <div className="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
          <Link to="/dashboard" className="btn btn-outline">
            Go to Dashboard
          </Link>
        </div>
        
        <div className="suggestions">
          <h2>You might be looking for:</h2>
          <ul className="suggestion-links">
            <li>
              <Link to="/join">Join a Game</Link>
            </li>
            <li>
              <Link to="/create-quiz">Create a Quiz</Link>
            </li>
            <li>
              <Link to="/dashboard">Your Dashboard</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFound;