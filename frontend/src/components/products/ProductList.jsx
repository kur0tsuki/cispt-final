import React from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatCurrency } from "../../utils/format";

const ProductList = () => {
  const { products, loading } = useAppContext();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {products.map((product) => (
          <li key={product.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <p className="text-sm font-medium text-blue-600 truncate">
                    {product.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Based on: {product.recipe_name}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {formatCurrency(product.price)}
                  </p>
                  <Link
                    to={`/products/${product.id}`}
                    className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded bg-white text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                </div>
              </div>
              <div className="mt-2 flex justify-between">
                <div className="text-sm text-gray-500">
                  Cost: {formatCurrency(product.cost || 0)} • Profit:{" "}
                  {formatCurrency(product.profit || 0)} • Margin:{" "}
                  {(product.profit_margin || 0).toFixed(1)}%
                </div>
                <div>
                  {product.is_active ? (
                    <span className="text-xs text-green-600">Active</span>
                  ) : (
                    <span className="text-xs text-red-600">Inactive</span>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
