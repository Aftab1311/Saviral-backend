const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: String,  // Assuming you have a User model defined
        required: true,
        ref: 'User',  // Reference to User model
    },
    items: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        }
    ],
    shippingInfo: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
    },
    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['paid', 'unpaid'],
        default: 'unpaid',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
