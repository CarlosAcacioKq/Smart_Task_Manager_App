import React from 'react';

const ProgressTracker = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getTasksByCategory = () => {
    const categories = ['work', 'personal', 'urgent'];
    return categories.map(category => {
      const categoryTasks = tasks.filter(task => task.category === category);
      const completedCategoryTasks = categoryTasks.filter(task => task.completed);
      return {
        category,
        total: categoryTasks.length,
        completed: completedCategoryTasks.length,
        percentage: categoryTasks.length > 0 ? (completedCategoryTasks.length / categoryTasks.length) * 100 : 0
      };
    });
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    const upcoming = tasks
      .filter(task => !task.completed && task.deadline)
      .filter(task => new Date(task.deadline) > now)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 3);
    
    return upcoming;
  };

  const categoryStats = getTasksByCategory();
  const upcomingDeadlines = getUpcomingDeadlines();

  return (
    <div className="progress-tracker">
      <h3>Progress Overview</h3>
      
      <div className="overall-progress">
        <div className="progress-header">
          <span>Overall Progress</span>
          <span>{completedTasks}/{totalTasks}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="progress-percentage">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>

      <div className="category-stats">
        <h4>By Category</h4>
        {categoryStats.map(stat => (
          <div key={stat.category} className="category-stat">
            <div className="category-header">
              <span className={`category-name ${stat.category}`}>
                {stat.category.charAt(0).toUpperCase() + stat.category.slice(1)}
              </span>
              <span>{stat.completed}/{stat.total}</span>
            </div>
            <div className="mini-progress-bar">
              <div 
                className={`mini-progress-fill ${stat.category}`}
                style={{ width: `${stat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {upcomingDeadlines.length > 0 && (
        <div className="upcoming-deadlines">
          <h4>Upcoming Deadlines</h4>
          {upcomingDeadlines.map(task => (
            <div key={task.id} className="deadline-item">
              <div className="deadline-task-title">{task.title}</div>
              <div className="deadline-date">
                {new Date(task.deadline).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;