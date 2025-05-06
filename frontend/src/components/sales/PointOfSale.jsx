import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { createSale } from "../../api/api";
import LoadingSpinner from "../common/LoadingSpinner";
import AlertMessage from "../common/AlertMessage";
import { formatCurrency } from "../../utils/format";

const PointOfSale = () => {
  const { products, loaded, loading, refreshData } = useAppContext();
  const [cart, setCart] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleAddToCart = (product) => {
    const prepared = Number(product.prepared_quantity) || 0;

    console.log("Adding to cart:", {
      product: product.name,
      prepared_quantity: prepared,
      raw_value: product?.prepared_quantity,
    });

    if (prepared <= 0) {
      setMessage({
        type: "error",
        text: `Cannot add ${product.name} - Insufficient ingredients`,
      });
      return;
    }

    const existingItem = cart.find((item) => item.product.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newQuantity = currentQuantity + 1;

    if (newQuantity > prepared) {
      setMessage({
        type: "error",
        text: `Only ${prepared.toFixed(2)} ${product.name}(s) available`,
      });
      return;
    }

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          unit_price: product.price,
        },
      ]);
    }
    setMessage({ type: "", text: "" });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 60000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const cartItem = cart.find((item) => item.product.id === productId);
    if (!cartItem) return;

    const currentProduct = products.find((p) => p.id === productId);
    const prepared = Number(currentProduct?.prepared_quantity) || 0;

    if (newQuantity > prepared) {
      setMessage({
        type: "error",
        text: `Only ${prepared.toFixed(2)} ${currentProduct.name}(s) available`,
      });
      return;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
    setMessage({ type: "", text: "" });
  };

  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.quantity * item.unit_price, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setProcessing(true);
    setMessage({ type: "", text: "" });

    try {
      await Promise.all(
        cart.map((item) =>
          createSale({
            product: item.product.id,
            quantity: parseInt(item.quantity),
            unit_price: parseFloat(item.unit_price),
          })
        )
      );

      setMessage({
        type: "success",
        text: "Sale completed successfully!",
      });
      setCart([]);
      await refreshData();
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err);
      setMessage({
        type: "error",
        text:
          err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to process sale",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!loaded || loading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products List */}
      <div className="lg:col-span-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Products</h2>

          {message.text && (
            <AlertMessage type={message.type} message={message.text} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter((p) => p.is_active)
              .map((product) => {
                console.log("Processing product:", {
                  name: product.name,
                  prepared_quantity: product.prepared_quantity,
                  price: product.price,
                });

                const prepared = Number(product.prepared_quantity) || 0;

                return (
                  <div
                    key={product.id}
                    className={`border rounded-lg p-4 cursor-pointer hover:shadow-md ${
                      prepared <= 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => prepared > 0 && handleAddToCart(product)}
                  >
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-gray-500 text-sm">
                      {product.recipe_name}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-lg">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Margin: {Math.round(product.profit_margin)}%
                      </span>
                    </div>
                    {prepared <= 0 ? (
                      <p className="text-red-500 text-xs mt-1">Out of stock!</p>
                    ) : (
                      <p className="text-green-500 text-xs mt-1">
                        Available: {prepared.toFixed(2)}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Shopping Cart */}
      <div className="lg:col-span-1">
        <div className="bg-white shadow rounded-lg p-6 sticky top-4">
          <h2 className="text-lg font-medium mb-4">Current Order</h2>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              Cart is empty. Add products from the left.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <li key={item.product.id} className="py-3">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.product.name}</span>
                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                          className="bg-gray-200 px-2 py-1 rounded"
                        >
                          -
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                          className="bg-gray-200 px-2 py-1 rounded"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={processing || cart.length === 0}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? "Processing..." : "Complete Sale"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointOfSale;
