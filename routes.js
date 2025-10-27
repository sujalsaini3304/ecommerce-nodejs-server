import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectToMongoDB from "./db/config.js";
import { ProductCategory, User, Product } from "./model/model.js";
import jwt from "jsonwebtoken";
import cloudinary from "./cloudinary.js";
import { upload } from "./upload.js";
import streamifier from "streamifier";

dotenv.config({
  path: ".env",
});

connectToMongoDB();
const router = express.Router();

router.post(
  "/create/product",
  upload.fields([
    { name: "image_base", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const {
        category,
        product_name,
        product_price,
        product_description,
        product_quantity,
        product_colour = "N/A",
        product_size_available,
        product_tags,
        product_discount_percentage,
        product_length = 0,
        product_breadth = 0,
        product_height = 0,
        product_weight = 0,
        product_like_count = 0,
        product_rating = 0.0,
        is_available = true,
      } = req.body;

      if (!req.files || !req.files.image_base) {
        return res.status(400).json({ message: "Base image is required!" });
      }

      const baseImage = req.files.image_base[0];
      const baseUpload = await cloudinary.uploader.upload(
        `data:${baseImage.mimetype};base64,${baseImage.buffer.toString(
          "base64"
        )}`,
        { folder: `shophub/data/website/products/${product_name}` }
      );

      let productImages = [];
      if (req.files.images) {
        for (const img of req.files.images) {
          const uploadRes = await cloudinary.uploader.upload(
            `data:${img.mimetype};base64,${img.buffer.toString("base64")}`,
            { folder: `shophub/data/website/products/${product_name}` }
          );
          productImages.push({
            url: uploadRes.secure_url,
            public_id: uploadRes.public_id,
          });
        }
      }

      const newProduct = await Product.create({
        category,
        image_url: baseUpload.secure_url,
        image_public_id: baseUpload.public_id,

        product_images: productImages,

        product_name,
        product_price,
        product_description,
        product_quantity,
        product_colour,
        product_discount_percentage,
        product_length,
        product_breadth,
        product_height,
        product_weight,
        product_like_count,
        is_available,
        product_rating,

        product_size_available: product_size_available
          ? product_size_available.split(",")
          : [],

        product_tags: product_tags ? product_tags.split(",") : [],
      });

      res.status(201).json({
        success: true,
        message: "Product created successfully!",
        product: newProduct,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to create product",
        error: error.message,
      });
    }
  }
);

router.get("/product", async (req, res) => {
  try {
    const dbResponse = await Product.find({});

    if (!dbResponse) {
      return res.status(404).json({
        message: "No Product is there.",
        data: [],
      });
    }

    return res.status(200).json({
      message: "Products fetched successfully.",
      data: dbResponse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error.",
      data: [],
    });
  }
});

router.get("/product/category", async (req, res) => {
  try {
    const dbResponse = await ProductCategory.find({});

    if (!dbResponse) {
      return res.status(404).json({
        message: "No Product category.",
        data: [],
      });
    }

    return res.status(200).json({
      message: "Product category fetched successfully.",
      data: dbResponse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error.",
      data: [],
    });
  }
});

router.post(
  "/create/product/category",
  upload.single("file"),
  async (req, res) => {
    try {
      const { category } = req.body;

      if (!category) {
        return res.status(400).json({
          message: "Product category is required.",
          status: 400,
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `shophub/data/website/productCategory` },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req.file.buffer);

      if (!result) {
        return res.status(500).json({
          message: "Failed to upload file to Cloudinary",
          status: 500,
        });
      }

      const dbResponse = await ProductCategory.create({
        category: category,
        image_url: result.secure_url,
        image_public_id: result.public_id,
      });

      return res.status(200).json({
        message: "Product category created successfully.",
        data: dbResponse,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Product category creation failed.",
        error: error.message || error,
      });
    }
  }
);

router.post("/create/user", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res
        .status(400)
        .json({ message: "Missing credentials.", status: 400 });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exist in database.", status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const response = await User.create({
      username: `${firstname} ${lastname}`,
      email: email,
      password: hashedPassword,
    });

    if (!response) {
      return res
        .status(500)
        .json({ message: "User not created in database.", status: 500 });
    }

    return res
      .status(201)
      .json({ message: "User created in database.", status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      message: "Internal Server Error.",
      status: 500,
    });
  }
});

router.post("/login/user", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({
      message: "User not found in database.",
      status: 404,
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res
      .status(400)
      .json({ message: "Invalid credentials", status: 400 });

  const token = jwt.sign(
    { email: user.email, username: user.username, userid: user._id.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  res.status(200).json({
    message: "Login success",
    username: user.username,
    email: user.email,
    token: token,
    status: 200,
  });
});

router.post("/delete/user", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({
      message: "User not found in database.",
      status: 404,
    });
  }

  const dbResponse = await User.deleteOne({ email: email });

  if (!dbResponse) {
    return res.status(500).json({
      message: "User not deleted.",
      status: 500,
    });
  }

  res.status(200).json({
    message: "User deleted successfully",
    status: 200,
  });
});

export default router;
