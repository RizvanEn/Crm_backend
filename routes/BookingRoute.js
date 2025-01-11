import express from "express";
import { BookingModel } from "../models/bookingModel.js";
const BookingRoutes = express.Router();

//Addbooking
BookingRoutes.post("/addbooking", async (req, res) => {
  const {
    user_id, bdm, branch_name, company_name,
    contact_person, email, contact_no,
    services, total_amount, term_1, term_2, term_3,
    term_1_payment_date, term_2_payment_date, term_3_payment_date,closed_by,
    pan, gst, remark, date, status,bank,funddisbursement
  } = req.body
  try {
    if (
      !branch_name || !contact_person
      || !user_id || !bdm || !contact_person || !email
      || !services || !Array.isArray(services) || services.length === 0
      || !services || !total_amount || !term_1 || !term_1_payment_date
      || !pan || !date
    ) {
      return res.status(400).send({
        message: "send all requierd feilds branch_name company_name contact_person ..etc",
      });
    }
    const existingBooking = await BookingModel.findOne({
      $or: [
        { gst: gst },
        { pan: pan }
      ]
    });

    if (existingBooking &&existingBooking.user_id.toString() !== user_id.toString()) {
      return res.status(400).send({
        message: "Booking with the same GST or PAN already exists for a different user.",
      });
    }
    const new_booking = {
      user_id: user_id,
      bdm: bdm,
      branch_name: branch_name,
      company_name: company_name ? company_name : "",
      contact_person: contact_person,
      email: email,
      contact_no: contact_no,
      closed_by:closed_by,
      services: services,
      total_amount: total_amount,
      term_1: term_1,
      term_2: term_2,
      term_3: term_3,
      term_1_payment_date: term_1_payment_date,
      term_2_payment_date: term_2_payment_date,
      term_3_payment_date: term_3_payment_date,
      pan: pan,
      gst: gst ? gst : "N/A",
      remark: remark,
      date: date ? date : new Date(),
      status: status,
      bank:bank,
      after_disbursement:funddisbursement
    };

    const booking = await BookingModel.create(new_booking);
    return res.status(201).send({ Message: "Booking Created Successfully", booking_id: booking._id,booking });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});
//Edit booking
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
//Getting bookings by date
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
//Getting all bookings
BookingRoutes.get('/all', async (req, res) => {

  const Allbookings = await BookingModel.find({});
  if (Allbookings.length != 0) {
    return res.status(200).send({ message: "All Bookings Fetched Successfully", Allbookings })
  }
  return res.status(404).send({ message: "No Bookings To Show" })
});
//geting bookings bu status
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
//Filter by service
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

export default BookingRoutes;