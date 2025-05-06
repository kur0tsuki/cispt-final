import React from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { prepareRecipe } from "../../api/api";

const RecipeList = () => {
  const { recipes, loading, refreshData } = useAppContext();
  const [preparing, setPreparing] = React.useState(null);
  const [quantity, setQuantity] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState("");

  const handlePrepare = async (id) => {
    if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    try {
      await prepareRecipe(id, parseFloat(quantity), notes);
      setPreparing(null);
      setQuantity("");
      setNotes("");
      setError("");
      refreshData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to prepare recipe");
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <p className="text-sm font-medium text-blue-600 truncate">
                    {recipe.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {recipe.ingredients_count} ingredients •{" "}
                    {recipe.preparation_time} mins
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  {preparing === recipe.id ? (
                    <div className="flex items-center">
                      <input
                        type="number"
                        step="0.01"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="mr-2 w-20 border rounded p-1"
                        placeholder="Qty"
                      />
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mr-2 w-32 border rounded p-1"
                        placeholder="Notes (optional)"
                      />
                      <button
                        onClick={() => handlePrepare(recipe.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Prepare
                      </button>
                      <button
                        onClick={() => {
                          setPreparing(null);
                          setQuantity("");
                          setNotes("");
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
                        onClick={() => setPreparing(recipe.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700 mr-2"
                        disabled={recipe.max_portions <= 0}
                      >
                        Prepare
                      </button>
                      <Link
                        to={`/recipes/${recipe.id}`}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded bg-white text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                    </>
                  )}
                </div>
              </div>
              {recipe.max_portions <= 0 ? (
                <p className="mt-1 text-sm text-red-600">
                  Insufficient ingredients to prepare this recipe!
                </p>
              ) : (
                <p className="mt-1 text-sm text-green-600">
                  Can make up to {recipe.max_portions.toFixed(2)} {recipe.name}
                  (s)
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

export default RecipeList;
