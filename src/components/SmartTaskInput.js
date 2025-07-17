import React, { useState, useEffect, useRef } from 'react';
import aiService from '../services/aiService';

const SmartTaskInput = ({ onAddTask, existingTasks = [] }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [aiPredictions, setAiPredictions] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const inputRef = useRef(null);

  // AI-powered autocomplete suggestions
  const autocompleteData = [
    // Work-related
    'Schedule team meeting',
    'Review project documentation',
    'Prepare presentation for client',
    'Update project timeline',
    'Code review for feature',
    'Deploy to production',
    'Write unit tests',
    'Bug fix for issue',
    'Database optimization',
    'API endpoint development',
    
    // Personal
    'Buy groceries',
    'Call family member',
    'Schedule doctor appointment',
    'Plan weekend activities',
    'Organize home office',
    'Read book chapter',
    'Exercise routine',
    'Meal prep for week',
    'Pay monthly bills',
    'Clean and organize room',
    
    // Common patterns
    'Follow up on',
    'Research about',
    'Plan for',
    'Prepare for',
    'Review and update',
    'Organize and clean',
    'Schedule and confirm',
    'Test and validate'
  ];

  useEffect(() => {
    if (title.length > 2) {
      generateSuggestions();
      analyzeWithAI();
    } else {
      setSuggestions([]);
      setAiPredictions({});
    }
  }, [title, description]);

  const generateSuggestions = () => {
    const titleLower = title.toLowerCase();
    const filteredSuggestions = autocompleteData
      .filter(suggestion => 
        suggestion.toLowerCase().includes(titleLower) ||
        suggestion.toLowerCase().startsWith(titleLower)
      )
      .slice(0, 5);
    
    setSuggestions(filteredSuggestions);
    setShowSuggestions(filteredSuggestions.length > 0);
  };

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    try {
      const category = aiService.categorizeTask(title, description);
      const deadlineEstimate = aiService.estimateDeadline(title, description);
      const priority = aiService.calculatePriority({
        title,
        description,
        category,
        createdAt: new Date().toISOString()
      });
      const sentiment = aiService.analyzeSentiment(title + ' ' + description);
      
      setAiPredictions({
        category,
        deadlineEstimate,
        priority,
        sentiment
      });
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setTitle(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!title.trim()) return;
    
    const newTask = {
      title: title.trim(),
      description: description.trim(),
      category: aiPredictions.category || 'personal',
      deadline: aiPredictions.deadlineEstimate?.deadline || '',
      priority: aiPredictions.priority || 50,
      aiAnalyzed: true,
      aiPredictions: aiPredictions
    };
    
    onAddTask(newTask);
    setTitle('');
    setDescription('');
    setAiPredictions({});
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[0]);
    }
  };

  return (
    <div className="smart-task-input">
      <form onSubmit={handleSubmit} className="smart-form">
        <div className="input-group">
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What do you need to do? (AI will help you organize it)"
              className="smart-input"
              autoComplete="off"
            />
            {isAnalyzing && (
              <div className="ai-analyzing">
                <div className="analyzing-spinner"></div>
                <span>AI analyzing...</span>
              </div>
            )}
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              <div className="suggestions-header">
                <span>💡 Suggestions</span>
                <span className="suggestion-hint">Press Tab to accept first suggestion</span>
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="input-group">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details (optional)"
            className="smart-textarea"
            rows="2"
          />
        </div>

        {Object.keys(aiPredictions).length > 0 && (
          <div className="ai-predictions">
            <h4>🤖 AI Analysis</h4>
            <div className="predictions-grid">
              {aiPredictions.category && (
                <div className="prediction-item">
                  <span className="prediction-label">Category:</span>
                  <span className={`prediction-value category-${aiPredictions.category}`}>
                    {aiPredictions.category}
                  </span>
                </div>
              )}
              
              {aiPredictions.priority && (
                <div className="prediction-item">
                  <span className="prediction-label">Priority:</span>
                  <span className="prediction-value">
                    {aiPredictions.priority > 70 ? 'High' : 
                     aiPredictions.priority > 40 ? 'Medium' : 'Low'}
                  </span>
                </div>
              )}
              
              {aiPredictions.deadlineEstimate && (
                <div className="prediction-item">
                  <span className="prediction-label">Estimated time:</span>
                  <span className="prediction-value">
                    {aiPredictions.deadlineEstimate.estimatedHours}h ({aiPredictions.deadlineEstimate.complexity})
                  </span>
                </div>
              )}
              
              {aiPredictions.sentiment && (
                <div className="prediction-item">
                  <span className="prediction-label">Sentiment:</span>
                  <span className={`prediction-value sentiment-${aiPredictions.sentiment.sentiment}`}>
                    {aiPredictions.sentiment.sentiment}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="smart-submit-btn" disabled={!title.trim()}>
            ✨ Add Smart Task
          </button>
          {title.length > 0 && (
            <button 
              type="button" 
              className="clear-btn"
              onClick={() => {
                setTitle('');
                setDescription('');
                setAiPredictions({});
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      <div className="ai-features-showcase">
        <h4>🧠 AI Features</h4>
        <div className="features-list">
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>Smart categorization</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⏰</span>
            <span>Deadline estimation</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Priority calculation</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💭</span>
            <span>Sentiment analysis</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💡</span>
            <span>Smart suggestions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartTaskInput;