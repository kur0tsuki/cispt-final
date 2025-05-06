import React from "react";
import { Link } from "react-router-dom";
import PointOfSale from "../components/sales/PointOfSale";

const SalesPage = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Point of Sale</h1>
        <Link
          to="/sales/history"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          View Sales History
        </Link>
      </div>
      <PointOfSale />
    </div>
  );
};

export default SalesPage;
