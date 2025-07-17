// AI Service for Smart Task Manager
// Implements various AI-powered features for enhanced productivity

class AIService {
  constructor() {
    this.initialized = false;
    this.models = {
      nlp: null,
      sentiment: null,
      similarity: null
    };
    this.init();
  }

  async init() {
    try {
      // Initialize AI models (in a real app, you'd load actual ML models)
      console.log('Initializing AI Service...');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize AI Service:', error);
    }
  }

  // Smart task categorization using NLP
  categorizeTask(title, description = '') {
    const text = (title + ' ' + description).toLowerCase();
    
    // Work-related keywords
    const workKeywords = [
      'meeting', 'email', 'report', 'presentation', 'project', 'deadline',
      'client', 'team', 'office', 'work', 'business', 'budget', 'analysis',
      'development', 'code', 'testing', 'deployment', 'review', 'document'
    ];
    
    // Personal keywords
    const personalKeywords = [
      'grocery', 'shopping', 'family', 'home', 'personal', 'health',
      'doctor', 'gym', 'exercise', 'friend', 'hobby', 'vacation',
      'clean', 'cook', 'read', 'movie', 'birthday', 'anniversary'
    ];
    
    // Urgent keywords
    const urgentKeywords = [
      'urgent', 'asap', 'emergency', 'critical', 'important', 'deadline',
      'overdue', 'priority', 'immediately', 'rush', 'fix', 'bug', 'issue'
    ];
    
    let scores = { work: 0, personal: 0, urgent: 0 };
    
    // Calculate scores
    workKeywords.forEach(keyword => {
      if (text.includes(keyword)) scores.work++;
    });
    
    personalKeywords.forEach(keyword => {
      if (text.includes(keyword)) scores.personal++;
    });
    
    urgentKeywords.forEach(keyword => {
      if (text.includes(keyword)) scores.urgent += 2; // Urgent gets higher weight
    });
    
    // Determine category
    const maxScore = Math.max(scores.work, scores.personal, scores.urgent);
    
    if (maxScore === 0) return 'personal'; // Default
    if (scores.urgent === maxScore) return 'urgent';
    if (scores.work === maxScore) return 'work';
    return 'personal';
  }

  // Smart deadline estimation
  estimateDeadline(title, description = '') {
    const text = (title + ' ' + description).toLowerCase();
    
    // Task complexity indicators
    const complexityIndicators = {
      simple: ['call', 'email', 'text', 'quick', 'simple', 'easy'],
      medium: ['review', 'update', 'check', 'organize', 'plan'],
      complex: ['develop', 'create', 'build', 'design', 'analyze', 'research', 'write']
    };
    
    let complexity = 'medium';
    let maxMatches = 0;
    
    Object.entries(complexityIndicators).forEach(([level, keywords]) => {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        complexity = level;
      }
    });
    
    // Estimate hours based on complexity
    const hoursMap = {
      simple: 1,
      medium: 4,
      complex: 24
    };
    
