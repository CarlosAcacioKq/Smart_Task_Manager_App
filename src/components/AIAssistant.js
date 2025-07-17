import React, { useState, useEffect, useMemo, useCallback } from 'react';
import aiService from '../services/aiService';

const AIAssistant = ({ tasks, onAddTask, onUpdateTask, isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [breakdown, setBreakdown] = useState([]);

  // Memoize expensive calculations
  const taskStats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      pending: tasks.filter(t => !t.completed).length,
      categories: tasks.reduce((acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      }, {})
    };
  }, [tasks]);

  useEffect(() => {
    if (isVisible) {
      generateSuggestions();
      generateInsights();
    }
  }, [isVisible, taskStats]);

  const generateSuggestions = useCallback(async () => {
    if (loading) return; // Prevent multiple concurrent calls
    setLoading(true);
    try {
      const taskSuggestions = aiService.generateTaskSuggestions(tasks);
      setSuggestions(taskSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, [tasks, loading]);

  const generateInsights = useCallback(async () => {
    try {
      const productivityInsights = aiService.generateInsights(tasks);
      setInsights(productivityInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  }, [tasks]);

  const refreshAllAI = useCallback(async () => {
    if (loading) return; // Prevent multiple concurrent calls
    await generateSuggestions();
    await generateInsights();
  }, [generateSuggestions, generateInsights, loading]);

  const handleAddSuggestion = (suggestion) => {
    const newTask = {
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      deadline: '',
      aiSuggested: true,
      aiReason: suggestion.reason
    };
    onAddTask(newTask);
  };

  const handleSmartCategorization = (task) => {
    const suggestedCategory = aiService.categorizeTask(task.title, task.description);
    const prediction = aiService.predictTaskCompletion(task, tasks);
    const sentiment = aiService.analyzeSentiment(task.title + ' ' + task.description);
    
    return {
      suggestedCategory,
      prediction,
      sentiment
    };
  };

  const handleBreakdownTask = (task) => {
    const subtasks = aiService.breakDownTask(task);
    setBreakdown(subtasks);
    setSelectedTask(task);
  };

  const handleAddBreakdownTasks = () => {
    breakdown.forEach(subtask => {
      onAddTask({
        ...subtask,
        aiGenerated: true,
        parentTask: selectedTask.title
      });
    });
    setBreakdown([]);
    setSelectedTask(null);
  };

  const handleOptimizeTask = (task) => {
    const priority = aiService.calculatePriority(task);
    const deadlineEstimate = aiService.estimateDeadline(task.title, task.description);
    
    const optimizedTask = {
      ...task,
      priority,
      estimatedDeadline: deadlineEstimate.deadline,
      aiOptimized: true
    };
    
    onUpdateTask(task.id, optimizedTask);
  };

  if (!isVisible) return null;

  return (
    <div className="ai-assistant-overlay" onClick={onClose}>
      <div className="ai-assistant" onClick={(e) => e.stopPropagation()}>
        <div className="ai-assistant-header">
          <h2>🤖 AI Assistant</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="ai-assistant-tabs">
          <button 
            className={`tab-button ${activeTab === 'suggestions' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            💡 Suggestions
          </button>
          <button 
            className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            📊 Insights
          </button>
          <button 
            className={`tab-button ${activeTab === 'optimize' ? 'active' : ''}`}
            onClick={() => setActiveTab('optimize')}
          >
            ⚡ Optimize
          </button>
        </div>

        <div className="ai-assistant-content">
          {activeTab === 'suggestions' && (
            <div className="suggestions-tab">
              <h3>Smart Task Suggestions</h3>
              {loading ? (
                <div className="ai-loading">
                  <div className="loading-spinner"></div>
                  <p>Generating intelligent suggestions...</p>
                </div>
              ) : (
                <div className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion-card">
                      <div className="suggestion-header">
                        <h4>{suggestion.title}</h4>
                        <span className="confidence-badge">
                          {Math.round(suggestion.confidence * 100)}% confident
                        </span>
                      </div>
                      <p className="suggestion-description">{suggestion.description}</p>
                      <div className="suggestion-meta">
                        <span className="category-tag">{suggestion.category}</span>
                        <span className="reason">💭 {suggestion.reason}</span>
                      </div>
                      <button 
                        className="add-suggestion-btn"
                        onClick={() => handleAddSuggestion(suggestion)}
                      >
                        Add Task
                      </button>
                    </div>
                  ))}
                  {suggestions.length === 0 && (
                    <div className="no-suggestions">
                      <p>No suggestions at the moment. Keep working on your tasks!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="insights-tab">
              <h3>Productivity Insights</h3>
              <div className="insights-list">
                {insights.map((insight, index) => (
                  <div key={index} className={`insight-card ${insight.type}`}>
                    <div className="insight-header">
                      <h4>{insight.title}</h4>
                      <span className="insight-type">{insight.type}</span>
                    </div>
                    <p className="insight-description">{insight.description}</p>
                    {insight.actionable && (
                      <div className="insight-action">
                        <strong>💡 Suggestion:</strong> {insight.action}
                      </div>
                    )}
                  </div>
                ))}
                {insights.length === 0 && (
                  <div className="no-insights">
                    <p>Complete more tasks to get personalized insights!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'optimize' && (
            <div className="optimize-tab">
              <h3>Task Optimization</h3>
              <div className="optimize-actions">
                <div className="optimize-section">
                  <h4>🎯 Smart Analysis</h4>
                  <p>Let AI analyze your tasks for better productivity</p>
                  <div className="task-analysis-grid">
                    {tasks.filter(task => !task.completed).slice(0, 3).map(task => {
                      const analysis = handleSmartCategorization(task);
                      return (
                        <div key={task.id} className="task-analysis-card">
                          <div className="task-title">{task.title}</div>
                          <div className="analysis-results">
                            <div className="analysis-item">
                              <strong>Category:</strong> {analysis.suggestedCategory}
                            </div>
                            <div className="analysis-item">
                              <strong>Completion Probability:</strong> {analysis.prediction.probability}%
                            </div>
                            <div className="analysis-item">
                              <strong>Sentiment:</strong> {analysis.sentiment.sentiment}
                            </div>
                          </div>
                          <div className="analysis-actions">
                            <button 
                              className="optimize-btn"
                              onClick={() => handleOptimizeTask(task)}
                            >
                              Optimize
                            </button>
                            <button 
                              className="breakdown-btn"
                              onClick={() => handleBreakdownTask(task)}
                            >
                              Break Down
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {breakdown.length > 0 && (
                  <div className="breakdown-section">
                    <h4>📋 Task Breakdown for "{selectedTask?.title}"</h4>
                    <div className="breakdown-list">
                      {breakdown.map((subtask, index) => (
                        <div key={index} className="breakdown-item">
                          <span className="step-number">{index + 1}</span>
                          <div className="subtask-info">
                            <strong>{subtask.title}</strong>
                            <p>{subtask.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="breakdown-actions">
                      <button 
                        className="add-breakdown-btn"
                        onClick={handleAddBreakdownTasks}
                      >
                        Add All Subtasks
                      </button>
                      <button 
                        className="cancel-breakdown-btn"
                        onClick={() => setBreakdown([])}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="ai-assistant-footer">
          <div className="ai-stats">
            <span>🧠 AI-powered by Smart Task Manager</span>
            <span>•</span>
            <span>{tasks.length} tasks analyzed</span>
          </div>
          <button className="refresh-ai-btn" onClick={refreshAllAI}>
            🔄 Refresh AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AIAssistant);