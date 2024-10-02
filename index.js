const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

require("dotenv").config();
const app = express();
app.use(cors());
app.options("*", cors());

const productsRouter = require("./routers/products");
const usersRouter = require("./routers/users");
const ordersRouter = require("./routers/orderRoutes");

const api = process.env.API_URL;
// Middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(`${api}/products`, productsRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);

// Database




// Server
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
