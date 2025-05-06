import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRecipe, createRecipe, updateRecipe } from "../../api/api";
import { useAppContext } from "../../context/AppContext";
import LoadingSpinner from "../common/LoadingSpinner";
import AlertMessage from "../common/AlertMessage";

const RecipeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ingredients, refreshData } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    preparation_time: 0,
    recipe_ingredients: [],
  });

  useEffect(() => {
    if (id) {
      fetchRecipeDetails();
    }
  }, [id]);

  const fetchRecipeDetails = async () => {
    try {
      setLoading(true);
      const { data } = await getRecipe(id);
      const formattedData = {
        ...data,
        recipe_ingredients:
          data.ingredients_detail?.map((ri) => ({
            ingredient: ri.ingredient,
            quantity: ri.quantity,
          })) || [],
      };
      setFormData(formattedData);
      setError("");
    } catch (err) {
      setError("Failed to fetch recipe details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (idx, field, value) => {
    const updatedIngredients = [...formData.recipe_ingredients];
    updatedIngredients[idx][field] = value;
    setFormData((prev) => ({
      ...prev,
      recipe_ingredients: updatedIngredients,
    }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      recipe_ingredients: [
        ...prev.recipe_ingredients,
        { ingredient: "", quantity: 0 },
      ],
    }));
  };

  const removeIngredient = (idx) => {
    const updatedIngredients = [...formData.recipe_ingredients];
    updatedIngredients.splice(idx, 1);
    setFormData((prev) => ({
      ...prev,
      recipe_ingredients: updatedIngredients,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const dataToSubmit = {
        ...formData,
        preparation_time: parseInt(formData.preparation_time, 10),
        recipe_ingredients: formData.recipe_ingredients.map((ri) => ({
          ingredient: ri.ingredient,
          quantity: parseFloat(ri.quantity),
        })),
      };

      if (id) {
        await updateRecipe(id, dataToSubmit);
      } else {
        await createRecipe(dataToSubmit);
      }
      refreshData();
      navigate("/recipes");
    } catch (err) {
      setError("Failed to save recipe");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <LoadingSpinner />;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-lg font-medium mb-6">
        {id ? "Edit Recipe" : "New Recipe"}
      </h2>

      {error && <AlertMessage type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Recipe Name
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
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label
            htmlFor="preparation_time"
            className="block text-sm font-medium text-gray-700"
          >
            Preparation Time (minutes)
          </label>
          <input
            type="number"
            name="preparation_time"
            id="preparation_time"
            required
            min="1"
            value={formData.preparation_time}
            onChange={handleChange}
            className="mt-1 block w-full md:w-1/4 border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Recipe Ingredients
            </label>
            <button
              type="button"
              onClick={addIngredient}
              className="px-3 py-1 border border-transparent text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Ingredient
            </button>
          </div>

          {formData.recipe_ingredients.length === 0 ? (
            <p className="text-gray-500 text-sm">No ingredients added yet.</p>
          ) : (
            <div className="space-y-3">
              {formData.recipe_ingredients.map((ri, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <select
                    value={ri.ingredient}
                    onChange={(e) =>
                      handleIngredientChange(idx, "ingredient", e.target.value)
                    }
                    required
                    className="block w-1/2 border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select Ingredient</option>
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.quantity} {ing.unit} available)
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={ri.quantity}
                    onChange={(e) =>
                      handleIngredientChange(idx, "quantity", e.target.value)
                    }
                    placeholder="Quantity"
                    required
                    min="0.01"
                    step="0.01"
                    className="block w-1/4 border border-gray-300 rounded-md shadow-sm p-2"
                  />

                  <button
                    type="button"
                    onClick={() => removeIngredient(idx)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/recipes")}
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

export default RecipeForm;
