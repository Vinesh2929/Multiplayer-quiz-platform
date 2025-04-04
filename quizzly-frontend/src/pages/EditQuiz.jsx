import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditQuiz.css";

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState({
    id: id, // Using 'id' instead of '_id' for consistency with backend
    title: "",
    description: "",
    category: "",
    isPublic: true,
    timeLimit: 30,
    questions: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = [
    "Education",
    "Science",
    "History",
    "Geography",
    "Entertainment",
    "Sports",
    "Technology",
    "Art & Literature",
    "Music",
    "Movies & TV",
    "Business",
    "Other",
  ];

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/quiz/id/${id}`
        );
        const data = await response.json();
        
        if (data.success && data.quiz) {
          setQuizData({
            id: id,
            title: data.quiz.title || "",
            description: data.quiz.description || "",
            category: data.quiz.category || "",
            isPublic: data.quiz.isPublic !== false,
            timeLimit: data.quiz.timeLimit || 30,
            questions: data.quiz.questions || []
          });
        } else {
          setError(data.error || "Failed to load quiz");
        }
      } catch (err) {
        setError(err.message);
      }
    };
  
    fetchQuizData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: "New question",
          type: "multiple_choice",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctAnswer: 0,
          points: 10,
          timeLimit: 30,
        }
      ]
    }));
  };

  const handleDeleteQuestion = (index) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        correctAnswer: optionIndex,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleQuestionFieldChange = (questionIndex, field, value) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options];
      updatedOptions[optionIndex] = value;
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/edit-quiz`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quizData),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Quiz updated successfully.");
        navigate("/dashboard");
      } else {
        setError(data.error || "Failed to update quiz");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!quizData.title) {
    return <div>Loading quiz data...</div>;
  }

  return (
    <div className="edit-quiz-container">
      <h1>Edit Quiz</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Title Field */}
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

        {/* Description Field */}
        <label>
          Description:
          <textarea
            name="description"
            value={quizData.description}
            onChange={handleChange}
            required
          />
        </label>

        {/* Category Select */}
        <div className="form-group">
          <label>Category *</label>
          <select
            name="category"
            value={quizData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Visibility Toggle */}
        <div className="form-group">
          <label>Quiz Visibility:</label>
          <div>
            <label>
              <input
                type="radio"
                checked={quizData.isPublic}
                onChange={() => setQuizData({...quizData, isPublic: true})}
              />
              Public
            </label>
            <label>
              <input
                type="radio"
                checked={!quizData.isPublic}
                onChange={() => setQuizData({...quizData, isPublic: false})}
              />
              Private
            </label>
          </div>
        </div>

        {/* Questions Section */}
        <div className="questions-list">
          <h2>Questions</h2>
          
          {quizData.questions.length > 0 ? (
            <ul>
              {quizData.questions.map((question, qIndex) => (
                <li key={qIndex} className="question-item">
                  {/* Question Text */}
                  <div className="question-field">
                    <label>Question Text:</label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => 
                        handleQuestionFieldChange(qIndex, "text", e.target.value)
                      }
                    />
                  </div>

                  {/* Time Limit */}
                  <div className="question-field">
                    <label>Time Limit (seconds):</label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={question.timeLimit || 30}
                      onChange={(e) => 
                        handleQuestionFieldChange(qIndex, "timeLimit", Number(e.target.value))
                      }
                    />
                  </div>

                  {/* Points */}
                  <div className="question-field">
                    <label>Points:</label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      step="10"
                      value={question.points || 100}
                      onChange={(e) => 
                        handleQuestionFieldChange(qIndex, "points", Number(e.target.value))
                      }
                    />
                  </div>

                  {/* Options */}
                  <div className="options-section">
                    <label>Multiple Choice Options:</label>
                    {question.options.map((opt, optIndex) => (
                      <div key={optIndex} className="option-item">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => 
                            handleOptionChange(qIndex, optIndex, e.target.value)
                          }
                        />
                        <label>
                          <input
                            type="radio"
                            name={`correctOption-${qIndex}`}
                            checked={question.correctAnswer === optIndex}
                            onChange={() => 
                              handleCorrectAnswerChange(qIndex, optIndex)
                            }
                          />
                          Correct Answer
                        </label>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-add"
                    onClick={() => handleDeleteQuestion(qIndex)}
                  >
                    Delete Question
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No questions added yet.</p>
          )}

          <button
            type="button"
            className="btn btn-add"
            onClick={handleAddQuestion}
          >
            Add Question
          </button>
        </div>

        {/* Form Buttons */}
        <div className="button-group">
          <button 
            type="submit" 
            className="btn btn-submit" 
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Quiz"}
          </button>
          <button
            type="button"
            className="btn btn-cancel"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditQuiz;