import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useFartStore } from '../store/fartStore';
import { useStealthMode } from '../contexts/StealthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Point {
  date: string;
  value: number;
}

export default function EChartsActivity() {
  const { isSecretMode } = useStealthMode();
  const events = useFartStore((s) => s.events);
  const settings = useFartStore((s) => s.settings);
  const [period, setPeriod] = useState<'D' | 'W' | 'M' | '6M' | 'Y'>('W');
  const [offset, setOffset] = useState(0);

  React.useEffect(() => setOffset(0), [period]);

  const periods = [
    { key: 'D' as const, label: 'D' },
    { key: 'W' as const, label: 'W' },
    { key: 'M' as const, label: 'M' },
    { key: '6M' as const, label: '6M' },
    { key: 'Y' as const, label: 'Y' },
  ];

  const getNavigationText = () => {
    const now = new Date();
    
    switch (period) {
      case 'D': {
        const targetDate = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
        return targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      }
      case 'W': {
        const weekStart = new Date(now.getTime() - (offset * 7 + 6) * 24 * 60 * 60 * 1000);
        return `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
      case 'M': {
        const targetMonth = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        return targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      case '6M': {
        const sixMonthsEnd = new Date(now.getFullYear(), now.getMonth() - offset * 6, 1);
        const sixMonthsStart = new Date(sixMonthsEnd.getFullYear(), sixMonthsEnd.getMonth() - 5, 1);
        return `${sixMonthsStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${sixMonthsEnd.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
      }
      case 'Y': {
        const targetYear = now.getFullYear() - offset;
        return targetYear.toString();
      }
    }
  };

  const { labels, values, yAxisLabel } = useMemo(() => {
    const now = new Date();
    const getShiftedDate = (base: Date, amount: number, unitMs: number) => new Date(base.getTime() - amount * unitMs);

    const DAY = 24 * 60 * 60 * 1000;
    const HOUR = 60 * 60 * 1000;

    const dataPoints: Point[] = [];
    let yLabel = isSecretMode ? 'Tasks' : 'Farts';

    const addPoint = (date: string, value: number) => dataPoints.push({ date, value });

    switch (period) {
      case 'D': {
        yLabel = isSecretMode ? 'Tasks per Hour' : 'Farts per Hour';
        const dayStart = getShiftedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()), offset, DAY);
        for (let hour = 0; hour < 24; hour++) {
          const start = new Date(dayStart.getTime() + hour * HOUR);
          const end = new Date(start.getTime() + 60 * 60 * 1000);
          const count = events.filter((e) => {
            const d = e.timestamp instanceof Date ? e.timestamp : new Date(e.timestamp);
            return d >= start && d < end;
          }).length;
          addPoint(`${start.getHours()}:00`, count);
        }
        break;
      }
      case 'W': {
        yLabel = isSecretMode ? 'Tasks per Day' : 'Farts per Day';
        for (let i = 6; i >= 0; i--) {
          const start = new Date(now.getTime() - (offset*7 + i) * DAY);
          const end = new Date(start.getTime() + DAY);
          const count = events.filter((e) => {
            const d = e.timestamp instanceof Date ? e.timestamp : new Date(e.timestamp);
            return d >= start && d < end;
          }).length;
          addPoint(start.toLocaleDateString('en-US', { weekday: 'short' }), count);
        }
        break;
      }
      case 'M': {
        yLabel = isSecretMode ? 'Tasks per Day' : 'Farts per Day';
        const days = 30;
        for (let i = days - 1; i >= 0; i--) {
          const start = new Date(now.getTime() - (offset*30 + i) * DAY);
          const end = new Date(start.getTime() + DAY);
          const count = events.filter((e) => {
            const d = e.timestamp instanceof Date ? e.timestamp : new Date(e.timestamp);
            return d >= start && d < end;
          }).length;
          addPoint(start.getDate().toString(), count);
        }
        break;
      }
      case '6M': {
        yLabel = isSecretMode ? 'Tasks per Week' : 'Farts per Week';
        const weeks = 26;
        for (let i = weeks - 1; i >= 0; i--) {
          const start = new Date(now.getTime() - (offset*26 + i) * 7 * DAY);
          const end = new Date(start.getTime() + 7 * DAY);
          const count = events.filter((e) => {
            const d = e.timestamp instanceof Date ? e.timestamp : new Date(e.timestamp);
            return d >= start && d < end;
          }).length;
          addPoint(start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count);
        }
        break;
      }
      case 'Y': {
        yLabel = isSecretMode ? 'Tasks per Month' : 'Farts per Month';
        const months = 12;
        for (let i = months - 1; i >= 0; i--) {
          const start = new Date(now.getFullYear(), now.getMonth() - (offset*12 + i), 1);
          const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
          const count = events.filter((e) => {
            const d = e.timestamp instanceof Date ? e.timestamp : new Date(e.timestamp);
            return d >= start && d < end;
          }).length;
          addPoint(start.toLocaleDateString('en-US', { month: 'short' }), count);
        }
        break;
      }
    }

    return {
      labels: dataPoints.map((p) => p.date),
      values: dataPoints.map((p) => p.value),
      yAxisLabel: yLabel,
    };
  }, [events, period, offset, isSecretMode]);

  const option = {
    tooltip: { 
      trigger: 'axis',
      backgroundColor: settings.darkMode ? '#374151' : '#ffffff',
      borderColor: settings.darkMode ? '#4b5563' : '#e5e7eb',
      textStyle: {
        color: settings.darkMode ? '#f3f4f6' : '#374151'
      }
    },
    grid: { left: 70, right: 20, top: 40, bottom: 80 },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, start: 0, end: 100 },
      { 
        type: 'slider', 
        xAxisIndex: 0, 
        start: 0, 
        end: 100, 
        height: 20, 
        bottom: 10,
        backgroundColor: settings.darkMode ? '#374151' : '#f3f4f6',
        fillerColor: settings.darkMode ? '#6b7280' : '#d1d5db',
        borderColor: settings.darkMode ? '#4b5563' : '#e5e7eb',
        handleStyle: {
          color: settings.darkMode ? '#9ca3af' : '#6b7280'
        },
        textStyle: {
          color: settings.darkMode ? '#d1d5db' : '#374151'
        }
      },
    ],
    xAxis: {
      type: 'category',
      data: labels,
      boundaryGap: false,
      axisLabel: {
        color: settings.darkMode ? '#9ca3af' : '#6b7280'
      },
      axisLine: {
        lineStyle: {
          color: settings.darkMode ? '#4b5563' : '#e5e7eb'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: yAxisLabel,
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        rotation: 90,
        fontSize: 16,
        color: settings.darkMode ? '#d1d5db' : '#374151',
        fontWeight: 'bold'
      },
      axisLabel: {
        color: settings.darkMode ? '#9ca3af' : '#6b7280'
      },
      splitLine: {
        lineStyle: {
          color: settings.darkMode ? '#374151' : '#f3f4f6',
          type: 'dashed'
        }
      },
      axisLine: {
        lineStyle: {
          color: settings.darkMode ? '#4b5563' : '#e5e7eb'
        }
      }
    },
    series: [
      {
        type: 'line',
        data: values,
        smooth: true,
        symbolSize: 6,
        lineStyle: { 
          width: 3, 
          color: isSecretMode ? '#3b82f6' : '#9333ea' 
        },
        areaStyle: { 
          color: isSecretMode ? 'rgba(59,130,246,0.15)' : 'rgba(147,51,234,0.15)' 
        },
      },
    ],
  } as echarts.EChartsCoreOption;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      {/* Period selector */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                period === p.key 
                  ? isSecretMode
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setOffset(offset + 1)}
          className="p-1 rounded disabled:opacity-30 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronLeft />
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-300 select-none">
          {getNavigationText()}
        </span>
        <button
          onClick={() => setOffset(Math.max(0, offset - 1))}
          disabled={offset === 0}
          className="p-1 rounded disabled:opacity-30 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronRight />
        </button>
      </div>

      <ReactECharts 
        option={option} 
        style={{ height: 280 }} 
        notMerge 
        lazyUpdate 
        key={period}
        opts={{
          devicePixelRatio: window.devicePixelRatio,
          renderer: 'svg'
        }}
      />
    </div>
  );
}