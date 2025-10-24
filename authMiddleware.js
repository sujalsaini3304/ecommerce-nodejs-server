import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({ path: ".env" });

const middleware = (req, res, next) => {
  try {
    // Get token from Authorization Header (Bearer <token>)
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token not provided.",
        status: 401,
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token.",
      status: 403,
    });
  }
};

export default middleware;
