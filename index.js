const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = express();
const cors = require("cors");
const teacherRoutes=require('./routes/Teacher')
const studentRoutes=require('./routes/Student')
const AuthTeacher=require('./middlewares/AuthTeacher')
const AuthStudent=require('./middlewares/AuthStudent')
app.use(express.json());
app.use(cors())
app.use("/teacher",AuthTeacher,teacherRoutes)
app.use("student",AuthStudent,studentRoutes)
const multer = require('multer');
const storage = multer.memoryStorage(); 
const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 15 // for 5MB
    }
  }).single('content');
  

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, { dbName: "StudySyncDataBase" });

const db = mongoose.connection
db.on('error', (error) => console.log('MongoDb connection errror ', error));
db.once('open', () => console.log("Connected to database"))








app.get("/allColleges",async(req,res)=>{
    let colleges=await Colleges.find({});
    // console.log(colleges);
    res.json({message:'List of all colleges',colleges})
})
//send all available departments
app.get("/alldepartments",async(req,res)=>{
    let courses=await Courses.find({});
    // console.log(colleges);
    res.json({message:'List of all courses',courses})
})
app.get("/allTeachers",async(req,res)=>{
    let teachers=await Teachers.find({});
    // console.log(colleges);
    res.json({message:'List of all teachers',teachers})
})




  
  app.post('/portal/seeProject',async(req,res)=>{
    const keyword = req.query.keyword.toLowerCase();
    const projects = await Projects.find({
        $or: [
         
          
          { tags: { $in: [keyword] } }, 
        ],
      }).select("-content")
      if(!projects){
        res.status(404).json('No Projects Found')
      }
      else{
        res.json(projects)
      }
      

    
  })





app.listen(3000, () => console.log('Server running on port 3000'));