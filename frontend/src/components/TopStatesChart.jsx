// src/components/TopStatesChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopStatesChart = ({ trendsData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded-md w-1/2 mb-4"></div>
        <div className="h-64 bg-gray-700 rounded-md"></div>
      </div>
    );
  }
  if (!trendsData || trendsData.length === 0) return null;

  const top5 = [...trendsData].sort((a, b) => b.interesse - a.interesse).slice(0, 5);
  const chartData = {
    labels: top5.map(d => d.sigla),
    datasets: [{
      label: 'Índice de Popularidade',
      data: top5.map(d => d.interesse),
      backgroundColor: 'rgba(34, 211, 238, 0.6)',
      borderColor: 'rgba(34, 211, 238, 1)',
      borderWidth: 1,
    }],
  };
  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top 5 Estados com Maior Popularidade', color: '#d1d5db', font: { size: 18, family: 'Inter' } },
    },
    scales: {
      x: { ticks: { color: '#9ca3af', font: { family: 'Inter' } }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      y: { ticks: { color: '#9ca3af', font: { family: 'Inter' } }, grid: { display: false } }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4" style={{ height: '300px' }}>
      <Bar options={chartOptions} data={chartData} />
    </div>
  );
};

export default TopStatesChart;