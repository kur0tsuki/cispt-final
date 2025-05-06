import React from "react";

const AlertMessage = ({ type, message }) => {
  const alertClasses = {
    success: "bg-green-100 border-green-500 text-green-700",
    error: "bg-red-100 border-red-500 text-red-700",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
    info: "bg-blue-100 border-blue-500 text-blue-700",
  };

  return (
    <div
      className={`border-l-4 p-4 mb-4 ${
        alertClasses[type] || alertClasses.info
      }`}
    >
      <p>{message}</p>
    </div>
  );
};

export default AlertMessage;
