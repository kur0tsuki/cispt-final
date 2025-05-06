import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getIngredients = () => API.get("/ingredients/");
export const getIngredient = (id) => API.get(`/ingredients/${id}/`);
export const createIngredient = (data) => API.post("/ingredients/", data);
export const updateIngredient = (id, data) =>
  API.put(`/ingredients/${id}/`, data);
export const deleteIngredient = (id) => API.delete(`/ingredients/${id}/`);
export const restockIngredient = (id, amount) =>
  API.post(`/ingredients/${id}/restock/`, { amount });

// Recipes API
export const getRecipes = () => API.get("/recipes/");
export const getRecipe = (id) => API.get(`/recipes/${id}/`);
export const createRecipe = (data) => API.post("/recipes/", data);
export const updateRecipe = (id, data) => API.put(`/recipes/${id}/`, data);
export const deleteRecipe = (id) => API.delete(`/recipes/${id}/`);
export const prepareRecipe = (id, quantity, notes) =>
  API.post(`/recipes/${id}/prepare/`, {
    quantity: parseFloat(quantity), // Explicitly convert to float
    notes,
  });

// Products API
export const getProducts = () => API.get("/products/");
export const getProduct = (id) => API.get(`/products/${id}/`);
export const createProduct = (data) => API.post("/products/", data);
export const updateProduct = (id, data) => API.put(`/products/${id}/`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}/`);

// Sales API
export const getSales = () => API.get("/sales/");
export const createSale = (data) => {
  console.log("Creating sale with data:", data);
  return API.post("/sales/", {
    product: parseInt(data.product),
    quantity: parseInt(data.quantity),
    unit_price: parseFloat(data.unit_price),
  });
};
export const getSaleReport = (period, startDate, endDate) => {
  const params = new URLSearchParams({
    period: period || "day",
    start_date: startDate,
    end_date: endDate,
  });
  return API.get(`/sales/report/?${params.toString()}`);
};
export const getDashboardData = () => API.get("/sales/dashboard/");

// RecipeIngredients API
export const getRecipeIngredients = () => API.get("/recipe-ingredients/");
export const getRecipeIngredient = (id) =>
  API.get(`/recipe-ingredients/${id}/`);
export const createRecipeIngredient = (data) =>
  API.post("/recipe-ingredients/", data);
export const updateRecipeIngredient = (id, data) =>
  API.put(`/recipe-ingredients/${id}/`, data);
export const deleteRecipeIngredient = (id) =>
  API.delete(`/recipe-ingredients/${id}/`);
