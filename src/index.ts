
import express from "express";
// const jwt = require("jsonwebtoken");
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const app = express();
import cors from "cors";
import teacherRoutes from "./routes/Teacher";
import studentRoutes from "./routes/Student";
import dotenv from "dotenv";
import { Colleges, Courses, Projects, Teachers } from "./models";
dotenv.config();
app.use(express.json());
app.use(cors());
app.use("/teacher", teacherRoutes);
app.use("/student", studentRoutes);

mongoose.connection.on('error', err => {
    console.log('MongoDb connection error', err);
   });

   async function connectToDatabase() {
    try {
       await mongoose.connect(process.env.MONGODB_CONNECTION_STRING || '');
    } catch (error) {
       console.error('Error connecting to MongoDB', error);
    }
   }
   
   connectToDatabase();

const db = mongoose.connection;
db.on("error", (error) => console.log("MongoDb connection errror ", error));
db.once("open", () => console.log("Connected to database"));
app.get("/allColleges", async (req, res) => {
  let colleges = await Colleges.find({});
  // console.log(colleges);
  res.json({ message: "List of all colleges", colleges });
});
//send all available departments
app.get("/alldepartments", async (req, res) => {
  let courses = await Courses.find({});
  // console.log(colleges);
  res.json({ message: "List of all courses", courses });
});
app.get("/allTeachers", async (req, res) => {
  let teachers = await Teachers.find({});
  // console.log(colleges);
  res.json({ message: "List of all teachers", teachers });
});
// app.post('/createCollege',async(req,res)=>{
//     const {name,pincode,courses}=req.body;
   //add check if college exists

//     const newCollege = new Colleges({ name, pincode, courses });
//     await newCollege.save();
//     res.json({ message: "College Created Successfully",newCollege });
// })
app.get("/portal/seeProject?keyword", async (req, res) => {
  if (!req.query.keyword) {
    return res
      .status(400)
      .json({ error: "The 'keyword' parameter is required." });
  }
  if (typeof req.query.keyword !== "string") {
    return res
      .status(400)
      .json({ error: "The 'keyword' parameter must be a string." });
  }
  const keyword = req.query.keyword.toLowerCase();
  const projects = await Projects.find({
    $or: [{ tags: { $in: [keyword] } }],
  }).select("-content");
  if (!projects) {
    res.status(404).json("No Projects Found");
  } else {
    res.json(projects);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
