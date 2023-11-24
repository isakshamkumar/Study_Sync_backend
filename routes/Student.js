
const express=require('express')
const router=express.router()
const authenticateJwtStudent=require('../middlewares/AuthStudent')



router.get("/me", authenticateJwtStudent, async (req, res) => {
    const student = await Students.findById(req.student)
  .populate("collegeDetails")
  .populate("classesJoined")
  .populate({
    path: "projectsUploaded",
    select: "-content",
  });

    if (student) {

        res.status(200).json(student)

    } else {
        res.status(400).json({ message: "student Not Found" })
    }
})
///student signs up
router.post("/signup", async (req, res) => {
    // collegeId and courseEnrolled will be ids 
    const { name, email, password, enrollmentNumber, collegeId, courseEnrolled } = req.body;
    const existingStudent = await Students.findOne({ email })//email should be unique;
    if (existingStudent) {
        res.status(403).json({ message: "Student already exists" })
    }
    else {
        const collegeDetails = {
            enrollmentNumber,
            collegeId,
            courseEnrolled
        }
        const newStudent = new Students({ name, email, password, collegeDetails, classesJoined: [], projectsUploaded: [] })
        await newStudent.save();
        const token = jwt.sign({ student: newStudent._id }, SECRETFORSTUDENT, { expiresIn: '1h' })
        res.status(200).json({ message: "Student Created Successfully", token })
    }

})

///student signs in
router.post("/login", async (req, res) => {
    const { name, email, password } = req.body;
    const student = await Students.findOne({ name, email, password }).populate("collegeDetails.collegeId");
    if (student) {
        const token = jwt.sign({ student: student._id }, SECRETFORSTUDENT, { expiresIn: '1h' });
        res.status(200).json({ message: "Logged In Successfully", token,college:student.collegeDetails.collegeId })
    }
    else {
        res.status(400).json({ message: "Cannot Find Student" })
    }
})

///student enters invite token and get details of the class
router.post("/getClass",authenticateJwtStudent,async(req,res)=>{
    const{inviteToken}= req.body;
    ///assuming the invite token will always be unique
    const availableClass= await Classes.findOne({inviteTokens:inviteToken}).populate("teacher").populate("students")
    if(availableClass){
  
        const resClass={
            _id:availableClass._id,
            nameOfClass:availableClass.nameOfClass,
            teacher: availableClass.teacher.name,
            dateCreated:availableClass.dateCreated,
            students:availableClass.students
        }
        res.json({message:"class found",resClass})
    }
    else{
        res.status(400).json({message:"No Class Found"})
    }
    
})
//student joins a class by providing class invitetoken
router.post("/joinClass",authenticateJwtStudent,async (req,res)=>{
    const{inviteToken}= req.body;
    const student = await Students.findById(req.student);
    // console.log(student);
    if(student){
        const foundClass= await Classes.findOne({inviteTokens:inviteToken});
        // console.log(foundClass);
        if(!foundClass){
            res.status(400).json({message:"No Class Found"})
        }else{
            const updatedClass = await Classes.findByIdAndUpdate(foundClass._id, { $push: { students: student._id } }, { new: true })
            const updatedStudent = await Students.findByIdAndUpdate(student._id, { $push: { classesJoined: foundClass._id } }, { new: true })
            res.json({message:"Class Joined Successfully"})
        }
    }else{
        res.status(400).json({message:"No Student Found"})
    }
})
router.post("/projects/upload", authenticateJwtStudent, upload, async (req, res) => {
    // req.file contains the uploaded file (PDF)
    // req.body contains other form data (title, description, etc.)
    const projectData = req.body;
    const updatedTags=projectData.tags.split(",")
    projectData.tags=updatedTags
    const studentHeader = req.headers.student;
    const teacherHeader = req.headers.teacher;
  
    const student = await Students.findById(req.student);
  
    if (student) {
      const project = {
        ...projectData, //project data contains tags also which is array of strings
        student: studentHeader,
        teacher: teacherHeader,
        isPlagiarized: true,
        isApproved: false,
        content: req.file.buffer, // Store the file content as a buffer
      };
  
      const newProject = new Projects(project);
      await newProject.save();
      const updatedStudent = await Students.findByIdAndUpdate(
        student._id,
        { $push: { projectsUploaded: newProject._id } },
        { new: true }
      );
  
      res.json({ message: 'Project Uploaded Successfully' });
    }
  });

  module.exports=router;