import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface SkillRadarChartProps {
  skills: Record<string, number>;
}

const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ skills }) => {
  const defaultSkills = {
    JavaScript: 0,
    React: 0,
    'Node.js': 0,
    Python: 0,
    'Data Structures': 0,
    Algorithms: 0,
  };

  const skillData = { ...defaultSkills, ...skills };
  const labels = Object.keys(skillData);
  const values = Object.values(skillData);

  const data = {
    labels,
    datasets: [
      {
        label: 'Skill Level',
        data: values,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed.r}/100`;
          },
        },
      },
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(156, 163, 175, 0.3)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.3)',
        },
        pointLabels: {
          color: 'rgba(107, 114, 128, 1)',
          font: {
            size: 12,
          },
        },
        ticks: {
          display: false,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  return (
    <div className="h-64 flex items-center justify-center">
      {Object.keys(skills).length > 0 ? (
        <Radar data={data} options={options} />
      ) : (
        <div className="text-center text-slate-500 dark:text-slate-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Start learning to see your skill progress</p>
        </div>
      )}
    </div>
  );
};

export default SkillRadarChart;
