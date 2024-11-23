import express from "express";
import { PORT,connection } from "./config.js";
import UserRoutes from './routes/Userroutes.js'
import BookingRoutes from "./routes/BookingRoute.js";
import ServiceRoutes from "./routes/ServiceRoute.js";
import cors from "cors";
const app = express();
app.use(express.json());

const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST','PUT','DELETE','PATCH'], // Allow only these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization','user-role'], // Allow only these headers
  credentials: true, // Allow cookies to be included in the requests
};

app.use(cors(corsOptions));
app.use("/user", UserRoutes);
app.use("/booking", BookingRoutes);
app.use("/services",ServiceRoutes)

connection()
  .then(() => {
    console.log("connected");
    app.listen(PORT, () => {
      // console.log(`server is running at http://localhost:${PORT} `);
    });
  })
  .catch((err) => {
    console.log(err);
  });

