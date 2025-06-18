import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
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

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && canNavigateForward()) {
      setCurrentOffset(prev => prev - 1);
    } else if (direction === 'right' && canNavigateBack()) {
      setCurrentOffset(prev => prev + 1);
    }
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

      {/* Chart with swipe gestures */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(event: any, info: any) => {
          const threshold = 50; // Minimum drag distance to trigger navigation
          if (info.offset.x > threshold) {
            handleSwipe('right');
          } else if (info.offset.x < -threshold) {
            handleSwipe('left');
          }
        }}
        className="cursor-grab active:cursor-grabbing"
        whileDrag={{ scale: 0.98 }}
      >
        <Line data={data} options={options} />
      </motion.div>
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

  // Enhanced color palette with gradients
  const colors = [
    '#9333ea', // Purple
    '#3b82f6', // Blue  
    '#10b981', // Green
    '#f59e0b', // Orange
    '#ef4444', // Red
  ];

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        const data = params[0];
        return `${data.name}<br/>Frequency: <strong>${data.value}</strong>`;
      }
    },
    grid: { 
      left: 70, 
      right: 20, 
      top: 40, 
      bottom: 60,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: topTriggers.map(t => `${t.emoji} ${t.label}`),
      axisLabel: {
        interval: 0,
        rotate: topTriggers.length > 3 ? 45 : 0,
        fontSize: 12,
        color: '#6b7280'
      },
      axisTick: {
        alignWithLabel: true
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Frequency',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        rotation: 90,
        fontSize: 16,
        color: '#374151',
        fontWeight: 'bold'
      },
      axisLabel: {
        fontSize: 11,
        color: '#6b7280'
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed'
        }
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    series: [
      {
        type: 'bar',
        data: topTriggers.map((trigger, index) => ({
          value: trigger.count || 0,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors[index % colors.length] },
              { offset: 1, color: colors[index % colors.length] + '80' }
            ]),
            borderRadius: [4, 4, 0, 0]
          }
        })),
        barWidth: '60%',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowOffsetY: 5
          }
        },
        animationDelay: function (idx: number) {
          return idx * 100;
        }
      }
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  } as echarts.EChartsCoreOption;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Triggers</h3>
      <ReactECharts 
        option={option} 
        style={{ height: 280 }} 
        notMerge 
        lazyUpdate
        opts={{
          devicePixelRatio: window.devicePixelRatio,
          renderer: 'svg'
        }}
      />
    </div>
  );
}

export function SmellChart() {
  const events = useFartStore((state) => state.events);
  
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
      smellCounts[event.smellIntensity.id as keyof typeof smellCounts]++;
    }
  });

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

  // Enhanced smell data with better colors and gradients
  const smellData = [
    { 
      name: '😇 Fresh', 
      value: smellCounts.fresh,
      color: ['#22c55e', '#16a34a'] // Green gradient
    },
    { 
      name: '😊 Light', 
      value: smellCounts.light,
      color: ['#3b82f6', '#2563eb'] // Blue gradient
    },
    { 
      name: '😐 Meh', 
      value: smellCounts.meh,
      color: ['#9ca3af', '#6b7280'] // Gray gradient
    },
    { 
      name: '😬 Stinky', 
      value: smellCounts.stinky,
      color: ['#f59e0b', '#d97706'] // Orange gradient
    },
    { 
      name: '🤢 Toxic', 
      value: smellCounts.toxic,
      color: ['#ef4444', '#dc2626'] // Red gradient
    }
  ].filter(item => item.value > 0); // Only show categories with data

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        const percentage = ((params.value / totalWithSmell) * 100).toFixed(1);
        return `<div style="padding: 8px;">
          <div style="font-weight: bold; margin-bottom: 4px;">${params.name}</div>
          <div>Count: <strong>${params.value}</strong> farts</div>
          <div>Percentage: <strong>${percentage}%</strong></div>
        </div>`;
      }
    },
    legend: {
      orient: 'horizontal',
      top: '78%',
      left: 'center',
      itemGap: 20,
      textStyle: {
        fontSize: 13,
        color: '#374151'
      },
      formatter: function(name: string) {
        const item = smellData.find(d => d.name === name);
        const percentage = item ? ((item.value / totalWithSmell) * 100).toFixed(1) : '0';
        return `${name} (${percentage}%)`;
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'], // Donut style
        center: ['50%', '40%'],
        data: smellData.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
              { offset: 0, color: item.color[0] },
              { offset: 1, color: item.color[1] }
            ]),
            borderWidth: 2,
            borderColor: '#ffffff',
            shadowBlur: 8,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              borderWidth: 3,
              borderColor: '#ffffff'
            }
          },
          label: {
            show: false
          }
        })),
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx: number) {
          return Math.random() * 200;
        }
      }
    ],
    animation: true,
    animationDuration: 1200
  } as echarts.EChartsCoreOption;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Smell Profile</h3>
      <div className="h-80">
        <ReactECharts 
          option={option} 
          style={{ height: '100%', width: '100%' }} 
          notMerge 
          lazyUpdate
          opts={{
            devicePixelRatio: window.devicePixelRatio,
            renderer: 'svg'
          }}
        />
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

  const handleSwipeSmell = (direction: 'left' | 'right') => {
    if (direction === 'left' && canNavigateForward()) {
      setCurrentOffset(prev => prev - 1);
    } else if (direction === 'right' && canNavigateBack()) {
      setCurrentOffset(prev => prev + 1);
    }
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

      {/* Chart with swipe gestures */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(event: any, info: any) => {
          const threshold = 50; // Minimum drag distance to trigger navigation
          if (info.offset.x > threshold) {
            handleSwipeSmell('right');
          } else if (info.offset.x < -threshold) {
            handleSwipeSmell('left');
          }
        }}
        className="cursor-grab active:cursor-grabbing"
        whileDrag={{ scale: 0.98 }}
      >
        <Line data={data} options={options} />
      </motion.div>
    </div>
  );
}