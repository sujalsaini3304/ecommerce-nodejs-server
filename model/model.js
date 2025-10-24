import mongoose from "mongoose";

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
    image_url: { type: String, required: true},
    image_public_id: { type: String, required: true},
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const ProductCategory = mongoose.models.ProductCategory || mongoose.model("ProductCategory", productCategorySchema);

export { User , ProductCategory };

