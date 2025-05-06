import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path
      ? "text-blue-500 border-b-2 border-blue-500"
      : "";
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center py-4">
          <div className="text-lg sm:text-xl font-bold mb-4 sm:mb-0">
            Sales And Inventory System
          </div>
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link
              to="/"
              className={`py-1 sm:py-2 text-sm sm:text-base ${isActive("/")}`}
            >
              Dashboard
            </Link>
            <Link
              to="/ingredients"
              className={`py-1 sm:py-2 text-sm sm:text-base ${isActive(
                "/ingredients"
              )}`}
            >
              Ingredients
            </Link>
            <Link
              to="/recipes"
              className={`py-1 sm:py-2 text-sm sm:text-base ${isActive(
                "/recipes"
              )}`}
            >
              Recipes
            </Link>
            <Link
              to="/products"
              className={`py-1 sm:py-2 text-sm sm:text-base ${isActive(
                "/products"
              )}`}
            >
              Products
            </Link>
            <Link
              to="/sales"
              className={`py-1 sm:py-2 text-sm sm:text-base ${isActive(
                "/sales"
              )}`}
            >
              Sales
            </Link>
            <Link
              to="/reports"
              className={`py-1 sm:py-2 text-sm sm:text-base ${isActive(
                "/reports"
              )}`}
            >
              Reports
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
