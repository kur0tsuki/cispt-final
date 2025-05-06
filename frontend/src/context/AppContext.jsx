import React, { createContext, useState, useEffect, useContext } from "react";
import * as api from "../api/api";

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false); // NEW
  const [error, setError] = useState(null);

  const fetchIngredients = async () => {
    const { data } = await api.getIngredients();
    setIngredients(data);
  };

  const fetchRecipes = async () => {
    const { data } = await api.getRecipes();
    setRecipes(data);
  };

  const fetchProducts = async () => {
    const { data } = await api.getProducts();
    console.log(
      "Raw products from API:",
      data.map((p) => ({
        name: p.name,
        prepared_quantity: p.prepared_quantity,
        price: p.price,
      }))
    );
    setProducts(data);
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchIngredients(), fetchRecipes(), fetchProducts()]);
      setLoaded(true); // All data fetched successfully
    } catch (err) {
      setError("Failed to fetch app data");
      console.error(err);
      setLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const value = {
    ingredients,
    recipes,
    products,
    loading,
    loaded, // pass to consumers
    error,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
