import mongoose from "mongoose";
import mongooseDouble from "mongoose-double";

mongooseDouble(mongoose);

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const productCategorySchema = mongoose.Schema(
  {
    category: { type: String, required: true },
    image_url: { type: String, required: true },
    image_public_id: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    image_url: { type: String, required: true },
    image_public_id: { type: String, required: true },

    product_images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],

    product_name: { type: String, required: true },
    product_price: { type: mongoose.Schema.Types.Double, required: true },
    product_rating: {
      type: mongoose.Schema.Types.Double,
      required: true,
      default: 0.0,
    },
    product_description: { type: String, required: true },

    product_quantity: { type: Number, required: true },
    product_length: { type: mongoose.Schema.Types.Double, required: true },
    product_breadth: { type: mongoose.Schema.Types.Double, required: true },
    product_height: { type: mongoose.Schema.Types.Double, required: true },
    product_weight: { type: mongoose.Schema.Types.Double, required: true },

    product_discount_percentage: {
      type: mongoose.Schema.Types.Double,
      required: true,
    },
    product_like_count: { type: Number, required: true },

    product_colour: { type: String, required: true },
    product_size_available: [{ type: String, required: true }],
    product_tags: [{ type: String, required: true }],
    is_available: { type: Boolean, required: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const ProductCategory =
  mongoose.models.ProductCategory ||
  mongoose.model("ProductCategory", productCategorySchema);
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export { User, ProductCategory, Product };
