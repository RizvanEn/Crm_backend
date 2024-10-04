import express from "express";
import { connection } from "./config.js";
import UserRoutes from './routes/Userroutes.js'
import BookingRoutes from "./routes/BookingRoute.js";
import cors from "cors";
const app = express();
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST','PUT','DELETE','PATCH'], // Allow only these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization','user-role'], // Allow only these headers
  credentials: true, // Allow cookies to be included in the requests
};

app.use(cors(corsOptions));
// app.use(cors));

// app.use(cors());
// app.use(
//   cors({
//     origin: "http://localhost:5500",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type"],
//   })
// );
// app.use(cors({
//   origin: "http://127.0.0.1:5500",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type"],
// }));

app.use("/user", UserRoutes);
app.use("/booking", BookingRoutes);

app.get("/", (req, res) => {
  res.send("<h1>server is running successfully</h1>");
});

connection()
  .then(() => {
    console.log("connected");
    app.listen( () => {
      // console.log(`server is running at http://localhost:${PORT} `);
    });
  })
  .catch((err) => {
    console.log(err);
  });

