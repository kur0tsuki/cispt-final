import React from "react";
import SalesHistory from "../components/sales/SalesHistory";

const SalesHistoryPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Sales History</h1>
      <SalesHistory />
    </div>
  );
};

export default SalesHistoryPage;
