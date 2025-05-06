import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SalesChart = ({ reportData }) => {
  if (!reportData || reportData.length === 0) return null;

  const labels = reportData.map((item) => item.period);
  const salesData = reportData.map((item) => item.total_sales);
  const profitData = reportData.map((item) => item.profit);

  const data = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: salesData,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Profit",
        data: profitData,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        display: true,
        labels: {
          boxWidth: 10,
          padding: 10,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: "Sales & Profit Trend",
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: window.innerWidth < 768 ? 8 : 10,
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 8 : 10,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow h-full">
      <Line options={options} data={data} />
    </div>
  );
};

export default SalesChart;
