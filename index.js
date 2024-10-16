const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

require("dotenv").config();
const app = express();

// CORS configuration to allow specific origins
const allowedOrigins = ["https://saviral-foods.vercel.app", "http://localhost:5173","https://saviralfoods.in","www.saviralfoods.in"]; // Add any other origins you need

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

// Server
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
