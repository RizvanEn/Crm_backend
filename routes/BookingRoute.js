import express from "express";
import { BookingModel } from "../models/bookingModel.js";
import{UserModel} from '../models/UserModel.js'
const BookingRoutes = express.Router();

//creating new booking
BookingRoutes.post("/addbooking", async (req, res) => {
  try {
    if (!req.body.branch_name || !req.body.company_name || !req.body.contact_person||!req.body.pan) {
      return res.status(400).send({
        message: "send all requierd feilds branch_name company_name contact_person ..etc",
      });
    }

    // const existingBooking = await BookingModel.findOne({pan: req.body.pan});

    // if (existingBooking && existingBooking.user_id.toString() !== req.body.user_id.toString()) {
    //   return res.status(400).send({
    //     message: "Booking with the same GST or PAN already exists for a different user.",
    //   });
    // }
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
      closed_by:req.body.closed_by,
      bank:req.body.bank,
      after_disbursement:req.body.funddisbursement
      
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
BookingRoutes.get('/bookings', async (req, res) => {
  const { startDate, endDate } = req.query;
  const userId = req.query.userId;
  const userRole = req.query.userRole;
// console.log(userId,userRole);

  try {
    // Initialize query
    const query = {};

    // If startDate and endDate are provided, filter bookings between those dates
    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      // Ensure both startDate and endDate are valid dates
      if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
        return res.status(400).send({ message: "Invalid date format" });
      }

      // Set the time of endDate to the end of the day for inclusive filtering
      parsedEndDate.setHours(23, 59, 59, 999);

      query.date = {
        $gte: parsedStartDate,
        $lte: parsedEndDate,
      };
    }
    // Define valid roles
    const validRoles = ['dev', 'admin', 'senior admin'];
    // Check if the user has a valid role
    if (!userRole || !validRoles.includes(userRole)) {
      // If the user doesn't have a valid role, restrict the query to their user_id
      if (!userId) {
        return res.status(403).send({
          message: "Access forbidden. No valid role or user ID provided."
        });
      }
      //Restrict bookings to the user's own bookings
      query.user_id = userId;
    }
    // Fetch bookings based on the constructed query
    const bookings = await BookingModel.find(query);
    const no_of_bookings = bookings.length;
    if (no_of_bookings === 0) {
      return res.status(404).send({ message: "No Bookings Found" });
    }

    res.status(200).send(bookings);
  } catch (err) {
    // Log the error for debugging purposes
    console.error("Error fetching bookings:", err.message);
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

//geting all bookings by service
BookingRoutes.get('/bookings/services', async (req, res) => {
  const { service } = req.query;
  const userId = req.query.userId;
  const userRole = req.query.userRole; // Assuming the user role is provided in the headers

  try {
    // Validate the service parameter
    if (!service) {
      return res.status(400).send({
        message: "Missing service parameter."
      });
    }

    // Define valid roles
    const validRoles = ['dev', 'admin', 'senior admin'];

    // Check if the user has a valid role
    if (!userRole || !validRoles.includes(userRole)) {
      // If the user doesn't have a valid role, find bookings by user_id and service
      if (!userId) {
        return res.status(403).send({
          message: "Access forbidden. No valid role or user ID provided."
        });
      }

      const bookingsByUserAndService = await BookingModel.find({ user_id: userId, services: service });
      const no_of_bookings = bookingsByUserAndService.length;

      if (no_of_bookings === 0) {
        return res.status(404).send({
          message: "No Bookings Found for the given user and service."
        });
      }

      return res.status(200).send(
       
         bookingsByUserAndService,
       
    );
    }

    // If the user has a valid role, find bookings based on the service
    const bookings = await BookingModel.find({ services: service });
    const no_of_bookings = bookings.length;

    if (no_of_bookings === 0) {
      return res.status(404).send({ message: "No Bookings Found for the given service." });
    }

    res.status(200).send(bookings);
    
  } catch (err) {
    // Handle any server errors
    console.error("Error fetching bookings by service:", err.message);
    res.status(500).send({ message: err.message });
  }
});
//getting bookings by status
BookingRoutes.get('/bookings/status', async (req, res) => {
  const { status } = req.query;
  const userId = req.query.userId;
  const userRole = req.query.userRole; // Assuming the user role is provided in the headers

  try {
    // Validate the status parameter
    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).send({
        message: "Invalid or missing status parameter. Valid statuses are: Pending, In Progress, Completed."
      });
    }

    // Define valid roles
    const validRoles = ['dev', 'admin', 'senior admin'];

    let bookings;
    
    // Check if the user has a valid role
    if (userRole && validRoles.includes(userRole)) {
      // If the user has a valid role, fetch all bookings for the given status
      bookings = await BookingModel.find({ status: status });
    } else {
      // If the user doesn't have a valid role, fetch only the user's bookings for the given status
      if (!userId) {
        return res.status(403).send({
          message: "Access forbidden. No valid role or user ID provided."
        });
      }

      bookings = await BookingModel.find({ user_id: userId, status: status });
    }

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
