import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

export { Admin };
