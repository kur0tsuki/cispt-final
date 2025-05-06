import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getIngredient,
  createIngredient,
  updateIngredient,
} from "../../api/api";
import { useAppContext } from "../../context/AppContext";
import LoadingSpinner from "../common/LoadingSpinner";
import AlertMessage from "../common/AlertMessage";

const IngredientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshData } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    unit: "",
    min_threshold: 0,
    cost_per_unit: 0,
  });

  useEffect(() => {
    if (id) {
      fetchIngredientDetails();
    }
  }, [id]);

  const fetchIngredientDetails = async () => {
    try {
      setLoading(true);
      const { data } = await getIngredient(id);
      setFormData(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch ingredient details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id) {
        await updateIngredient(id, formData);
      } else {
        await createIngredient(formData);
      }
      refreshData();
      navigate("/ingredients");
    } catch (err) {
      setError("Failed to save ingredient");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <LoadingSpinner />;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-lg font-medium mb-6">
        {id ? "Edit Ingredient" : "New Ingredient"}
      </h2>

      {error && <AlertMessage type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Ingredient Name
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700"
            >
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              id="quantity"
              required
              min="0"
              step="0.01"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label
              htmlFor="unit"
              className="block text-sm font-medium text-gray-700"
            >
              Unit
            </label>
            <input
              type="text"
              name="unit"
              id="unit"
              required
              value={formData.unit}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="min_threshold"
              className="block text-sm font-medium text-gray-700"
            >
              Minimum Threshold
            </label>
            <input
              type="number"
              name="min_threshold"
              id="min_threshold"
              required
              min="0"
              step="0.01"
              value={formData.min_threshold}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label
              htmlFor="cost_per_unit"
              className="block text-sm font-medium text-gray-700"
            >
              Cost Per Unit
            </label>
            <input
              type="number"
              name="cost_per_unit"
              id="cost_per_unit"
              required
              min="0"
              step="0.01"
              value={formData.cost_per_unit}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/ingredients")}
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

export default IngredientForm;
