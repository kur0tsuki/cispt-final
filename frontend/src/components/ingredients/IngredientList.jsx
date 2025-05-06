import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { restockIngredient } from "../../api/api";

const IngredientList = () => {
  const { ingredients, loading, refreshData } = useAppContext();
  const [restocking, setRestocking] = useState(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleRestock = async (id) => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      await restockIngredient(id, parseFloat(amount));
      setRestocking(null);
      setAmount("");
      setError("");
      refreshData();
    } catch (err) {
      setError("Failed to restock ingredient");
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {ingredients.map((ingredient) => (
          <li key={ingredient.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <p className="text-sm font-medium text-blue-600 truncate">
                    {ingredient.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {ingredient.quantity} {ingredient.unit} available
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  {restocking === ingredient.id ? (
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mr-2 w-20 border rounded p-1"
                        placeholder="Amount"
                      />
                      <button
                        onClick={() => handleRestock(ingredient.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setRestocking(null);
                          setAmount("");
                          setError("");
                        }}
                        className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded bg-white text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setRestocking(ingredient.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700 mr-2"
                      >
                        Restock
                      </button>
                      <Link
                        to={`/ingredients/${ingredient.id}`}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded bg-white text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                    </>
                  )}
                </div>
              </div>
              {ingredient.is_low_stock && (
                <p className="mt-1 text-sm text-red-600">
                  Low stock! Below minimum threshold.
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      {error && <div className="p-4 text-red-600 text-sm">{error}</div>}
    </div>
  );
};

export default IngredientList;
