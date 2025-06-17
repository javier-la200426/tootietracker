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
import ChartDataLabels from 'chartjs-plugin-datalabels';
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
  const events = useFartStore((state) => state.events);
  const [selectedPeriod, setSelectedPeriod] = React.useState<'D' | 'W' | 'M' | '6M' | 'Y'>('W');
  const [currentOffset, setCurrentOffset] = React.useState(0);

  const periods = [
    { key: 'D' as const, label: 'D', fullLabel: 'Day' },
    { key: 'W' as const, label: 'W', fullLabel: 'Week' },
    { key: 'M' as const, label: 'M', fullLabel: 'Month' },
    { key: '6M' as const, label: '6M', fullLabel: '6 Months' },
    { key: 'Y' as const, label: 'Y', fullLabel: 'Year' },
  ];

  const getChartData = () => {
    const now = new Date();
    let data: { date: string; count: number }[] = [];
    let yAxisLabel = 'Farts';
    let chartTitle = '';

    switch (selectedPeriod) {
      case 'D': {
        // Show hourly data for a single day
        const targetDate = new Date(now.getTime() - currentOffset * 24 * 60 * 60 * 1000);
        const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        chartTitle = targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        yAxisLabel = 'Farts per Hour';
        
        // Create 24 hour buckets
        for (let hour = 0; hour < 24; hour++) {
          const hourStart = new Date(dayStart.getTime() + hour * 60 * 60 * 1000);
          const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
          
          const count = events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= hourStart && eventDate < hourEnd;
          }).length;
          
          data.push({
            date: `${hour}:00`,
            count
          });
        }
        break;
      }
      case 'W': {
        // Show daily data for a week (current implementation)
        yAxisLabel = 'Farts per Day';
        const weekStart = new Date(now.getTime() - (currentOffset * 7 + 6) * 24 * 60 * 60 * 1000);
        chartTitle = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - (currentOffset * 7 + i) * 24 * 60 * 60 * 1000);
          const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
          
          const count = events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= date && eventDate < nextDate;
          }).length;
          
          data.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            count
          });
        }
        break;
      }
      case 'M': {
        // Show daily data for a month
        yAxisLabel = 'Farts per Day';
        const targetMonth = new Date(now.getFullYear(), now.getMonth() - currentOffset, 1);
        const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
        const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
        
        chartTitle = targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        for (let day = 1; day <= monthEnd.getDate(); day++) {
          const date = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day);
          const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
          
          const count = events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= date && eventDate < nextDate;
          }).length;
          
          data.push({
            date: day.toString(),
            count
          });
        }
        break;
      }
      case '6M': {
        // Show monthly data for 6 months
        yAxisLabel = 'Farts per Month';
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6 - currentOffset * 6, 1);
        chartTitle = `${sixMonthsAgo.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + 6, 0).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
        
        for (let month = 0; month < 6; month++) {
          const monthStart = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + month, 1);
          const monthEnd = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + month + 1, 0);
          
          const count = events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= monthStart && eventDate <= monthEnd;
          }).length;
          
          data.push({
            date: monthStart.toLocaleDateString('en-US', { month: 'short' }),
            count
          });
        }
        break;
      }
      case 'Y': {
        // Show monthly data for a year
        yAxisLabel = 'Farts per Month';
        const targetYear = now.getFullYear() - currentOffset;
        chartTitle = targetYear.toString();
        
        for (let month = 0; month < 12; month++) {
          const monthStart = new Date(targetYear, month, 1);
          const monthEnd = new Date(targetYear, month + 1, 0);
          
          const count = events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= monthStart && eventDate <= monthEnd;
          }).length;
          
          data.push({
            date: monthStart.toLocaleDateString('en-US', { month: 'short' }),
            count
          });
        }
        break;
      }
    }

    return { data, yAxisLabel, chartTitle };
  };

  const { data: chartData, yAxisLabel, chartTitle } = getChartData();

  const data = {
    labels: chartData.map(d => d.date),
    datasets: [
      {
        label: yAxisLabel,
        data: chartData.map(d => d.count),
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
        title: {
          display: true,
          text: yAxisLabel,
          font: {
            size: 14,
            weight: 'bold' as const,
            family: 'system-ui, -apple-system, sans-serif',
          },
          color: '#374151',
        },
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

  const canNavigateBack = () => {
    // Prevent going too far back (e.g., more than 2 years)
    return currentOffset < 24;
  };

  const canNavigateForward = () => {
    // Prevent going into the future
    return currentOffset > 0;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* Header with title and navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Activity</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentOffset(prev => prev + 1)}
            disabled={!canNavigateBack()}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
            {chartTitle}
          </span>
          <button
            onClick={() => setCurrentOffset(prev => prev - 1)}
            disabled={!canNavigateForward()}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => {
                setSelectedPeriod(period.key);
                setCurrentOffset(0); // Reset to current period when switching
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                selectedPeriod === period.key
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
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
        title: {
          display: true,
          text: 'Frequency',
          font: {
            size: 14,
            weight: 'bold' as const,
            family: 'system-ui, -apple-system, sans-serif',
          },
          color: '#374151',
        },
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
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Smell Profile</h3>
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
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)', 
          'rgba(156, 163, 175, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 13,
            weight: 'normal' as const,
          },
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const count = data.datasets[0].data[i];
                const percentage = ((count / totalWithSmell) * 100).toFixed(1);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 2,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const percentage = ((context.parsed / totalWithSmell) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} farts (${percentage}%)`;
          },
        },
      },
      // Add data labels plugin for percentages on chart
      datalabels: {
        display: function(context: any) {
          const percentage = ((context.parsed / totalWithSmell) * 100);
          return percentage >= 5; // Only show labels for segments >= 5%
        },
        color: '#ffffff',
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        formatter: function(value: number) {
          const percentage = ((value / totalWithSmell) * 100).toFixed(1);
          return `${percentage}%`;
        },
        anchor: 'center' as const,
        align: 'center' as const,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Smell Profile</h3>
      <div className="h-80">
        <Doughnut data={data} options={options} plugins={[ChartDataLabels]} />
      </div>
    </div>
  );
}

