import React, { useState, useEffect } from "react";
import { getSaleReport } from "../../api/api";
import { format } from "date-fns";
import LoadingSpinner from "../common/LoadingSpinner";
import AlertMessage from "../common/AlertMessage";
import { formatCurrency } from "../../utils/format";
import SalesChart from "../dashboard/SalesChart";

const SalesReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState([]);
  const [period, setPeriod] = useState("day");
  const [startDate, setStartDate] = useState(
    format(
      new Date(new Date().setDate(new Date().getDate() - 30)),
      "yyyy-MM-dd"
    )
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!startDate || !endDate) {
        setError("Please select both start and end dates");
        return;
      }

      const { data } = await getSaleReport(period, startDate, endDate);
      console.log("Report data:", data);
      setReportData(data.data || []);
    } catch (err) {
      console.error("Error details:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to fetch sales report");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date");
      return;
    }

    fetchReportData();
  };

  const calculateTotal = (field) => {
    return reportData.reduce((total, item) => total + item[field], 0);
  };

  if (loading) return <LoadingSpinner />;

  if (!reportData || reportData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Sales Report</h2>

          {error && <AlertMessage type="error" message={error} />}

          {/* Form component here */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <div>
              <label
                htmlFor="period"
                className="block text-sm font-medium text-gray-700"
              >
                Period
              </label>
              <select
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Generate Report
              </button>
            </div>
          </form>

          <p className="text-gray-500 text-center py-6">
            No sales data available for the selected period.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Sales Report</h2>

        {error && <AlertMessage type="error" message={error} />}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div>
            <label
              htmlFor="period"
              className="block text-sm font-medium text-gray-700"
            >
              Period
            </label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Generate Report
            </button>
          </div>
        </form>

        {reportData.length > 0 && (
          <>
            <SalesChart reportData={reportData} />

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Margin
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.transactions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.total_sales)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.profit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.profit_margin.toFixed(1)}%
                      </td>
                    </tr>
                  ))}

                  {/* Summary row */}
                  <tr className="bg-gray-50 font-medium">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      TOTAL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {calculateTotal("transactions")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(calculateTotal("total_sales"))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(calculateTotal("cost"))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(calculateTotal("profit"))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {(
                        (calculateTotal("profit") /
                          calculateTotal("total_sales")) *
                        100
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesReport;
