const express = require('express');
const { createOrder, getOrderHistory } = require('../controllers/orderController');
const router = express.Router();

// POST: Create new order
router.post('/', createOrder);

// GET: Get order history for a user
router.get('/', getOrderHistory);

module.exports = router;
