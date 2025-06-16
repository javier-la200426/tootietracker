import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler, // Add Filler plugin
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useFartStats } from '../hooks/useFartStats';
import { useFartStore } from '../store/fartStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler // Register Filler plugin
);

export function WeeklyChart() {
  const { dailyData } = useFartStats();

  const data = {
    labels: dailyData.map(d => d.date),
    datasets: [
      {
        label: 'Farts per day',
        data: dailyData.map(d => d.count),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Activity</h3>
      <Line data={data} options={options} />
    </div>
  );
}

export function TriggerChart() {
  const getTopTriggers = useFartStore((state) => state.getTopTriggers);
  
  // Get top 5 triggers using the store's aggregated counts
  const topTriggers = getTopTriggers(5);

  // If no triggers, show placeholder
  if (topTriggers.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Triggers</h3>
        <div className="text-center text-gray-500 py-8">
          <p className="text-2xl mb-2">🏷️</p>
          <p>No triggers logged yet!</p>
          <p className="text-sm">Add triggers after logging farts to see patterns</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: topTriggers.map(t => `${t.emoji} ${t.label}`),
    datasets: [
      {
        label: 'Trigger frequency',
        data: topTriggers.map(t => t.count || 0),
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Triggers</h3>
      <Bar data={data} options={options} />
    </div>
  );
}

export function SmellChart() {
  const events = useFartStore((state) => state.events);
  
  console.log('SmellChart - All events:', events); // Debug log
  console.log('SmellChart - Events with smell:', events.filter(e => e.smellIntensity)); // Debug log
  
  // Calculate smell distribution from events with smell data
  const smellCounts = {
    fresh: 0,
    light: 0,
    meh: 0,
    stinky: 0,
    toxic: 0,
  };

  events.forEach((event) => {
    if (event.smellIntensity) {
      console.log('Found smell data:', event.smellIntensity); // Debug log
      smellCounts[event.smellIntensity.id as keyof typeof smellCounts]++;
    }
  });

  console.log('SmellChart - Smell counts:', smellCounts); // Debug log

  const totalWithSmell = Object.values(smellCounts).reduce((sum, count) => sum + count, 0);

  // If no smell data, show placeholder
  if (totalWithSmell === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Smell Profile</h3>
        <div className="text-center text-gray-500 py-8">
          <p className="text-2xl mb-2">👃</p>
          <p>No smell data yet!</p>
          <p className="text-sm">Rate your farts to see your smell profile</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: ['😇 Fresh', '😊 Light', '😐 Meh', '😬 Stinky', '🤢 Toxic'],
    datasets: [
      {
        data: [
          smellCounts.fresh,
          smellCounts.light,
          smellCounts.meh,
          smellCounts.stinky,
          smellCounts.toxic,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Fresh - green
          'rgba(59, 130, 246, 0.8)',  // Light - blue
          'rgba(156, 163, 175, 0.8)', // Meh - gray
          'rgba(245, 158, 11, 0.8)',  // Stinky - orange
          'rgba(239, 68, 68, 0.8)',   // Toxic - red
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const percentage = ((context.parsed / totalWithSmell) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Smell Profile</h3>
      <div className="h-64">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}

export function SmellTrendChart() {
  const events = useFartStore((state) => state.events);
  
  // Get last 7 days of smell data
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const dailySmellData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= date && eventDate < nextDate && event.smellIntensity;
    });
    
    // Calculate average smell level for the day
    const avgSmell = dayEvents.length > 0 
      ? dayEvents.reduce((sum, event) => sum + (event.smellIntensity?.level || 0), 0) / dayEvents.length
      : 0;
    
    dailySmellData.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      avgSmell: parseFloat(avgSmell.toFixed(1)),
      count: dayEvents.length,
    });
  }

  const hasData = dailySmellData.some(d => d.count > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Smell Trend</h3>
        <div className="text-center text-gray-500 py-8">
          <p className="text-2xl mb-2">📈</p>
          <p>Not enough smell data yet!</p>
          <p className="text-sm">Rate more farts to see trends</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: dailySmellData.map(d => d.date),
    datasets: [
      {
        label: 'Average Smell Level',
        data: dailySmellData.map(d => d.avgSmell),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const smellLabels = ['', 'Fresh', 'Light', 'Meh', 'Stinky', 'Toxic'];
            const level = Math.round(context.parsed.y);
            return `Avg: ${context.parsed.y} (${smellLabels[level] || 'Unknown'})`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            const labels = ['', '😇', '😊', '😐', '😬', '🤢'];
            return labels[value] || '';
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Smell Trend</h3>
      <Line data={data} options={options} />
    </div>
  );
}