import React, { useState } from 'react';

const TaskCard = ({ task, onUpdateTask, onDeleteTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description,
    category: task.category,
    deadline: task.deadline
  });

  const handleSave = () => {
    onUpdateTask(task.id, editedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask({
      title: task.title,
      description: task.description,
      category: task.category,
      deadline: task.deadline
    });
    setIsEditing(false);
  };

  const toggleCompleted = () => {
    onUpdateTask(task.id, { completed: !task.completed });
  };

  const getTimeRemaining = () => {
    if (!task.deadline) return null;
    
    const now = new Date();
    const deadline = new Date(task.deadline);
    const diff = deadline - now;
    
    if (diff <= 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    return 'Due soon';
  };

  const timeRemaining = getTimeRemaining();
  const isOverdue = timeRemaining === 'Overdue';

  return (
    <div className={`task-card ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
      <div className="task-header">
        <div className="task-header-left">
          <input
            type="checkbox"
            checked={task.completed || false}
            onChange={toggleCompleted}
            aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
          />
          <span className={`category-badge ${task.category}`}>
            {task.category}
          </span>
        </div>
        <div className="task-header-right">
          {timeRemaining && (
            <span className={`deadline-badge ${isOverdue ? 'overdue' : ''}`}>
              {timeRemaining}
            </span>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="task-edit-form">
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
            placeholder="Task title"
            aria-label="Edit task title"
          />
          <textarea
            value={editedTask.description}
            onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
            placeholder="Task description"
            aria-label="Edit task description"
          />
          <select
            value={editedTask.category}
            onChange={(e) => setEditedTask({...editedTask, category: e.target.value})}
            aria-label="Edit task category"
          >
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="urgent">Urgent</option>
          </select>
          <input
            type="datetime-local"
            value={editedTask.deadline}
            onChange={(e) => setEditedTask({...editedTask, deadline: e.target.value})}
            aria-label="Edit task deadline"
          />
          <div className="task-actions">
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="task-content">
          <h3 className="task-title">{task.title}</h3>
          {task.description && <p className="task-description">{task.description}</p>}
          {task.deadline && (
            <p className="task-deadline">
              Due: {new Date(task.deadline).toLocaleDateString()}
            </p>
          )}
          <div className="task-actions">
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              Edit
            </button>
            <button onClick={() => onDeleteTask(task.id)} className="delete-btn">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;