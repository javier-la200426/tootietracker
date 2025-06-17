import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useFartStore } from '../store/fartStore';
import * as echarts from 'echarts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Point { date: string; value: number; }

const smellLabels = ['😇', '😊', '😐', '😬', '🤢'];

export default function EChartsSmell() {
  const events = useFartStore((s) => s.events);
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

  const DAY = 24 * 60 * 60 * 1000;

  const { labels, values } = useMemo(() => {
    const now = new Date();
    const pts: Point[] = [];
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);

    const push = (d: string, v: number) => pts.push({ date: d, value: Number(v.toFixed(2)) });

    switch (period) {
      case 'D': {
        for (let i = 23; i >= 0; i--) {
          const start = new Date(now.getTime() - i * 60 * 60 * 1000);
          const end = new Date(start.getTime() + 60 * 60 * 1000);
          const vals = events
            .filter((e) => {
              const d = e.timestamp instanceof Date ? e.timestamp : new Date(e.timestamp);
              return d >= start && d < end && e.smellIntensity;
            })
            .map((e) => e.smellIntensity!.level);
          push(`${start.getHours()}:00`, vals.length ? avg(vals) : 0);
        }
        break;
      }
      case 'W': {
        for (let i = 6; i >= 0; i--) {
          const start = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
          const vals = events
            .filter((e) => {
              const d = e.timestamp instanceof Date ? e.timestamp : new Date(e.timestamp);
              return d >= start && d < end && e.smellIntensity;
            })
            .map((e) => e.smellIntensity!.level);
          push(start.toLocaleDateString('en-US', { weekday: 'short' }), vals.length ? avg(vals) : 0);
        }
        break;
      }
      case 'M': {
        const days = 30;
        for (let i = days - 1; i >= 0; i--) {
          const start = new Date(now.getTime() - (offset*30 + i) * DAY);
          const end = new Date(start.getTime() + DAY);
          const vals = events
            .filter((e) => {
              const d = e.timestamp instanceof Date ? e.timestamp : new Date(e.timestamp);
              return d >= start && d < end && e.smellIntensity;
            })
            .map((e) => e.smellIntensity!.level);
          push(start.getDate().toString(), vals.length ? avg(vals) : 0);
        }
        break;
      }
      case '6M': {
        const weeks = 26;
        for (let i = weeks - 1; i >= 0; i--) {
          const start = new Date(now.getTime() - (offset*26 + i) * 7 * DAY);
          const end = new Date(start.getTime() + 7 * DAY);
          const vals = events
            .filter((e) => {
              const d = e.timestamp instanceof Date ? e.timestamp : new Date(e.timestamp);
              return d >= start && d < end && e.smellIntensity;
            })
            .map((e) => e.smellIntensity!.level);
          push(start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), vals.length ? avg(vals) : 0);
        }
        break;
      }
      case 'Y': {
        const months = 12;
        for (let i = months - 1; i >= 0; i--) {
          const start = new Date(now.getFullYear(), now.getMonth() - (offset*12 + i), 1);
          const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
          const vals = events
            .filter((e) => {
              const d = e.timestamp instanceof Date ? e.timestamp : new Date(e.timestamp);
              return d >= start && d < end && e.smellIntensity;
            })
            .map((e) => e.smellIntensity!.level);
          push(start.toLocaleDateString('en-US', { month: 'short' }), vals.length ? avg(vals) : 0);
        }
        break;
      }
    }

    return { labels: pts.map((p) => p.date), values: pts.map((p) => p.value) };
  }, [events, period, offset]);

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, top: 40, bottom: 60 },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, start: 0, end: 100 },
      { type: 'slider', xAxisIndex: 0, start: 0, end: 100, height: 20 },
    ],
    xAxis: { type: 'category', data: labels, boundaryGap: false },
    yAxis: { type: 'value', name: 'Smell Level', min: 0, max: 5 },
    series: [
      {
        type: 'line',
        data: values,
        smooth: true,
        symbolSize: 6,
        lineStyle: { width: 3, color: '#ef4444' },
        areaStyle: { color: 'rgba(239,68,68,0.15)' },
      },
    ],
  } as echarts.EChartsCoreOption;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                period === p.key ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {/* Navigation Arrows */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setOffset(offset + 1)} className="p-1 rounded disabled:opacity-30">
          <ChevronLeft />
        </button>
        <span className="text-sm text-gray-600 select-none">
          {offset === 0 ? 'Current' : `${offset} ${period} ago`}
        </span>
        <button onClick={() => setOffset(Math.max(0, offset - 1))} disabled={offset === 0} className="p-1 rounded disabled:opacity-30">
          <ChevronRight />
        </button>
      </div>
      <ReactECharts option={option} style={{ height: 280 }} notMerge lazyUpdate key={period} />
    </div>
  );
} 