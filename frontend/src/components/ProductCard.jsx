import React from "react";

export default function ProductCard({ product, onClick }) {
  const { name, price, image_url } = product;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white/30 backdrop-blur-lg rounded-xl p-4
                 hover:shadow-xl transition-shadow duration-300
                 flex flex-col items-center text-center"
    >
      {image_url ? (
        <img
          src={image_url}
          alt={name}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
          <span className="text-gray-500">No Image</span>
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
      <p className="mt-2 text-lg text-indigo-600 font-medium">
        ${price?.toFixed(2) ?? "0.00"}
      </p>
    </div>
  );
}
