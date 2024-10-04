import express from "express";
import { UserModel } from "../models/UserModel.js";
import { BookingModel } from "../models/bookingModel.js";
// import {regex, pattern} from 'regex';
import bcrypt from 'bcrypt';
const saltRounds = 5;


const UserRoutes = express.Router();


UserRoutes.post("/adduser", async (req, res) => {
  try {
    const { name, email, password, user_role } = req.body;
    
    // Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).send({
        message: "send all required fields: name, email, password",
      });
    }

    // Convert email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Check if the email is already registered
    const existingUser = await UserModel.findOne( {email: normalizedEmail} );
    if (existingUser) {
      return res.status(409).send({ message: "Email is already registered" });
    }

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with hashed password
    const new_user = {
      name,
      email: normalizedEmail,
      password: hashedPassword,
      user_role
    };

    const User = await UserModel.create(new_user);
    return res.status(201).send(User);

  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});



UserRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).send({
        message: "Please provide both email and password.",
      });
    }

    // Find the user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).send({
        message: "User not found.",
      });
    }

    // Compare the provided password with the stored hashed password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send({
        message: "Invalid email or password.",
      });
    }

    // If credentials are valid, send a success response
    res.status(200).send({
      message: "Login successful",
      user: user,  // You may choose to return limited user info (e.g., user ID or name)
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

//listing all users
UserRoutes.get('/all',async(req,res)=>{
  try {
    const Users = await UserModel.find({});
    if (Users.length === 0) {
      return res.status(404).send({
        message: "No Users found",
      });
    }
    const no_of_users=Users.length;
    // console.log(no_of_users);
    
    res.status(200).send({no_of_users})
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
})

//getting all the bookings for specific user

UserRoutes.get('/bookings/:id', async (req, res) => {
  const id = req.params.id;
  try {
    if (!req.params.id) {
      return res.status(400).send({
        message: "Not A VALID USER",
      });
    }
    const Bookings = await BookingModel.find({ user_id: id });
    //  console.log(Bookings)
    if (Bookings.length === 0) {
      return res.status(404).send({
        message: "No bookings found for this user",
      });
    }
    res.status(200).send(Bookings)

  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
})

// //getting unique booking 
// UserRoutes.get('/bookings/booking/:id', async (req, res) => {
//   const id = req.params.id;
  
//   try {
//     const Booking = await BookingModel.find({ _id: id });
//     //  console.log(Bookings)
//     if (Booking.length === 0) {
//       return res.status(404).send({
//         message: "No bookings found with this id",
//       });
//     }
//     res.status(200).send(Booking)

//   } catch (error) {
//     console.log(error.message);
//     return res.status(500).send({ message: error.message });
//   }
// })

// //using regex
// // Search by company name using regex
// UserRoutes.get('/booking/search', async (req, res) => {
//   const searchPattern = req.query.pattern;
  
//   try {
//     // Use regex to search for bookings that match the company name pattern
//     const Booking = await BookingModel.find({ company_name: { $regex: searchPattern, $options: 'i' } });
    
//     if (Booking.length === 0) {
//       return res.status(404).send({
//         message: "No bookings found matching the company name pattern",
//       });
//     }
    
//     res.status(200).send(Booking);
//   } catch (error) {
//     console.log(error.message);
//     return res.status(500).send({ message: error.message });
//   }
// });


//combined search 
UserRoutes.get('/:id?', async (req, res) => {
  const id = req.params.id // This may be undefined if no id is provided
  const searchPattern = req.query.pattern; // Search pattern from the query parameter
  // console.log(id,searchPattern);
  try {
    let Booking;

    if (id) {
      // If an ID is provided, search by the booking ID
      Booking = await BookingModel.find({ _id: id });
      
      if (Booking.length === 0) {
        return res.status(404).send({
          message: "No bookings found with this id",
        });
      }
    } else if (searchPattern) {
      // If no ID is provided but a search pattern is provided, search by company name
      Booking = await BookingModel.find({ company_name: { $regex: searchPattern, $options: 'i' } });
      
      if (Booking.length === 0) {
        return res.status(404).send({
          message: "No bookings found matching the company name pattern",
        });
      }
    } else {
      // If neither an ID nor a search pattern is provided, return an error
      return res.status(400).send({
        message: "Either id or pattern query parameter is required",
      });
    }
    
    res.status(200).send(Booking);

  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});



//check user is a valid or not 

UserRoutes.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    if (!req.params.id) {
      return res.status(400).send({
        message: "Not A VALID USER",
      });
    }
    const User = await UserModel.find({ _id: id });
    //  console.log(Bookings)
    if (User.length === 0) {
      return res.status(404).send({
        message: "No User found with this id",
        status:false
      });
    }
    res.status(200).send({message:"VALID USER",status:true})

  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
})

export default UserRoutes;