export function SmellTrendChart() {
  const events = useFartStore((state) => state.events);
  const [selectedPeriod, setSelectedPeriod] = React.useState<'D' | 'W' | 'M' | '6M' | 'Y'>('W');
  const [currentOffset, setCurrentOffset] = React.useState(0);

  const periods = [
    { key: 'D' as const, label: 'D', fullLabel: 'Day' },
    { key: 'W' as const, label: 'W', fullLabel: 'Week' },
    { key: 'M' as const, label: 'M', fullLabel: 'Month' },
    { key: '6M' as const, label: '6M', fullLabel: '6 Months' },
    { key: 'Y' as const, label: 'Y', fullLabel: 'Year' },
  ];

  const getChartData = () => {
    const now = new Date();
    let data: { date: string; avgSmell: number; count: number }[] = [];
    let chartTitle = '';

    switch (selectedPeriod) {
      case 'D': {
        // Show hourly smell data for a single day
        const targetDate = new Date(now.getTime() - currentOffset * 24 * 60 * 60 * 1000);
        const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        
        chartTitle = targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        
        // Create 24 hour buckets
        for (let hour = 0; hour < 24; hour++) {
          const hourStart = new Date(dayStart.getTime() + hour * 60 * 60 * 1000);
          const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
          
          const hourEvents = events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= hourStart && eventDate < hourEnd && event.smellIntensity;
          });
          
          const avgSmell = hourEvents.length > 0 
            ? hourEvents.reduce((sum, event) => sum + (event.smellIntensity?.level || 0), 0) / hourEvents.length
            : 0;
          
          data.push({
            date: `${hour}:00`,
            avgSmell: parseFloat(avgSmell.toFixed(1)),
            count: hourEvents.length,
          });
        }
        break;
      }
      case 'W': {
        // Show daily smell data for a week
        const weekStart = new Date(now.getTime() - (currentOffset * 7 + 6) * 24 * 60 * 60 * 1000);
        chartTitle = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - (currentOffset * 7 + i) * 24 * 60 * 60 * 1000);
          const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
          
          const dayEvents = events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= date && eventDate < nextDate && event.smellIntensity;
          });
          
          const avgSmell = dayEvents.length > 0 
            ? dayEvents.reduce((sum, event) => sum + (event.smellIntensity?.level || 0), 0) / dayEvents.length
            : 0;
          
          data.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            avgSmell: parseFloat(avgSmell.toFixed(1)),
            count: dayEvents.length,
          });
        }
        break;
      }
      case 'M': {
        // Show daily smell data for a month
        const targetMonth = new Date(now.getFullYear(), now.getMonth() - currentOffset, 1);
        const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
        
        chartTitle = targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        for (let day = 1; day <= monthEnd.getDate(); day++) {
          const date = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day);
          const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
          
          const dayEvents = events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= date && eventDate < nextDate && event.smellIntensity;
          });
          
          const avgSmell = dayEvents.length > 0 
            ? dayEvents.reduce((sum, event) => sum + (event.smellIntensity?.level || 0), 0) / dayEvents.length
            : 0;
          
          data.push({
            date: day.toString(),
            avgSmell: parseFloat(avgSmell.toFixed(1)),
            count: dayEvents.length,
          });
        }
        break;
      }
      case '6M': {
        // Show monthly smell data for 6 months
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6 - currentOffset * 6, 1);
        chartTitle = `${sixMonthsAgo.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + 6, 0).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
        
        for (let month = 0; month < 6; month++) {
          const monthStart = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + month, 1);
          const monthEnd = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + month + 1, 0);
          
          const monthEvents = events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= monthStart && eventDate <= monthEnd && event.smellIntensity;
          });
          
          const avgSmell = monthEvents.length > 0 
            ? monthEvents.reduce((sum, event) => sum + (event.smellIntensity?.level || 0), 0) / monthEvents.length
            : 0;
          
          data.push({
            date: monthStart.toLocaleDateString('en-US', { month: 'short' }),
            avgSmell: parseFloat(avgSmell.toFixed(1)),
            count: monthEvents.length,
          });
        }
        break;
      }
      case 'Y': {
        // Show monthly smell data for a year
        const targetYear = now.getFullYear() - currentOffset;
        chartTitle = targetYear.toString();
        
        for (let month = 0; month < 12; month++) {
          const monthStart = new Date(targetYear, month, 1);
          const monthEnd = new Date(targetYear, month + 1, 0);
          
          const monthEvents = events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= monthStart && eventDate <= monthEnd && event.smellIntensity;
          });
          
          const avgSmell = monthEvents.length > 0 
            ? monthEvents.reduce((sum, event) => sum + (event.smellIntensity?.level || 0), 0) / monthEvents.length
            : 0;
          
          data.push({
            date: monthStart.toLocaleDateString('en-US', { month: 'short' }),
            avgSmell: parseFloat(avgSmell.toFixed(1)),
            count: monthEvents.length,
          });
        }
        break;
      }
    }

    return { data, chartTitle };
  };

  const { data: smellData, chartTitle } = getChartData();
  const hasData = smellData.some(d => d.count > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* Header with title and navigation */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Smell Trend</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentOffset(prev => prev + 1)}
              disabled={currentOffset >= 24}
              className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
              {chartTitle}
            </span>
            <button
              onClick={() => setCurrentOffset(prev => prev - 1)}
              disabled={currentOffset <= 0}
              className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period.key}
                onClick={() => {
                  setSelectedPeriod(period.key);
                  setCurrentOffset(0);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  selectedPeriod === period.key
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-gray-500 py-8">
          <p className="text-2xl mb-2">📈</p>
          <p>Not enough smell data yet!</p>
          <p className="text-sm">Rate more farts to see trends</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: smellData.map(d => d.date),
    datasets: [
      {
        label: 'Average Smell Level',
        data: smellData.map(d => d.avgSmell),
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

  const canNavigateBack = () => {
    return currentOffset < 24;
  };

  const canNavigateForward = () => {
    return currentOffset > 0;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* Header with title and navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Smell Trend</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentOffset(prev => prev + 1)}
            disabled={!canNavigateBack()}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
            {chartTitle}
          </span>
          <button
            onClick={() => setCurrentOffset(prev => prev - 1)}
            disabled={!canNavigateForward()}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => {
                setSelectedPeriod(period.key);
                setCurrentOffset(0); // Reset to current period when switching
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                selectedPeriod === period.key
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <Line data={data} options={options} />
    </div>
  );
}