import express from "express";
import { BookingModel } from "../models/bookingModel.js";
import{UserModel} from '../models/UserModel.js'
const BookingRoutes = express.Router();

//creating new booking
BookingRoutes.post("/addbooking", async (req, res) => {
  try {
    if (!req.body.branch_name || !req.body.company_name || !req.body.contact_person) {
      return res.status(400).send({
        message: "send all requierd feilds branch_name company_name contact_person ..etc",
      });
    }
    // const existingUser = await UserModel.findById(req.body.user_id);
    // if (!existingUser) {
    //   return res.status(400).send({
    //     message: "Invalid user. Please provide a valid user ID.",
    //   });
    // }
    const existingBooking = await BookingModel.findOne({pan: req.body.pan});

    if (existingBooking && existingBooking.user_id.toString() !== req.body.user_id.toString()) {
      return res.status(400).send({
        message: "Booking with the same GST or PAN already exists for a different user.",
      });
    }
    const new_booking = {
      user_id: req.body.user_id,
      bdm:req.body.bdm,
      branch_name: req.body.branch_name,
      company_name: req.body.company_name,
      contact_person: req.body.contact_person,
      email: req.body.email,
      contact_no: req.body.contact_no,
      services: req.body.services,
      total_amount: req.body.total_amount,
      term_1:req.body.term_1,
      term_2:req.body.term_2,
      term_3:req.body.term_3,
      term_1_payment_date: req.body.term_1_payment_date,
      term_2_payment_date:req.body.term_2_payment_date,
      term_3_payment_date:req.body.term_3_payment_date,
      pan: req.body.pan,
      gst: req.body.gst,
      remark: req.body.remark,
      date: req.body.date ? req.body.date : new Date(),
      status:req.body.status,
      bank:req.body.bank
    };
    
    const booking = await BookingModel.create(new_booking);
    return res.status(201).send({Message:"Booking Created Successfully",booking_id:booking._id});
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

//edit booking
BookingRoutes.patch('/editbooking/:id', async (req, res) => {
  const { id } = req.params;
  let updates = req.body;

  // Get the user role from the headers (e.g., 'user-role' header)
  const user_role = req.headers['user-role'];

  // Check if the user role is provided
  if (!user_role) {
    return res.status(400).send({ message: "User role is required" });
  }

  try {
    // Fetch the existing booking to check the current data
    const Booking = await BookingModel.findById(id);

    if (!Booking) {
      return res.status(404).send('Booking not found');
    }

    // Define roles with full access
    const rolesWithFullAccess = ['dev', 'senior admin'];

    // Logic for admin: allow changes to everything except "services"
    if (user_role === 'admin') {
      // Exclude the "services" field from the updates object
      const { services, ...allowedUpdates } = updates;
      updates = allowedUpdates;
    }

    // If the user has full access (dev or senior admin), they can update everything
    if (rolesWithFullAccess.includes(user_role) || user_role === 'admin') {
      const updatedBooking = await BookingModel.findByIdAndUpdate(id, updates, { new: true });
      return res.status(200).send({ message: "Booking Updated Successfully", updatedBooking });
    }

    // If the role is neither dev, senior admin, nor admin, deny access
    return res.status(403).send({
      message: "You do not have permission to edit this booking"
    });

  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

//Delete Booking 
BookingRoutes.delete('/deletebooking/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Find the booking by ID and delete it
    const deletedBooking = await BookingModel.findByIdAndDelete(id);
    
    // If no booking is found, return a 404 error
    if (!deletedBooking) {
      return res.status(404).send('Booking not found');
    }

    // If booking is successfully deleted, return a success message
    res.status(200).send({ message: "Booking Deleted Successfully" });
  } catch (err) {
    // Handle any errors and return a 500 response
    res.status(500).send(err);
  }
});

//getting bookings by date
BookingRoutes.get('/bookings?', async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    // If startDate and endDate are provided, filter bookings between those dates
    //GET /bookings?startDate=2023-09-01&endDate=2023-09-30

    const query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await BookingModel.find(query);
    
    const no_of_bookings=bookings.length;
    if(no_of_bookings==0){
      return res.status(404).send({message:"No Bookings Found"})
    }
    
    // res.status(200).send({ message: "Bookings fetched successfully", bookings,no_of_bookings });
    res.status(200).send(bookings);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

//getting all bookings
BookingRoutes.get('/all',async(req,res)=>{
  const Allbookings = await BookingModel.find({});
  if(Allbookings.length!=0){
    return res.status(200).send({message:"All Bookings Fetched Successfully",Allbookings})
  }
  return res.status(404).send({message:"No Bookings To Show"})
})

//geting all bookings by status
BookingRoutes.get('/bookings/status', async (req, res) => {
  const { status } = req.query;

  try {
    // Validate the status parameter
    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).send({ message: "Invalid or missing status parameter. Valid statuses are: Pending, In Progress, Completed." });
    }

    // Query to find bookings based on the status
    const bookings = await BookingModel.find({ status });

    const no_of_bookings = bookings.length;
    if (no_of_bookings === 0) {
      return res.status(404).send({ message: "No Bookings Found for the given status" });
    }

    res.status(200).send(bookings);
  } catch (err) {
    // Handle any server errors
    console.error("Error fetching bookings by status:", err.message);
    res.status(500).send({ message: err.message });
  }
});
export default BookingRoutes;
