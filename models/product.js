const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  product_id: {
    type: String,
    required: true,
  },
  Image: {
    type: Buffer, // Store main image as binary data
    default: null,
  },
  Image1: {
    type: Buffer, // Store additional images as binary data
    default: null,
  },
  Image2: {
    type: Buffer, // Store additional images as binary data
    default: null,
  },
  Image3: {
    type: Buffer, // Store additional images as binary data
    default: null,
  },
  desc: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    default: "",
  },
  countInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 1000,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

// Exporting the model
exports.Product = mongoose.model("Product", productSchema);
