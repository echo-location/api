import mongoose from "mongoose";
const { Schema } = mongoose;
const itemSchema = new Schema(
  {
    name: {
      type: String,
      unique: false,
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
    photo: {
      type: String,
    },
    lost: {
      type: Boolean,
      default: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

itemSchema.index({ "name": "text" });
const Item = mongoose.model("Item", itemSchema);
export default Item;
