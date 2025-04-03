import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import './EditQuiz.css';

const EditQuiz = () => {
  const { quizId } = useParams(); // expected route of the form /edit-quiz/:quizId
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: '',
    isPublic: true,
    timeLimit: 30,
    questions: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load existing quiz data on component mount
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/quiz/${quizId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQuizData(data.quiz);
        } else {
          console.error('Error occurred while loading quiz: ', error);
          setError(data.error || 'Failed to load quiz');
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [quizId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Prepare payload for update.
    // Make sure to include the quiz's _id as "quiz_id" in the payload.
    const payload = { ...quizData, quiz_id: quizData._id };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/edit-quiz`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        alert('Quiz updated successfully.');
        navigate('/dashboard');
      } else {
        console.error("Error occurred while updating quiz: ", error)
        setError(data.error || 'Failed to update quiz');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!quizData._id) {
    // Waiting for data to load
    return <div>Loading quiz data...</div>;
  }

  // load existing data into input fields 

  return (
    <div className="edit-quiz-container">
      <h1>Edit Quiz</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input 
            type="text" 
            name="title" 
            value={quizData.title} 
            onChange={handleChange} 
            required 
          />
        </label>
        <br />
        <label>
          Description:
          <textarea 
            name="description" 
            value={quizData.description} 
            onChange={handleChange} 
            required
          />
        </label>
        <br />
        <label>
          Category:
          <input 
            type="text" 
            name="category" 
            value={quizData.category} 
            onChange={handleChange} 
            required 
          />
        </label>
        <br />
  
        {/* Public/Private Toggle */}
        <div className="form-group">
          <label>Quiz Visibility:</label>
          <div>
            <label>
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={quizData.isPublic}
                onChange={() => setQuizData({ ...quizData, isPublic: true })}
              />
              Public
            </label>
            <label style={{ marginLeft: '1em' }}>
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={!quizData.isPublic}
                onChange={() => setQuizData({ ...quizData, isPublic: false })}
              />
              Private
            </label>
          </div>
        </div>
        <br />
  
        {/* Time Limit Field */}
        <div className="form-group">
          <label>
            Time Limit (seconds):
            <input
              type="number"
              name="timeLimit"
              value={quizData.timeLimit}
              onChange={handleChange}
              min="5"
              max="300"
              required
            />
          </label>
        </div>
        <br />
  
        {/* Questions List */}
        <div className="questions-list">
          <h2>Questions</h2>
          {quizData.questions && quizData.questions.length > 0 ? (
            <ul>
              {quizData.questions.map((question, index) => (
                <li key={index}>
                  {question.text}
                  <button type="button" onClick={() => handleDeleteQuestion(index)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No questions added yet.</p>
          )}
          <button type="button" onClick={handleAddQuestion}>
            Add Question
          </button>
        </div>
        <br />
  
        <button type="submit" disabled={loading}>
          {loading ? 'Updating Quiz...' : 'Update Quiz'}
        </button>
      </form>
    </div>
  );
} 

export default EditQuiz;