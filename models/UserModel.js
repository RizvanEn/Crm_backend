import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    user_role: { type: String, required: true },
  },
  { 
    timestamps: false, 
    versionKey: false  // This removes the __v field
  }
);


export const UserModel = mongoose.model("user", userSchema);
