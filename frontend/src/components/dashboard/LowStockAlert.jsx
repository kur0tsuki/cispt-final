import React from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const LowStockAlert = () => {
  const { ingredients, loading } = useAppContext();

  // Check for ingredients below minimum threshold
  const lowStockItems = ingredients.filter(
    (item) => item.quantity <= item.min_threshold
  );

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Inventory Status</h3>
        <p>Loading...</p>
      </div>
    );
  }

  if (lowStockItems.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Inventory Status</h3>
        <p className="text-green-600">
          All ingredients are above minimum stock levels!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Low Stock Items</h3>
      <ul className="divide-y divide-gray-200">
        {lowStockItems.map((item) => (
          <li key={item.id} className="py-3 flex justify-between items-center">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-red-600">
                {item.quantity} {item.unit} available
              </p>
              <p className="text-sm text-red-600">
                Below minimum threshold ({item.min_threshold} {item.unit})
              </p>
            </div>
            <Link
              to={`/ingredients/${item.id}`}
              className="text-blue-500 hover:text-blue-700"
            >
              Restock
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockAlert;
