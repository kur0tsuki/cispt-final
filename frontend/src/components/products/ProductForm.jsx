import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct, createProduct, updateProduct } from "../../api/api";
import { useAppContext } from "../../context/AppContext";
import LoadingSpinner from "../common/LoadingSpinner";
import AlertMessage from "../common/AlertMessage";
import { formatCurrency } from "../../utils/format";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, refreshData } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    recipe: "",
    price: 0,
    is_active: true,
  });
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  // Update useEffect for recipe selection
  useEffect(() => {
    if (formData.recipe && recipes.length > 0) {
      const recipe = recipes.find((r) => r.id === parseInt(formData.recipe));
      console.log("Selected recipe:", recipe); // Debug log
      setSelectedRecipe(recipe || null);
    } else {
      setSelectedRecipe(null);
    }
  }, [formData.recipe, recipes]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const { data } = await getProduct(id);
      setFormData(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch product details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const dataToSubmit = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (id) {
        await updateProduct(id, dataToSubmit);
      } else {
        await createProduct(dataToSubmit);
      }
      refreshData();
      navigate("/products");
    } catch (err) {
      setError("Failed to save product");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <LoadingSpinner />;

  // Add calculations for pricing analysis
  const calculatePricingDetails = () => {
    const price = parseFloat(formData.price) || 0;
    const cost = selectedRecipe?.cost_per_serving || 0;
    const profit = price - cost;
    const margin = price > 0 ? (profit / price) * 100 : 0;

    return {
      price: formatCurrency(price),
      cost: formatCurrency(cost),
      profit: formatCurrency(profit),
      margin: margin.toFixed(1),
    };
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-lg font-medium mb-6">
        {id ? "Edit Product" : "New Product"}
      </h2>

      {error && <AlertMessage type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Product Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label
            htmlFor="recipe"
            className="block text-sm font-medium text-gray-700"
          >
            Based on Recipe
          </label>
          <select
            name="recipe"
            id="recipe"
            required
            value={formData.recipe}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select a Recipe</option>
            {recipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.name}
              </option>
            ))}
          </select>
        </div>

        {selectedRecipe && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-sm text-gray-700 mb-2">
              Recipe Details
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Preparation time: {selectedRecipe.preparation_time} minutes
            </p>
            <p className="text-sm text-gray-600">
              Cost per serving:{" "}
              {formatCurrency(selectedRecipe.cost_per_serving)}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Price
          </label>
          <input
            type="number"
            name="price"
            id="price"
            required
            min="0.01"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full md:w-1/4 border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {selectedRecipe && formData.price > 0 && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium text-sm text-blue-700 mb-2">
              Pricing Analysis
            </h3>
            {(() => {
              const pricing = calculatePricingDetails();
              return (
                <>
                  <p className="text-sm text-blue-600 mb-1">
                    Cost: {pricing.cost}
                  </p>
                  <p className="text-sm text-blue-600 mb-1">
                    Price: {pricing.price}
                  </p>
                  <p className="text-sm text-blue-600 mb-1">
                    Profit: {pricing.profit}
                  </p>
                  <p className="text-sm text-blue-600">
                    Profit Margin: {pricing.margin}%
                  </p>
                </>
              );
            })()}
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            id="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="is_active"
            className="ml-2 block text-sm text-gray-900"
          >
            Active (available for sale)
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
