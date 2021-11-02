import mongoose from "mongoose";
import User from "./userModel";
import Item from "./itemModel";

const connectDB = () => {
  return mongoose
    .connect(process.env.MONGODB_URL)
    .catch((error) =>
      console.error("Connection to MongoDB failed (error)!", error)
    );
};

const models = { User, Item };
export { connectDB };
export default models;
