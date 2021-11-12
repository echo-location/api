import mongoose from "mongoose";
const { Schema } = mongoose;
const itemSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
    },
    meta: {
      coordinates: {
        type: [Number, Number],
      },
    },
    lost: {
      type: Boolean,
      default: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);
export default Item;
