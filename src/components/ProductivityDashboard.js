import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import aiService from '../services/aiService';

const ProductivityDashboard = ({ tasks }) => {
  const [insights, setInsights] = useState([]);
  const [productivityScore, setProductivityScore] = useState(0);
  const [trends, setTrends] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);

  // Memoize expensive calculations
  const taskStats = useMemo(() => {
    const completedTasks = tasks.filter(task => task.completed);
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    return {
      completedTasks,
      totalTasks,
      completionRate,
      categories: tasks.reduce((acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      }, {})
    };
  }, [tasks]);

  useEffect(() => {
    analyzeProductivity();
    generateTrends();
    generatePredictions();
    generateRecommendations();
  }, [taskStats]);

  const analyzeProductivity = () => {
    const completedTasks = tasks.filter(task => task.completed);
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    // Calculate productivity score based on multiple factors
    let score = completionRate * 0.4; // 40% weight on completion rate
    
    // Add points for on-time completion
    const onTimeCompletions = completedTasks.filter(task => {
      if (!task.deadline) return true;
      const deadline = new Date(task.deadline);
      const completed = new Date(task.completedAt || task.createdAt);
      return completed <= deadline;
    }).length;
    
    score += (onTimeCompletions / Math.max(completedTasks.length, 1)) * 30; // 30% weight
    
    // Add points for task variety
    const categories = new Set(tasks.map(task => task.category));
    score += Math.min(categories.size * 5, 20); // Up to 20% for variety
    
    // Add points for consistent activity
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentTasks = tasks.filter(task => new Date(task.createdAt) >= lastWeek);
    score += Math.min(recentTasks.length * 2, 10); // Up to 10% for activity
    
    setProductivityScore(Math.min(Math.round(score), 100));
    
    // Generate insights
    const generatedInsights = aiService.generateInsights(tasks);
    setInsights(generatedInsights);
  };

  const generateTrends = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const completedToday = dayTasks.filter(task => task.completed).length;
      const createdToday = dayTasks.length;
      
      last7Days.push({
        day: dayName,
        completed: completedToday,
        created: createdToday,
        efficiency: createdToday > 0 ? Math.round((completedToday / createdToday) * 100) : 0
      });
    }
    
    setTrends(last7Days);
  };

  const generatePredictions = () => {
    const incompleteTasks = tasks.filter(task => !task.completed);
    const predictions = incompleteTasks.map(task => {
      const prediction = aiService.predictTaskCompletion(task, tasks);
      return {
        id: task.id,
        title: task.title,
        probability: prediction.probability,
        recommendation: prediction.recommendation,
        factors: prediction.factors
      };
    }).sort((a, b) => b.probability - a.probability);
    
    setPredictions(predictions.slice(0, 5));
  };

  const generateRecommendations = () => {
    const recommendations = [];
    
    // Check for overdue tasks
    const overdueTasks = tasks.filter(task => {
      if (!task.deadline || task.completed) return false;
      return new Date(task.deadline) < new Date();
    });
    
    if (overdueTasks.length > 0) {
      recommendations.push({
        type: 'urgent',
        title: 'Address Overdue Tasks',
        description: `You have ${overdueTasks.length} overdue tasks. Prioritize these immediately.`,
        action: 'Review overdue tasks',
        priority: 'high'
      });
    }
    
    // Check for task distribution
    const categories = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {});
    
    const totalTasks = tasks.length;
    const workPercentage = (categories.work || 0) / totalTasks * 100;
    
    if (workPercentage > 80) {
      recommendations.push({
        type: 'balance',
        title: 'Work-Life Balance',
        description: 'Most of your tasks are work-related. Consider adding personal goals.',
        action: 'Add personal tasks',
        priority: 'medium'
      });
    }
    
    // Check for task completion patterns
    const completionRate = tasks.filter(task => task.completed).length / tasks.length * 100;
    
    if (completionRate < 60) {
      recommendations.push({
        type: 'productivity',
        title: 'Improve Task Completion',
        description: 'Your completion rate is below average. Try breaking down large tasks.',
        action: 'Break down complex tasks',
        priority: 'medium'
      });
    }
    
    // Check for recent activity
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const recentTasks = tasks.filter(task => new Date(task.createdAt) >= yesterday);
    
    if (recentTasks.length === 0) {
      recommendations.push({
        type: 'engagement',
        title: 'Stay Active',
        description: 'No tasks created recently. Set new goals to maintain momentum.',
        action: 'Create new tasks',
        priority: 'low'
      });
    }
    
    setAiRecommendations(recommendations);
  };

  const categoryData = useMemo(() => {
    return Object.entries(taskStats.categories).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      color: category === 'work' ? '#2563eb' : 
             category === 'personal' ? '#10b981' : '#dc2626'
    }));
  }, [taskStats.categories]);

  const productivityRadarData = useMemo(() => {
    const categories = ['work', 'personal', 'urgent'];
    
    return categories.map(category => {
      const categoryTasks = tasks.filter(task => task.category === category);
      const completedCategoryTasks = taskStats.completedTasks.filter(task => task.category === category);
      const completion = categoryTasks.length > 0 ? 
        (completedCategoryTasks.length / categoryTasks.length) * 100 : 0;
      
      return {
        category: category.charAt(0).toUpperCase() + category.slice(1),
        completion: Math.round(completion),
        fullMark: 100
      };
    });
  }, [tasks, taskStats.completedTasks]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="productivity-dashboard">
      <div className="dashboard-header">
        <h2>🧠 AI Productivity Dashboard</h2>
        <div className="productivity-score">
          <div className="score-circle" style={{ borderColor: getScoreColor(productivityScore) }}>
            <span className="score-value">{productivityScore}</span>
            <span className="score-label">Productivity Score</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Trends Chart */}
        <div className="dashboard-card">
          <h3>📈 Weekly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="dashboard-card">
          <h3>📊 Task Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Productivity Radar */}
        <div className="dashboard-card">
          <h3>⚡ Performance Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={productivityRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Completion Rate"
                dataKey="completion"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Predictions */}
        <div className="dashboard-card">
          <h3>🔮 AI Predictions</h3>
          <div className="predictions-list">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="prediction-item">
                <div className="prediction-header">
                  <span className="task-title">{prediction.title}</span>
                  <span className={`probability ${prediction.recommendation}`}>
                    {prediction.probability}%
                  </span>
                </div>
                <div className="prediction-recommendation">
                  {prediction.recommendation === 'high' && '🟢 Likely to complete'}
                  {prediction.recommendation === 'medium' && '🟡 Moderate chance'}
                  {prediction.recommendation === 'low' && '🔴 Needs attention'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="dashboard-card">
          <h3>💡 AI Insights</h3>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-item ${insight.type}`}>
                <div className="insight-header">
                  <span className="insight-title">{insight.title}</span>
                  <span className="insight-type">{insight.type}</span>
                </div>
                <p className="insight-description">{insight.description}</p>
                {insight.actionable && (
                  <div className="insight-action">
                    <strong>Action:</strong> {insight.action}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="dashboard-card">
          <h3>🎯 AI Recommendations</h3>
          <div className="recommendations-list">
            {aiRecommendations.map((rec, index) => (
              <div key={index} className={`recommendation-item ${rec.priority}`}>
                <div className="recommendation-header">
                  <span className="recommendation-title">{rec.title}</span>
                  <span className="recommendation-priority">{rec.priority}</span>
                </div>
                <p className="recommendation-description">{rec.description}</p>
                <button className="recommendation-action">
                  {rec.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductivityDashboard);