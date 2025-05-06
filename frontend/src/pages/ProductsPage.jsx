import React from "react";
import { Link } from "react-router-dom";
import ProductList from "../components/products/ProductList";

const ProductsPage = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link
          to="/products/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Product
        </Link>
      </div>

      <ProductList />
    </div>
  );
};

export default ProductsPage;
