import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Analytics() {
  const { id: serverId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [serverId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/features/analytics/${serverId}?days=${timeRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-container">
        <div className="error">Failed to load analytics</div>
      </div>
    );
  }

  // Prepare chart data
  const casesByTypeData = {
    labels: analytics.casesByType.map(item => item._id),
    datasets: [{
      label: 'Moderation Actions',
      data: analytics.casesByType.map(item => item.count),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 2
    }]
  };

  const casesOverTimeData = {
    labels: analytics.casesOverTime.map(item => new Date(item._id).toLocaleDateString()),
    datasets: [{
      label: 'Moderation Cases',
      data: analytics.casesOverTime.map(item => item.count),
      fill: true,
      backgroundColor: 'rgba(0, 217, 255, 0.2)',
      borderColor: '#00d9ff',
      borderWidth: 2,
      tension: 0.4,
      pointBackgroundColor: '#00d9ff',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4
    }]
  };

  const topModeratorsData = {
    labels: analytics.topModerators.map(item => item.moderator || 'Unknown'),
    datasets: [{
      label: 'Actions',
      data: analytics.topModerators.map(item => item.count),
      backgroundColor: 'rgba(0, 217, 255, 0.6)',
      borderColor: '#00d9ff',
      borderWidth: 2
    }]
  };

  const messageActivityData = {
    labels: analytics.messageActivity.map(item => new Date(item._id).toLocaleDateString()),
    datasets: [
      {
        label: 'Deleted',
        data: analytics.messageActivity.map(item => item.deleted),
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: 'Edited',
        data: analytics.messageActivity.map(item => item.edited),
        fill: true,
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#00d9ff',
        bodyColor: '#fff',
        borderColor: '#00d9ff',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        ticks: { color: '#aaa' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: '#aaa' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#fff',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#00d9ff',
        bodyColor: '#fff',
        borderColor: '#00d9ff',
        borderWidth: 1
      }
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <div className="analytics-container">
          <div className="analytics-header">
        <h1>📊 Analytics Dashboard</h1>
        <div className="time-selector">
          <button 
            className={timeRange === 7 ? 'active' : ''} 
            onClick={() => setTimeRange(7)}
          >
            7 Days
          </button>
          <button 
            className={timeRange === 30 ? 'active' : ''} 
            onClick={() => setTimeRange(30)}
          >
            30 Days
          </button>
          <button 
            className={timeRange === 90 ? 'active' : ''} 
            onClick={() => setTimeRange(90)}
          >
            90 Days
          </button>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <div className="stat-value">{analytics.memberStats.joins}</div>
            <div className="stat-label">Members Joined</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👋</div>
          <div className="stat-info">
            <div className="stat-value">{analytics.memberStats.leaves}</div>
            <div className="stat-label">Members Left</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛡️</div>
          <div className="stat-info">
            <div className="stat-value">
              {analytics.casesByType.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <div className="stat-label">Total Actions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-value">{analytics.commandsUsage.length}</div>
            <div className="stat-label">Custom Commands</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Moderation Actions by Type</h3>
          <div className="chart-wrapper">
            <Pie data={casesByTypeData} options={pieOptions} />
          </div>
        </div>

        <div className="chart-card full-width">
          <h3>Moderation Activity Over Time</h3>
          <div className="chart-wrapper">
            <Line data={casesOverTimeData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Top Moderators</h3>
          <div className="chart-wrapper">
            <Bar data={topModeratorsData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Message Activity</h3>
          <div className="chart-wrapper">
            <Line data={messageActivityData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card full-width">
          <h3>Most Used Custom Commands</h3>
          <div className="commands-list">
            {analytics.commandsUsage.slice(0, 10).map((cmd, index) => (
              <div key={index} className="command-item">
                <div className="command-trigger">!{cmd.trigger}</div>
                <div className="command-uses">{cmd.uses} uses</div>
              </div>
            ))}
            {analytics.commandsUsage.length === 0 && (
              <div className="no-data">No custom commands created yet</div>
            )}
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
