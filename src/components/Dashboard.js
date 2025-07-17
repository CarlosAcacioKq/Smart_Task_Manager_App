import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const Dashboard = ({ tasks }) => {
  const [chartData, setChartData] = useState({
    categoryData: [],
    statusData: [],
    dailyProgress: [],
    weeklyProgress: []
  });

  useEffect(() => {
    // Calculate category distribution
    const categoryStats = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {});

    const categoryData = Object.entries(categoryStats).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      percentage: Math.round((count / tasks.length) * 100)
    }));

    // Calculate status distribution
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = tasks.length - completedTasks;
    
    const statusData = [
      { name: 'Completed', value: completedTasks, color: '#10b981' },
      { name: 'Pending', value: pendingTasks, color: '#f59e0b' }
    ];

    // Generate daily progress (last 7 days)
    const dailyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Mock data for demonstration - in real app, you'd track daily completions
      const completed = Math.floor(Math.random() * 10) + 1;
      const created = Math.floor(Math.random() * 8) + completed;
      
      dailyProgress.push({
        day: dayName,
        completed,
        created,
        date: date.toISOString().split('T')[0]
      });
    }

    // Generate weekly progress (last 4 weeks)
    const weeklyProgress = [];
    for (let i = 3; i >= 0; i--) {
      const week = new Date();
      week.setDate(week.getDate() - (i * 7));
      const weekLabel = `Week ${4 - i}`;
      
      // Mock data for demonstration
      const completed = Math.floor(Math.random() * 30) + 10;
      const created = Math.floor(Math.random() * 25) + completed;
      
      weeklyProgress.push({
        week: weekLabel,
        completed,
        created,
        efficiency: Math.round((completed / created) * 100)
      });
    }

    setChartData({
      categoryData,
      statusData,
      dailyProgress,
      weeklyProgress
    });
  }, [tasks]);

  const categoryColors = {
    'Work': '#2563eb',
    'Personal': '#10b981',
    'Urgent': '#dc2626'
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    return tasks
      .filter(task => !task.completed && task.deadline)
      .filter(task => new Date(task.deadline) > now)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks
      .filter(task => !task.completed && task.deadline)
      .filter(task => new Date(task.deadline) < now);
  };

  const upcomingDeadlines = getUpcomingDeadlines();
  const overdueTasks = getOverdueTasks();

  // Calculate productivity metrics
  const completionRate = tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div className="dashboard">
      <h2>📊 Dashboard Overview</h2>
      
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{totalTasks}</div>
          <div className="metric-label">Total Tasks</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{completedTasks}</div>
          <div className="metric-label">Completed</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{pendingTasks}</div>
          <div className="metric-label">Pending</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{Math.round(completionRate)}%</div>
          <div className="metric-label">Completion Rate</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Category Distribution */}
        <div className="chart-card">
          <h3>Tasks by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={categoryColors[entry.name] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="chart-card">
          <h3>Task Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Progress */}
        <div className="chart-card">
          <h3>Daily Activity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.dailyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Progress */}
        <div className="chart-card">
          <h3>Weekly Efficiency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="efficiency" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="alerts-section">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <div className="alert-card overdue">
            <h3>⚠️ Overdue Tasks ({overdueTasks.length})</h3>
            <div className="alert-list">
              {overdueTasks.slice(0, 3).map(task => (
                <div key={task.id} className="alert-item">
                  <span className="alert-title">{task.title}</span>
                  <span className="alert-date">
                    Due: {new Date(task.deadline).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <div className="alert-card upcoming">
            <h3>📅 Upcoming Deadlines</h3>
            <div className="alert-list">
              {upcomingDeadlines.map(task => (
                <div key={task.id} className="alert-item">
                  <span className="alert-title">{task.title}</span>
                  <span className="alert-date">
                    Due: {new Date(task.deadline).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Productivity Insights */}
        <div className="alert-card insights">
          <h3>💡 Productivity Insights</h3>
          <div className="insight-list">
            <div className="insight-item">
              <span className="insight-metric">{completionRate.toFixed(1)}%</span>
              <span className="insight-label">Overall completion rate</span>
            </div>
            <div className="insight-item">
              <span className="insight-metric">{Math.round(totalTasks / 30)}</span>
              <span className="insight-label">Average tasks per day</span>
            </div>
            <div className="insight-item">
              <span className="insight-metric">
                {chartData.categoryData.length > 0 ? 
                  chartData.categoryData.reduce((max, cat) => cat.value > max.value ? cat : max).name : 'N/A'
                }
              </span>
              <span className="insight-label">Most active category</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;