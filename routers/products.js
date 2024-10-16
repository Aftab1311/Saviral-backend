const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const GridFSStream = require("gridfs-stream");
const { Product } = require("../models/product");
const { gfs } = require("../db");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  try {
    if (!req.query.page && !req.query.limit) {
      const products = await Product.find();
      return res.status(200).json(products);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const productList = await Product.find().skip(skip).limit(limit);
    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      products: productList,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      hasMore: page * limit < totalProducts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.get(`/:id`, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  try {
    const product = await Product.findById(id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.post(
  "/",
  upload.fields([
    { name: "Image", maxCount: 1 },
    { name: "Image1", maxCount: 1 },
    { name: "Image2", maxCount: 1 },
    { name: "Image3", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        product_id,
        desc,
        category,
        countInStock,
        quantityPrices,
      } = req.body;

      const updateData = {
        name,
        product_id,
        desc,
        category,
        countInStock,
        quantityPrices: JSON.parse(quantityPrices),
        Image: req.files.Image ? req.files.Image[0].buffer : null,
        Image1: req.files.Image1 ? req.files.Image1[0].buffer : null,
        Image2: req.files.Image2 ? req.files.Image2[0].buffer : null,
        Image3: req.files.Image3 ? req.files.Image3[0].buffer : null,
      };

      const isProductExist = await Product.findOne({ product_id });
      if (isProductExist) {
        return res.status(400).json({
          success: false,
          message: "Product already exists",
        });
      }

      const newProduct = new Product(updateData);
      const response = await newProduct.save();
      if (response) {
        res.status(201).json({ success: true });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Error creating product" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.put(
  "/:product_id",
  upload.fields([
    { name: "Image", maxCount: 1 },
    { name: "Image1", maxCount: 1 },
    { name: "Image2", maxCount: 1 },
    { name: "Image3", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { product_id } = req.params;
      const {
        name,
        desc,
        category,
        countInStock,
        quantityPrices,
      } = req.body;

      const updateData = {};

      const isProductExist = await Product.findOne({ product_id });
      if (!isProductExist) {
        return res.status(404).json({
          success: false,
          message: "Product doesn't exist",
        });
      }
      if (name) updateData.name = name;
      if (desc) updateData.desc = desc;
      if (category) updateData.category = category;
      if (countInStock) updateData.countInStock = countInStock;
      if (quantityPrices) updateData.quantityPrices = JSON.parse(quantityPrices);
      if (req?.files?.Image) updateData.Image = req.files.Image[0].buffer;
      if (req?.files?.Image1) updateData.Image1 = req.files.Image1[0].buffer;
      if (req?.files?.Image2) updateData.Image2 = req.files.Image2[0].buffer;
      if (req?.files?.Image3) updateData.Image3 = req.files.Image3[0].buffer;

      const response = await Product.findOneAndUpdate(
        { product_id: product_id },
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (response) {
        res.status(200).json({ success: true, product: response });
      } else {
        res.status(400).json({ success: false, message: "Error updating product" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);
router.delete(`/:id`, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  try {
    const product = await Product.findByIdAndDelete(id);
    if (product) {
      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Upload an image
router.post("/upload", upload.single("image"), (req, res) => {
  const { buffer, mimetype } = req.file;

  if (!buffer || !mimetype) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const writestream = gfs.createWriteStream({
    filename: req.file.originalname,
    mode: "w",
    content_type: mimetype,
  });

  writestream.write(buffer);
  writestream.end();

  writestream.on("close", (file) => {
    res.status(200).json({ success: true, file: file });
  });
});

// Retrieve an image
router.get("/image/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ success: false, message: "No file found" });
    }

    const readstream = gfs.createReadStream({ filename: file.filename });
    readstream.pipe(res);
  });
});

module.exports = router;