    const estimatedHours = hoursMap[complexity];
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + estimatedHours);
    
    return {
      deadline: deadline.toISOString(),
      complexity,
      estimatedHours,
      confidence: maxMatches > 0 ? 0.8 : 0.5
    };
  }

  // Task priority scoring
  calculatePriority(task) {
    let score = 0;
    const now = new Date();
    
    // Deadline factor
    if (task.deadline) {
      const deadline = new Date(task.deadline);
      const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);
      
      if (hoursUntilDeadline < 2) score += 50;
      else if (hoursUntilDeadline < 24) score += 30;
      else if (hoursUntilDeadline < 168) score += 10;
    }
    
    // Category factor
    if (task.category === 'urgent') score += 40;
    else if (task.category === 'work') score += 20;
    else score += 10;
    
    // Text analysis
    const text = (task.title + ' ' + task.description).toLowerCase();
    const highPriorityWords = ['urgent', 'important', 'critical', 'asap', 'deadline'];
    const matches = highPriorityWords.filter(word => text.includes(word)).length;
    score += matches * 15;
    
    // Age factor (older tasks get slight boost)
    const age = (now - new Date(task.createdAt)) / (1000 * 60 * 60 * 24);
    score += Math.min(age * 2, 20);
    
    return Math.min(Math.max(score, 0), 100);
  }

  // Smart task suggestions
  generateTaskSuggestions(existingTasks, userProfile = {}) {
    const suggestions = [];
    
    // Analyze patterns in existing tasks
    const categories = existingTasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {});
    
    const completedTasks = existingTasks.filter(task => task.completed);
    const pendingTasks = existingTasks.filter(task => !task.completed);
    
    // Suggest based on patterns
    if (categories.work > 0) {
      suggestions.push({
        title: 'Review daily goals',
        description: 'Take a moment to review and adjust your daily objectives',
        category: 'work',
        reason: 'Based on your work tasks pattern',
        confidence: 0.7
      });
    }
    
    if (pendingTasks.length > 5) {
      suggestions.push({
        title: 'Prioritize task backlog',
        description: 'Review and prioritize your pending tasks',
        category: 'work',
        reason: 'You have many pending tasks',
        confidence: 0.9
      });
    }
    
    // Time-based suggestions
    const hour = new Date().getHours();
    if (hour < 10) {
      suggestions.push({
        title: 'Plan your day',
        description: 'Set priorities and goals for today',
        category: 'personal',
        reason: 'Good morning routine',
        confidence: 0.8
      });
    }
    
    if (hour > 17) {
      suggestions.push({
        title: 'Review today\'s progress',
        description: 'Reflect on what you accomplished today',
        category: 'personal',
        reason: 'End of day routine',
        confidence: 0.7
      });
    }
    
    // Recurring task suggestions
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentTasks = existingTasks.filter(task => 
      new Date(task.createdAt) > lastWeek
    );
    
    if (recentTasks.length < 3) {
      suggestions.push({
        title: 'Set weekly goals',
        description: 'Define your objectives for this week',
        category: 'personal',
        reason: 'Low activity detected',
        confidence: 0.6
      });
    }
    
    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  // Smart task completion prediction
  predictTaskCompletion(task, userHistory = []) {
    const factors = {
      category: 0,
      complexity: 0,
      deadline: 0,
      userPattern: 0
    };
    
    // Category-based prediction
    const categoryCompletionRates = {
      urgent: 0.85,
      work: 0.75,
      personal: 0.65
    };
    factors.category = categoryCompletionRates[task.category] || 0.7;
    
    // Deadline pressure
    if (task.deadline) {
      const now = new Date();
      const deadline = new Date(task.deadline);
      const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);
      
      if (hoursUntilDeadline < 2) factors.deadline = 0.9;
      else if (hoursUntilDeadline < 24) factors.deadline = 0.8;
      else factors.deadline = 0.6;
    } else {
      factors.deadline = 0.5;
    }
    
    // User pattern analysis
    if (userHistory.length > 0) {
      const completionRate = userHistory.filter(t => t.completed).length / userHistory.length;
      factors.userPattern = completionRate;
    } else {
      factors.userPattern = 0.7;
    }
    
    // Complexity estimation
    const text = (task.title + ' ' + task.description).toLowerCase();
    const complexWords = ['develop', 'create', 'design', 'analyze', 'research'];
    const hasComplexity = complexWords.some(word => text.includes(word));
    factors.complexity = hasComplexity ? 0.6 : 0.8;
    
    // Weighted average
    const weights = { category: 0.3, complexity: 0.2, deadline: 0.3, userPattern: 0.2 };
    const prediction = Object.entries(factors).reduce((sum, [key, value]) => 
      sum + (value * weights[key]), 0
    );
    
    return {
      probability: Math.round(prediction * 100),
      factors,
      recommendation: prediction > 0.7 ? 'high' : prediction > 0.5 ? 'medium' : 'low'
    };
  }

  // Sentiment analysis for task descriptions
  analyzeSentiment(text) {
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'happy', 'excited', 'looking forward', 'enjoy', 'love', 'like'
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'hate', 'dislike', 'stressed',
      'worried', 'anxious', 'difficult', 'hard', 'challenging', 'overwhelming'
    ];
    
    const urgentWords = [
      'urgent', 'critical', 'emergency', 'asap', 'immediately', 'rush'
    ];
    
    const lowerText = text.toLowerCase();
    
    let positiveScore = positiveWords.filter(word => lowerText.includes(word)).length;
    let negativeScore = negativeWords.filter(word => lowerText.includes(word)).length;
    let urgentScore = urgentWords.filter(word => lowerText.includes(word)).length;
    
    // Determine dominant sentiment
    let sentiment = 'neutral';
    let confidence = 0.5;
    
    if (urgentScore > 0) {
      sentiment = 'urgent';
      confidence = 0.8;
    } else if (positiveScore > negativeScore) {
      sentiment = 'positive';
      confidence = positiveScore / (positiveScore + negativeScore + 1);
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative';
      confidence = negativeScore / (positiveScore + negativeScore + 1);
    }
    
    return {
      sentiment,
      confidence: Math.round(confidence * 100),
      scores: {
        positive: positiveScore,
        negative: negativeScore,
        urgent: urgentScore
      }
    };
  }

  // Smart task breaking down
  breakDownTask(task) {
    const text = (task.title + ' ' + task.description).toLowerCase();
    const subtasks = [];
    
    // Common task breakdown patterns
    const patterns = [
      {
        trigger: ['project', 'develop', 'create', 'build'],
        subtasks: [
          'Plan and research requirements',
          'Create initial design/outline',
          'Implement core functionality',
          'Test and review',
          'Finalize and deliver'
        ]
      },
      {
        trigger: ['meeting', 'presentation'],
        subtasks: [
          'Prepare agenda/outline',
          'Gather necessary materials',
          'Practice/rehearse',
          'Conduct meeting/presentation',
          'Follow up on action items'
        ]
      },
      {
        trigger: ['report', 'document', 'write'],
        subtasks: [
          'Research and gather information',
          'Create outline/structure',
          'Write first draft',
          'Review and edit',
          'Finalize and submit'
        ]
      },
      {
        trigger: ['organize', 'clean', 'sort'],
        subtasks: [
          'Assess current state',
          'Plan organization system',
          'Remove unnecessary items',
          'Organize remaining items',
          'Maintain system'
        ]
      }
    ];
    
    // Find matching pattern
    const matchingPattern = patterns.find(pattern => 
      pattern.trigger.some(trigger => text.includes(trigger))
    );
    
    if (matchingPattern) {
      return matchingPattern.subtasks.map((subtask, index) => ({
        title: subtask,
        description: `Step ${index + 1} of "${task.title}"`,
        category: task.category,
        parentTaskId: task.id,
        order: index
      }));
    }
    
    // Generic breakdown for other tasks
    return [
      {
        title: `Start: ${task.title}`,
        description: 'Begin working on this task',
        category: task.category,
        parentTaskId: task.id,
        order: 0
      },
      {
        title: `Review progress: ${task.title}`,
        description: 'Check progress and adjust if needed',
        category: task.category,
        parentTaskId: task.id,
        order: 1
      },
      {
        title: `Complete: ${task.title}`,
        description: 'Finish and verify completion',
        category: task.category,
        parentTaskId: task.id,
        order: 2
      }
    ];
  }

  // Smart scheduling suggestions
  suggestOptimalTime(task, existingTasks = [], userPreferences = {}) {
    const now = new Date();
    const suggestions = [];
    
    // User's productive hours (can be learned from patterns)
    const productiveHours = userPreferences.productiveHours || [9, 10, 11, 14, 15, 16];
    
    // Category-based optimal times
    const categoryTimes = {
      work: productiveHours,
      personal: [7, 8, 18, 19, 20],
      urgent: [now.getHours()]
    };
    
    const optimalHours = categoryTimes[task.category] || productiveHours;
    
    // Find next available optimal time
    for (let day = 0; day < 7; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      
      optimalHours.forEach(hour => {
        const suggestedTime = new Date(date);
        suggestedTime.setHours(hour, 0, 0, 0);
        
        if (suggestedTime > now) {
          // Check if time slot is free
          const hasConflict = existingTasks.some(existingTask => {
            if (!existingTask.scheduledTime) return false;
            const existingTime = new Date(existingTask.scheduledTime);
            const timeDiff = Math.abs(suggestedTime - existingTime);
            return timeDiff < 2 * 60 * 60 * 1000; // 2 hours buffer
          });
          
          if (!hasConflict) {
            suggestions.push({
              time: suggestedTime,
              reason: day === 0 ? 'Today during productive hours' : 
                     day === 1 ? 'Tomorrow during productive hours' :
                     `In ${day} days during productive hours`,
              confidence: productiveHours.includes(hour) ? 0.9 : 0.7
            });
          }
        }
      });
    }
    
    return suggestions.slice(0, 3);
  }

  // Generate productivity insights
  generateInsights(tasks, timeframe = 30) {
    const insights = [];
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - timeframe);
    
    const recentTasks = tasks.filter(task => 
      new Date(task.createdAt) >= startDate
    );
    
    const completedTasks = recentTasks.filter(task => task.completed);
    const completionRate = recentTasks.length > 0 ? 
      (completedTasks.length / recentTasks.length) * 100 : 0;
    
    // Completion rate insight
    if (completionRate > 80) {
      insights.push({
        type: 'positive',
        title: 'Excellent Productivity!',
        description: `You've completed ${completionRate.toFixed(1)}% of your tasks. Keep up the great work!`,
        actionable: false
      });
    } else if (completionRate < 50) {
      insights.push({
        type: 'improvement',
        title: 'Room for Improvement',
        description: `Your completion rate is ${completionRate.toFixed(1)}%. Consider breaking down large tasks.`,
        actionable: true,
        action: 'Break down complex tasks into smaller steps'
      });
    }
    
    // Category distribution
    const categoryDistribution = recentTasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {});
    
    const dominantCategory = Object.entries(categoryDistribution)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (dominantCategory) {
      insights.push({
        type: 'info',
        title: 'Task Focus Analysis',
        description: `Most of your tasks (${dominantCategory[1]}) are in the ${dominantCategory[0]} category.`,
        actionable: false
      });
    }
    
    // Overdue tasks insight
    const overdueTasks = recentTasks.filter(task => {
      if (!task.deadline || task.completed) return false;
      return new Date(task.deadline) < now;
    });
    
    if (overdueTasks.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Overdue Tasks Alert',
        description: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Address these first.`,
        actionable: true,
        action: 'Review and reschedule overdue tasks'
      });
    }
    
    return insights;
  }
}

// Create singleton instance
const aiService = new AIService();

export default aiService;