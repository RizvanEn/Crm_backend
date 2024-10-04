import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const PORT = 3000;

export const connection = async () => {
  try {
    // const conn = await mongoose.connect('mongodb://localhost:27017/crm');
    const conn = await mongoose.connect(process.env.Mongo_URL);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log({ msg: "cannot connect to db", error: error.message });
    process.exit(1);
  }
};
