import React, { useState, useEffect } from "react";
import { getDashboardData } from "../api/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import AlertMessage from "../components/common/AlertMessage";
import DashboardMetrics from "../components/dashboard/DashboardMetrics";
import SalesChart from "../components/dashboard/SalesChart";
import LowStockAlert from "../components/dashboard/LowStockAlert";

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await getDashboardData();
      console.log("Dashboard data:", {
        fullData: data,
        chartData: data.chart_data,
        metrics: {
          today: data.today,
          week: data.week,
        },
      });
      setDashboardData(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 sm:p-6">
      {" "}
      {/* Smaller padding on mobile */}
      <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
        Dashboard
      </h1>
      {error && <AlertMessage type="error" message={error} />}
      <DashboardMetrics dashboardData={dashboardData} />
      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Chart takes full width on mobile, 2/3 on desktop */}
        <div className="lg:col-span-2">
          <div className="h-[300px] sm:h-[400px]">
            {" "}
            {/* Smaller height on mobile */}
            <SalesChart reportData={dashboardData?.chart_data || []} />
          </div>
        </div>

        {/* Low stock alerts take full width on mobile, 1/3 on desktop */}
        <div className="lg:col-span-1">
          <LowStockAlert />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
