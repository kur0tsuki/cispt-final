import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Header from "./components/common/Header";

// Import pages
import DashboardPage from "./pages/DashboardPage";
import IngredientsPage from "./pages/IngredientsPage";
import IngredientFormPage from "./pages/IngredientFormPage";
import RecipesPage from "./pages/RecipesPage";
import RecipeFormPage from "./pages/RecipeFormPage";
import ProductsPage from "./pages/ProductsPage";
import ProductFormPage from "./pages/ProductFormPage";
import SalesPage from "./pages/SalesPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  return (
    <Router>
      <AppProvider>
        <div className="min-h-screen bg-gray-100">
          <Header />
          <main className="container mx-auto py-6 px-4">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/ingredients" element={<IngredientsPage />} />
              <Route path="/ingredients/new" element={<IngredientFormPage />} />
              <Route path="/ingredients/:id" element={<IngredientFormPage />} />
              <Route path="/recipes" element={<RecipesPage />} />
              <Route path="/recipes/new" element={<RecipeFormPage />} />
              <Route path="/recipes/:id" element={<RecipeFormPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/new" element={<ProductFormPage />} />
              <Route path="/products/:id" element={<ProductFormPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/sales/history" element={<SalesHistoryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </main>
        </div>
      </AppProvider>
    </Router>
  );
}

export default App;
