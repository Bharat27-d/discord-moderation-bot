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
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Radar, Doughnut } from 'react-chartjs-2';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
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
  const [activeTab, setActiveTab] = useState('overview');
  const [realtimeData, setRealtimeData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [comparison, setComparison] = useState(null);

  const fetchAnalytics = React.useCallback(async () => {
    try {
      setLoading(true);
      const [comprehensiveData, realtimeStats, messageLeaderboard, growthPredictions, periodComparison] = await Promise.all([
        api.get(`/api/analytics/${serverId}/comprehensive?days=${timeRange}`),
        api.get(`/api/analytics/${serverId}/realtime`),
        api.get(`/api/analytics/${serverId}/leaderboard?type=messages&days=${timeRange}&limit=10`),
        api.get(`/api/analytics/${serverId}/predictions`),
        api.get(`/api/analytics/${serverId}/compare?days=${timeRange}`)
      ]);

      setAnalytics(comprehensiveData.data);
      setRealtimeData(realtimeStats.data);
      setLeaderboard(messageLeaderboard.data.leaderboard);
      setPredictions(growthPredictions.data);
      setComparison(periodComparison.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback to legacy endpoint
      try {
        const response = await api.get(`/api/features/analytics/${serverId}?days=${timeRange}`);
        setAnalytics({
          dailyAnalytics: [],
          moderation: { byType: response.data.casesByType || [], topModerators: response.data.topModerators || [] },
          growth: { memberStats: response.data.memberStats || {} },
          messages: { messageActivity: response.data.messageActivity || [] },
          topUsers: [],
          channels: [],
          commandsUsed: response.data.commandsUsage || []
        });
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, [serverId, timeRange]);

  useEffect(() => {
    fetchAnalytics();
    
    // Refresh realtime data every 30 seconds
    const interval = setInterval(async () => {
      try {
        const realtimeStats = await api.get(`/api/analytics/${serverId}/realtime`);
        setRealtimeData(realtimeStats.data);
      } catch (error) {
        console.error('Error refreshing realtime data:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAnalytics, serverId]);

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

  // Prepare chart data with safety checks
  const casesByType = analytics.moderation?.byType || analytics.casesByType || [];
  const casesOverTime = analytics.moderation?.overTime || analytics.casesOverTime || [];
  const topModerators = analytics.moderation?.topModerators || analytics.topModerators || [];
  const messageActivity = analytics.messages?.messageActivity || analytics.messageActivity || [];

  const casesByTypeData = {
    labels: casesByType.map(item => item._id),
    datasets: [{
      label: 'Moderation Actions',
      data: casesByType.map(item => item.count),
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
    labels: casesOverTime.map(item => new Date(item._id).toLocaleDateString()),
    datasets: [{
      label: 'Moderation Cases',
      data: casesOverTime.map(item => item.count),
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
    labels: topModerators.map(item => item.moderator || 'Unknown'),
    datasets: [{
      label: 'Actions',
      data: topModerators.map(item => item.count),
      backgroundColor: 'rgba(0, 217, 255, 0.6)',
      borderColor: '#00d9ff',
      borderWidth: 2
    }]
  };

  const messageActivityData = {
    labels: messageActivity.map(item => new Date(item._id).toLocaleDateString()),
    datasets: [
      {
        label: 'Deleted',
        data: messageActivity.map(item => item.deleted),
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: 'Edited',
        data: messageActivity.map(item => item.edited),
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
        <h1>📊 Advanced Analytics Dashboard</h1>
        <div className="header-controls">
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
          <button className="refresh-btn" onClick={fetchAnalytics} title="Refresh Data">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Real-time Stats Bar */}
      {realtimeData && (
        <div className="realtime-stats">
          <div className="realtime-badge">
            <span className="pulse-dot"></span>
            Live (Last 24h)
          </div>
          <div className="realtime-stat">
            <span className="stat-icon">💬</span>
            <span className="stat-value">{realtimeData.last24Hours.messages.toLocaleString()}</span>
            <span className="stat-label">Messages</span>
          </div>
          <div className="realtime-stat">
            <span className="stat-icon">📥</span>
            <span className="stat-value">{realtimeData.last24Hours.joins}</span>
            <span className="stat-label">Joins</span>
          </div>
          <div className="realtime-stat">
            <span className="stat-icon">📤</span>
            <span className="stat-value">{realtimeData.last24Hours.leaves}</span>
            <span className="stat-label">Leaves</span>
          </div>
          <div className="realtime-stat">
            <span className="stat-icon">🎤</span>
            <span className="stat-value">{realtimeData.last24Hours.activeVoice}</span>
            <span className="stat-label">Voice Active</span>
          </div>
          <div className="realtime-stat">
            <span className="stat-icon">🛡️</span>
            <span className="stat-value">{realtimeData.last24Hours.moderationActions}</span>
            <span className="stat-label">Mod Actions</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="analytics-tabs">
        <button 
          className={activeTab === 'overview' ? 'tab-active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === 'growth' ? 'tab-active' : ''}
          onClick={() => setActiveTab('growth')}
        >
          📈 Growth & Trends
        </button>
        <button 
          className={activeTab === 'engagement' ? 'tab-active' : ''}
          onClick={() => setActiveTab('engagement')}
        >
          🎯 Engagement
        </button>
        <button 
          className={activeTab === 'moderation' ? 'tab-active' : ''}
          onClick={() => setActiveTab('moderation')}
        >
          🛡️ Moderation
        </button>
        <button 
          className={activeTab === 'leaderboards' ? 'tab-active' : ''}
          onClick={() => setActiveTab('leaderboards')}
        >
          🏆 Leaderboards
        </button>
        <button 
          className={activeTab === 'predictions' ? 'tab-active' : ''}
          onClick={() => setActiveTab('predictions')}
        >
          🔮 Predictions
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">👤</div>
              <div className="stat-info">
                <div className="stat-value">{analytics.growth?.memberStats?.joins || analytics.memberStats?.joins || 0}</div>
                <div className="stat-label">Members Joined</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👋</div>
              <div className="stat-info">
                <div className="stat-value">{analytics.growth?.memberStats?.leaves || analytics.memberStats?.leaves || 0}</div>
                <div className="stat-label">Members Left</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛡️</div>
              <div className="stat-info">
                <div className="stat-value">
                  {casesByType.reduce((sum, item) => sum + item.count, 0)}
                </div>
                <div className="stat-label">Total Actions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <div className="stat-value">{analytics.commandsUsed?.length || analytics.commandsUsage?.length || 0}</div>
                <div className="stat-label">Custom Commands</div>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            {casesByType.length > 0 && (
              <div className="chart-card">
                <h3>Moderation Actions by Type</h3>
                <div className="chart-wrapper">
                  <Pie data={casesByTypeData} options={pieOptions} />
                </div>
              </div>
            )}

            {casesOverTime.length > 0 && (
              <div className="chart-card full-width">
                <h3>Moderation Activity Over Time</h3>
                <div className="chart-wrapper">
                  <Line data={casesOverTimeData} options={chartOptions} />
                </div>
              </div>
            )}

            {topModerators.length > 0 && (
              <div className="chart-card">
                <h3>Top Moderators</h3>
                <div className="chart-wrapper">
                  <Bar data={topModeratorsData} options={chartOptions} />
                </div>
              </div>
            )}

            {messageActivity.length > 0 && (
              <div className="chart-card">
                <h3>Message Activity</h3>
                <div className="chart-wrapper">
                  <Line data={messageActivityData} options={chartOptions} />
                </div>
              </div>
            )}
            
            {casesByType.length === 0 && casesOverTime.length === 0 && (
              <div className="chart-card full-width">
                <div className="no-data">
                  No analytics data available yet. Data will be collected as users interact with your server.
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'growth' && analytics.growth && (
        <div className="growth-section">
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-value">{analytics.growth.memberStats?.totalGrowth || 0}</div>
                <div className="stat-label">Net Growth</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <div className="stat-value">{analytics.growth.memberStats?.avgDailyJoins?.toFixed(1) || '0.0'}</div>
                <div className="stat-label">Avg Daily Joins</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📉</div>
              <div className="stat-info">
                <div className="stat-value">{analytics.growth.memberStats?.avgDailyLeaves?.toFixed(1) || '0.0'}</div>
                <div className="stat-label">Avg Daily Leaves</div>
              </div>
            </div>
          </div>
          {predictions && (
            <div className="chart-card full-width">
              <h3>🔮 Growth Predictions (Next 30 Days)</h3>
              <div className="prediction-info">
                <span>Confidence: {(predictions.confidence * 100).toFixed(1)}%</span>
                <span>Projected: {predictions.projected} members</span>
              </div>
              <div className="chart-wrapper">
                {/* Predictions chart would go here */}
                <div className="predictions-list">
                  {predictions.predictions?.map((pred, idx) => (
                    <div key={idx} className="prediction-item">
                      <span>Day {pred.day}</span>
                      <span>{Math.round(pred.predictedMembers)} members</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'engagement' && analytics.engagement && (
        <div className="engagement-section">
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-info">
                <div className="stat-value">{analytics.engagement.totalMessages?.toLocaleString() || 0}</div>
                <div className="stat-label">Total Messages</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-value">{analytics.engagement.activeUsers || 0}</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-value">{analytics.engagement.engagementRate?.toFixed(1) || '0.0'}%</div>
                <div className="stat-label">Engagement Rate</div>
              </div>
            </div>
          </div>
          <div className="charts-grid">
            {analytics.channels && analytics.channels.length > 0 && (
              <div className="chart-card">
                <h3>Most Active Channels</h3>
                <div className="channels-list">
                  {analytics.channels.slice(0, 10).map((ch, idx) => (
                    <div key={idx} className="channel-item">
                      <span className="channel-name">#{ch.channelName || ch.channelId}</span>
                      <span className="channel-count">{ch.messageCount} messages</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'moderation' && (
        <div className="moderation-section">
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <div className="stat-value">{analytics.moderation?.byType?.find(t => t._id === 'warn')?.count || 0}</div>
                <div className="stat-label">Warnings</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚫</div>
              <div className="stat-info">
                <div className="stat-value">{analytics.moderation?.byType?.find(t => t._id === 'ban')?.count || 0}</div>
                <div className="stat-label">Bans</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👢</div>
              <div className="stat-info">
                <div className="stat-value">{analytics.moderation?.byType?.find(t => t._id === 'kick')?.count || 0}</div>
                <div className="stat-label">Kicks</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <div className="stat-value">{analytics.moderation?.byType?.find(t => t._id === 'timeout')?.count || 0}</div>
                <div className="stat-label">Timeouts</div>
              </div>
            </div>
          </div>
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Actions by Type</h3>
              <div className="chart-wrapper">
                <Doughnut data={casesByTypeData} options={pieOptions} />
              </div>
            </div>
            <div className="chart-card">
              <h3>Top Moderators</h3>
              <div className="moderators-list">
                {analytics.moderation?.topModerators?.slice(0, 10).map((mod, idx) => (
                  <div key={idx} className="moderator-item">
                    <span className="rank">#{idx + 1}</span>
                    <span className="mod-name">{mod.moderator || 'Unknown'}</span>
                    <span className="mod-count">{mod.count} actions</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leaderboards' && leaderboard && (
        <div className="leaderboards-section">
          <div className="chart-card full-width">
            <h3>🏆 Top Users by Messages</h3>
            <div className="leaderboard-list">
              {leaderboard.map((user, idx) => (
                <div key={idx} className="leaderboard-item">
                  <span className="rank">#{idx + 1}</span>
                  <span className="user-name">{user.username}</span>
                  <span className="user-stat">{user.totalMessages} messages</span>
                  <span className="user-stat">{user.totalVoiceMinutes} voice mins</span>
                  <span className="user-score">Score: {Math.round(user.avgEngagement)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'predictions' && predictions && (
        <div className="predictions-section">
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <div className="stat-value">{(predictions.confidence * 100).toFixed(1)}%</div>
                <div className="stat-label">Confidence</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-value">{predictions.projected}</div>
                <div className="stat-label">Projected Members</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <div className="stat-value">+{predictions.projected - (analytics.growth?.memberStats?.current || 0)}</div>
                <div className="stat-label">Expected Growth</div>
              </div>
            </div>
          </div>
          <div className="chart-card full-width">
            <h3>Growth Prediction Model</h3>
            <p style={{ color: '#aaa', padding: '10px' }}>
              Based on {timeRange} days of historical data using linear regression analysis
            </p>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
