import express from "express";
import dotenv from "dotenv";
import router from "./routes.js";
import middleware from "./authMiddleware.js";
import cors from "cors";

dotenv.config({
  path: ".env",
});

// app.use(cors({
//   origin: "http://localhost:3000",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true // if you want to send cookies
// }));
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth/", router);
app.use("/api/admin/", router);
app.use("/api/protected/", middleware, router);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "server started",
    status: 200,
  });
});

app.listen(process.env.PORT, (req, res) => {
  console.log(`Server started on port: ${process.env.PORT}`);
});
