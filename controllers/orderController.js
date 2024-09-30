const Order = require('../models/orderModel');

// Create a new order
const createOrder = async (req, res) => {
    try {
        const { userId, cartItems, shippingInfo, totalPrice } = req.body;

        // Create the order
        const newOrder = new Order({
            user: userId,
            items: cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
            shippingInfo,
            totalPrice,
            createdAt: new Date(),
        });
         
        console.log("New Order:", newOrder);
        // Save the order to the database
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error("Error creating order:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// Get order history for a specific user
const getOrderHistory = async (req, res) => {
    try {
        const orders = await Order.find();  // You can also filter based on user, e.g., Order.find({ user: req.user._id });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
};

module.exports = { createOrder, getOrderHistory };
