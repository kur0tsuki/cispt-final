import React from "react";
import { Link } from "react-router-dom";
import RecipeList from "../components/recipes/RecipeList";

const RecipesPage = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Recipes</h1>
        <Link
          to="/recipes/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Recipe
        </Link>
      </div>

      <RecipeList />
    </div>
  );
};

export default RecipesPage;
