const express=require("express");
const app=express();


const userRoutes=require("./routes/user");
const profileRoutes=require("./routes/profile");
const paymentRoutes=require("./routes/Payments");
const courseRoutes=require("./routes/Course");
const database=require("./config/database");
const cookieParser=require("cookie-parser");
const cors=require("cors");
const {cloudinaryConnect}=require("./config/cloudinary");
const fileUpload=require("express-fileupload")
const dotenv=require("dotenv");

dotenv.config();
const PORT=process.env.PORT||4000;

database.connect();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"http://localhost:5173",
        creadentials:true
    })
)

app.use(
    fileUpload({
        useTempFiles:true,
       tempFileDir:"/tmp" 
    })
)


// cloudinary connections
cloudinaryConnect();

// routes
app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/course",courseRoutes);
app.use("/api/v1/payment",paymentRoutes);


// default routes
// Testing the server
app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: "Your server is up and running ...",
	});
});

// Listening to the server
app.listen(process.env.PORT || PORT, () => {
    console.log(`Go catch the server at PORT ${process.env.PORT || PORT}`);
  })

// End of code.
