import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PlayQuiz.css';

const PlayQuiz = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [playerAnswers, setPlayerAnswers] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, review, ended
  const [playerNickname, setPlayerNickname] = useState('');
  const timerRef = useRef(null);
  
  // Load player info and quiz data
  useEffect(() => {
    const storedPlayer = sessionStorage.getItem('quizzlyPlayer');
    if (storedPlayer) {
      const playerData = JSON.parse(storedPlayer);
      setPlayerNickname(playerData.nickname);
    }
    
    // Fetch quiz data
    fetchQuizData();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizId]);
  
  // Mock fetch quiz data
  const fetchQuizData = () => {
    // Simulate API call
    setTimeout(() => {
      const mockQuizData = {
        id: quizId,
        title: 'Science Quiz: The Basics',
        description: 'Test your knowledge of fundamental scientific concepts.',
        settings: {
          timeLimit: 20,
          showAnswers: true,
          randomizeQuestions: false
        },
        questions: [
          {
            id: 'q1',
            text: 'What is the chemical symbol for water?',
            type: 'multiple',
            timeLimit: 20,
            points: 100,
            options: [
              { id: 'o1', text: 'H2O', isCorrect: true },
              { id: 'o2', text: 'CO2', isCorrect: false },
              { id: 'o3', text: 'O2', isCorrect: false },
              { id: 'o4', text: 'NaCl', isCorrect: false }
            ]
          },
          {
            id: 'q2',
            text: 'Which planet is known as the Red Planet?',
            type: 'multiple',
            timeLimit: 15,
            points: 100,
            options: [
              { id: 'o1', text: 'Venus', isCorrect: false },
              { id: 'o2', text: 'Mars', isCorrect: true },
              { id: 'o3', text: 'Jupiter', isCorrect: false },
              { id: 'o4', text: 'Saturn', isCorrect: false }
            ]
          },
          {
            id: 'q3',
            text: 'What is the largest organ in the human body?',
            type: 'multiple',
            timeLimit: 15,
            points: 100,
            options: [
              { id: 'o1', text: 'Heart', isCorrect: false },
              { id: 'o2', text: 'Liver', isCorrect: false },
              { id: 'o3', text: 'Skin', isCorrect: true },
              { id: 'o4', text: 'Brain', isCorrect: false }
            ]
          },
          {
            id: 'q4',
            text: 'What is the process by which plants make their own food using sunlight?',
            type: 'multiple',
            timeLimit: 20,
            points: 150,
            options: [
              { id: 'o1', text: 'Photosynthesis', isCorrect: true },
              { id: 'o2', text: 'Respiration', isCorrect: false },
              { id: 'o3', text: 'Digestion', isCorrect: false },
              { id: 'o4', text: 'Transpiration', isCorrect: false }
            ]
          },
          {
            id: 'q5',
            text: 'Which of these is NOT a state of matter?',
            type: 'multiple',
            timeLimit: 20,
            points: 150,
            options: [
              { id: 'o1', text: 'Solid', isCorrect: false },
              { id: 'o2', text: 'Liquid', isCorrect: false },
              { id: 'o3', text: 'Gas', isCorrect: false },
              { id: 'o4', text: 'Energy', isCorrect: true }
            ]
          }
        ]
      };
      
      setQuizData(mockQuizData);
      startQuestion(0, mockQuizData);
    }, 1000);
  };
  
  // Start a question with timer
  const startQuestion = (index, quiz = quizData) => {
    if (!quiz || !quiz.questions[index]) return;
    
    const question = quiz.questions[index];
    const questionTime = question.timeLimit || quiz.settings.timeLimit;
    
    setIsAnswered(false);
    setSelectedOption(null);
    setShowAnswer(false);
    setTimeLeft(questionTime);
    
    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          if (!isAnswered) handleTimeout();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  // Handle option selection
  const handleOptionSelect = (optionId) => {
    if (isAnswered) return;
    
    const currentQuestion = quizData.questions[currentQuestionIndex];
    const selectedOpt = currentQuestion.options.find(o => o.id === optionId);
    
    setSelectedOption(optionId);
    setIsAnswered(true);
    
    // Calculate score based on time left
    let questionScore = 0;
    if (selectedOpt.isCorrect) {
      const timeBonus = Math.floor((timeLeft / currentQuestion.timeLimit) * 50);
      questionScore = currentQuestion.points + timeBonus;
      setScore(prevScore => prevScore + questionScore);
    }
    
    // Record answer
    setPlayerAnswers(prev => [
      ...prev, 
      {
        questionId: currentQuestion.id,
        selectedOptionId: optionId,
        isCorrect: selectedOpt.isCorrect,
        timeLeft,
        score: questionScore
      }
    ]);
    
    // Show answer if enabled in settings
    if (quizData.settings.showAnswers) {
      setShowAnswer(true);
      
      // Proceed to next question after delay
      setTimeout(() => {
        goToNextQuestion();
      }, 3000);
    } else {
      // Proceed immediately
      goToNextQuestion();
    }
  };
  
  // Handle timeout when no answer is selected
  const handleTimeout = () => {
    const currentQuestion = quizData.questions[currentQuestionIndex];
    
    setIsAnswered(true);
    
    // Record answer as timeout
    setPlayerAnswers(prev => [
      ...prev, 
      {
        questionId: currentQuestion.id,
        selectedOptionId: null,
        isCorrect: false,
        timeLeft: 0,
        score: 0
      }
    ]);
    
    // Show correct answer if enabled
    if (quizData.settings.showAnswers) {
      setShowAnswer(true);
      
      // Proceed to next question after delay
      setTimeout(() => {
        goToNextQuestion();
      }, 3000);
    } else {
      // Proceed immediately
      goToNextQuestion();
    }
  };
  
  // Go to next question or end quiz
  const goToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex < quizData.questions.length) {
      setCurrentQuestionIndex(nextIndex);
      startQuestion(nextIndex);
    } else {
      // End of quiz
      clearInterval(timerRef.current);
      setGameStatus('ended');
      
      // Save results and navigate to results page
      saveResults();
    }
  };
  
  // Save quiz results
  const saveResults = () => {
    // In a real app, send results to server
    console.log('Quiz completed with score:', score);
    console.log('Player answers:', playerAnswers);
    
    // Navigate to results page after a delay
    setTimeout(() => {
      navigate(`/results/${quizId}`, { 
        state: { 
          score, 
          answers: playerAnswers,
          totalQuestions: quizData.questions.length,
          quizTitle: quizData.title
        } 
      });
    }, 3000);
  };
  
  // Format time
  const formatTime = (seconds) => {
    return `${seconds}s`;
  };
  
  // Calculate progress
  const calculateProgress = () => {
    if (!quizData) return 0;
    return ((currentQuestionIndex) / quizData.questions.length) * 100;
  };
  
  if (!quizData) {
    return (
      <div className="quiz-loading">
        <div className="spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }
  
  const currentQuestion = quizData.questions[currentQuestionIndex];
  const correctOption = currentQuestion.options.find(o => o.isCorrect);
  
  return (
    <div className="play-quiz">
      {gameStatus === 'playing' && (
        <>
          <div className="quiz-header">
            <div className="quiz-progress">
              <div className="progress-text">
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
            
            <div className="quiz-info">
              <div className="quiz-score">
                Score: <span>{score}</span>
              </div>
              <div className="quiz-timer">
                <div className={`timer-value ${timeLeft < 5 ? 'running-out' : ''}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="question-container">
            <h2 className="question-text">{currentQuestion.text}</h2>
            
            <div className="options-grid">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  className={`option-button ${selectedOption === option.id ? 'selected' : ''} ${
                    showAnswer 
                      ? option.isCorrect 
                        ? 'correct' 
                        : selectedOption === option.id 
                          ? 'incorrect' 
                          : ''
                      : ''
                  }`}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={isAnswered}
                >
                  {option.text}
                </button>
              ))}
            </div>
            
            {showAnswer && (
              <div className="answer-feedback">
                {selectedOption && correctOption.id === selectedOption ? (
                  <div className="correct-answer">
                    <span className="feedback-icon">✓</span>
                    <span>Correct! +{playerAnswers[playerAnswers.length - 1].score} points</span>
                  </div>
                ) : (
                  <div className="wrong-answer">
                    <span className="feedback-icon">✗</span>
                    <span>
                      {selectedOption
                        ? `Incorrect. The correct answer is: ${correctOption.text}`
                        : `Time's up! The correct answer is: ${correctOption.text}`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
      
      {gameStatus === 'ended' && (
        <div className="quiz-ended">
          <div className="quiz-results-summary">
            <h2>Quiz Completed!</h2>
            <div className="final-score">
              <span className="score-label">Final Score</span>
              <span className="score-value">{score}</span>
            </div>
            <p>Calculating your results...</p>
            <div className="spinner"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayQuiz;