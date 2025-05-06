import React, { useState, useEffect } from "react";
import { getSales } from "../../api/api";
import { format } from "date-fns";
import LoadingSpinner from "../common/LoadingSpinner";
import AlertMessage from "../common/AlertMessage";
import { formatCurrency } from "../../utils/format";

const SalesHistory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data } = await getSales();
      console.log("Raw sales data:", data);

      setSales(
        data.map((sale) => {
          const timestamp = sale.timestamp || sale.created_at;
          console.log("Processing sale:", { id: sale.id, timestamp });

          return {
            ...sale,
            timestamp: timestamp ? new Date(timestamp).toISOString() : null,
            total_price: parseFloat(sale.total_price || 0),
            profit: parseFloat(sale.profit || 0),
            unit_price: parseFloat(sale.unit_price || 0),
          };
        })
      );
      setError("");
    } catch (err) {
      setError("Failed to fetch sales history");
      console.error("Sales fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-3 py-4 sm:px-6 sm:py-5">
        <h3 className="text-base sm:text-lg font-medium text-gray-900">
          Sales History
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Recent sales transactions
        </p>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        {" "}
        {/* Negative margin on mobile */}
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No sales recorded yet.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.timestamp
                        ? format(new Date(sale.timestamp), "yyyy-MM-dd HH:mm")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.product_name || "Unknown Product"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {sale.quantity || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(sale.unit_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(sale.total_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(sale.profit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
