const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: String, // Assuming you have a User model defined
    required: true,
    ref: "User", // Reference to User model
  },
  merchantId: {
    type: String,
    required: true,
  },

  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  shippingInfo: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  amount: { type: Number, required: true },
  MUID: {
    type: String,
    required: true,
  },
  merchantTransactionId: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["paid", "unpaid"],
    default: "unpaid",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
