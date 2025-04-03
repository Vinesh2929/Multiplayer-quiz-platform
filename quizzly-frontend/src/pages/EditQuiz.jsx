import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "./EditQuiz.css";

const EditQuiz = () => {
  const { title } = useParams(); // expects /edit-quiz/title/:title
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    category: "",
    isPublic: true,
    timeLimit: 30,
    questions: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // load data into the input fields
  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/quiz/title/${encodeURIComponent(
        title
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQuizData(data.quiz);
        } else {
          console.error("Error loading quiz: ", data.error);
          setError(data.error || "Failed to load quiz");
        }
      })
      .catch((err) => {
        console.error("Network error loading quiz:", err);
        setError(err.message);
      });
  }, [title]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      text: "New question",
      type: "multiple_choice",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: 0,
      points: 10,
    };
    setQuizData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  // make sure question set is not empty

  const handleDeleteQuestion = (index) => {
    const updated = quizData.questions.filter((_, i) => i !== index);
    setQuizData((prev) => ({ ...prev, questions: updated }));
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        correctAnswer: optionIndex,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleQuestionFieldChange = (questionIndex, field, value) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuizData((prev) => {
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

    const payload = { ...quizData };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/edit-quiz`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Quiz updated successfully.");
        navigate("/dashboard");
      } else {
        console.error("Update error:", data.error);
        setError(data.error || "Failed to update quiz");
      }
    } catch (err) {
      console.error("Network error updating quiz:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!quizData || !quizData.title) {
    return <div>Loading quiz data...</div>;
  }

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
            <label style={{ marginLeft: "1em" }}>
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
        {/*
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
        */}

        {/* Questions List */}
        <div className="questions-list">
          <h2>Questions</h2>
          {quizData.questions && quizData.questions.length > 0 ? (
            <ul>
              {quizData.questions.map((question, qIndex) => (
                <li key={qIndex} className="question-item">
                  <div className="question-field">
                    <label>Question Text:</label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) =>
                        handleQuestionFieldChange(
                          qIndex,
                          "text",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="question-field">
                    <label>Time Limit (seconds):</label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={question.timeLimit ?? 30}
                      onChange={(e) =>
                        handleQuestionFieldChange(
                          qIndex,
                          "timeLimit",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div className="question-field">
                    <label>Points:</label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      step="10"
                      value={question.points ?? 100}
                      onChange={(e) =>
                        handleQuestionFieldChange(
                          qIndex,
                          "points",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div className="options-section">
                    <label>Options:</label>
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
                          Save as the Answer
                        </label>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-add"
                    onClick={handleDeleteQuestion}
                  >
                    Delete Question
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No questions added yet.</p>
          )}

          <div id="c-button">
          <button
            type="button"
            className="btn btn-add"
            onClick={handleAddQuestion}
          >
            Add Question
          </button>
          </div>
        </div>
        <br />

        <div className="button-group">
          <button type="submit" className="btn btn-submit" disabled={loading}>
            {loading ? "Updating Quiz..." : "Update Quiz"}
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
