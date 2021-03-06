import mongoose from "mongoose";
const { Schema } = mongoose;
const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
  },
  { timestamps: true }
);

// lookup user by email/username
userSchema.statics.findByLogin = async (login) => {
  let user = await this.findOne({ username: login });
  if (!user) user = await this.findOne({ email: login });
  return user;
};
const User = mongoose.model("User", userSchema);
export default User;
