import mongoose from 'mongoose';

const uri = "mongodb+srv://Rizvan:Rizvan@123@cluster0.mwepz3e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/mydatabase";

const Connection = async () => {
  try {
    await mongoose.connect("mongodb+srv://Rizvan:Rizvan@123@cluster0.mwepz3e.mongodb.net/Mydatabase")
    console.log(mongoose.connection.host);
    console.log("db connected")
    
  }
  catch (error) {
    console.error(error);
  }
}

export default Connection;