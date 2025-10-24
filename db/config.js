import mongoose from "mongoose";

async function connectToMongoDB() {
  const conn = await mongoose.connect(process.env.MONGODB_URL, {
    dbName: "Test",
  });

  if (!conn) {
    console.log("Connection failed with mongodb database.");
    return null;
  }

  console.log("Connection established with mongodb database.");
  return conn;
}

export default connectToMongoDB;
