import React from "react";
import { formatCurrency } from "../../utils/format";

const MetricCard = ({ title, value, subvalue = null }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col">
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      {subvalue && <p className="text-sm text-gray-500 mt-1">{subvalue}</p>}
    </div>
  );
};

const DashboardMetrics = ({ dashboardData }) => {
  if (!dashboardData) return null;

  const { today = {}, week = {} } = dashboardData;

  const defaultMetrics = {
    revenue: 0,
    profit: 0,
    profit_margin: 0,
    transactions: 0,
  };

  const todayMetrics = { ...defaultMetrics, ...today };
  const weekMetrics = { ...defaultMetrics, ...week };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Today's Revenue"
        value={formatCurrency(todayMetrics.revenue)}
        subvalue={`${todayMetrics.transactions} transactions`}
      />
      <MetricCard
        title="Today's Profit"
        value={formatCurrency(todayMetrics.profit)}
        subvalue={`${todayMetrics.profit_margin.toFixed(1)}% margin`}
      />
      <MetricCard
        title="Weekly Revenue"
        value={formatCurrency(weekMetrics.revenue)}
        subvalue={`${weekMetrics.transactions} transactions`}
      />
      <MetricCard
        title="Weekly Profit"
        value={formatCurrency(weekMetrics.profit)}
        subvalue={`${weekMetrics.profit_margin.toFixed(1)}% margin`}
      />
    </div>
  );
};

export default DashboardMetrics;
