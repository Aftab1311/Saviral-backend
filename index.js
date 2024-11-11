const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const axios = require("axios");
 const Order = require("./models/orderModel");

require("dotenv").config();
const app = express();

// CORS configuration to allow specific origins
const allowedOrigins = ["https://saviral-foods.vercel.app", "http://localhost:5173","https://saviralfoods.in","www.saviralfoods.in","https://saviral-backend.vercel.app/neworder"]; // Add any other origins you need

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If the origin isn't in the allowed list
        return callback(new Error("Not allowed by CORS"), false);
      }
      return callback(null, true);
    },
    credentials: true, // if your frontend needs to send cookies
  })
);

// Allow preflight requests for all routes
app.options("*", cors());

const productsRouter = require("./routers/products");
const usersRouter = require("./routers/users");
const ordersRouter = require("./routers/orderRoutes");
const couponRouter = require("./routers/couponroute");

const api = process.env.API_URL;

// Middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));

// Routes
app.use(`${api}/products`, productsRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/coupons`, couponRouter);
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'same-origin');
  next();
});


let merchantId = process.env.MERCHANT_ID1;
let salt_key = process.env.SALT_KEY1;

app.post("/neworder", async (req, res) => {
  const { user, items, shippingInfo, totalPrice, MUID, transactionId } = req.body;

  // Determine the amount based on the transactionId prefix
  const amount = transactionId.startsWith("TT") ? totalPrice : totalPrice * 100;
  const status = transactionId.startsWith("TT") ? "paid" : "unpaid";

  // Create the order object
  const orderData = {
    merchantId: merchantId,
    user: user,
    items: items,
    shippingInfo,
    amount: amount,  // Use the conditionally set amount
    redirectUrl: `${process.env.FRONTEND_URL1}/${transactionId}`,
    callbackUrl: `http://saviralfoods.in`,
    redirectMode: "REDIRECT",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
    MUID,
    merchantTransactionId: transactionId,
    status: status, // Default status is unpaid, set to paid in frontend
    createdAt: new Date(),
  };

  try {
    // Save order to the database
    const newOrder = new Order(orderData);

    // Check if merchantTransactionId starts with "TT"
    if (transactionId.startsWith("TT")) {
      // Just save the order without proceeding to payment
      await newOrder.save();
      console.log("Order placed without payment:", orderData);
      return res.json({ message: "Order placed successfully without payment" });
    }

    // If merchantTransactionId starts with "T" but not "TT", proceed with payment
    await newOrder.save();
    console.log("Proceeding with payment for order:", orderData);

    // Prepare payload for the payment request
    const keyIndex = 1;
    const payload = JSON.stringify(orderData);
    const payloadMain = Buffer.from(payload).toString("base64");

    const string = payloadMain + "/pg/v1/pay" + salt_key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const prod_URL = process.env.PHONEPAY_API1;

    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    // Send payment request
    await axios(options)
      .then((response) => {
        res.json(response.data); // Send payment response to the frontend
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("Payment request failed");
      });
  } catch (error) {
    console.log("Error saving order:", error);
    res.status(500).send("Failed to create order");
  }
});




app.get('/neworder/:transactionId', async (req, res) => {
  const { transactionId } = req.params;

  try {
    // Find the order by the transaction ID
    const order = await Order.findOne({ merchantTransactionId: transactionId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Return the found order
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get("/status", async (req, res) => {
  const { id: merchantTransactionId } = req.query; // Extract transaction ID from query
  const keyIndex = 1;

  try {
    // Construct the string for generating checksum
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;

    // Call the PhonePe status API
    const options = {
      method: 'GET',
      url: process.env.STATUS_API1 + `/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': merchantId,
      },
    };

    const response = await axios(options);

    if (response.data.success) {
      // Payment is successful, update the order status in the database
      await Order.findOneAndUpdate(
        { merchantTransactionId },
        { status: 'paid' },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: 'Payment successful',
        amount: response.data.data.amount, // Adjust based on actual response structure
      });
    } else {
      res.status(200).json({
        success: false,
        message: 'Payment failed',
        reason: response.data.data.message, // Adjust based on actual response structure
      });
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Server
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
