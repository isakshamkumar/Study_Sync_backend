const express=require('express')
const router=express.router()



//teacher signup
router.post("/signup", async (req, res) => {
    const { name, password, college, email, dept, contactNumber } = req.body;
    //college and dept will be fetched, so there will be kinda like a /me route to get all colleges and dept and then we will have their particular id's
    const teacher = await Teachers.findOne({ email })//email should be different for all teacher
    if (teacher) {
        res.status(403).send({ message: "Teacher already exists" })
    } else {
        const newTeacher = new Teachers({ name, password, email, college, dept, contactNumber, classes: [], projectsRecieved: [] });
        await newTeacher.save();
        const token = jwt.sign({ teacher: newTeacher._id }, SECRETFORTEACHER, { expiresIn: '1h' });
        res.json({ message: 'Teacher created successfully', token });
    }

})
//teacher signin
router.post("/login", async (req, res) => {
    const { name, password, email } = req.body
    const teacher = await Teachers.findOne({ name, password, email }).populate("college")
    if (teacher) {
        const token = jwt.sign({ teacher: teacher._id }, SECRETFORTEACHER, { expiresIn: '1h' });
        res.json({ message: "Logged In Successfully", token ,college:teacher.college})
    } else {
        res.status(403).json({ message: 'Teacher not found' });
    }
})

//teacher create class
router.post("/createclass", authenticateJwtTeacher, async (req, res) => {
    const { nameOfClass } = req.body;
    const teacher = req.teacher
    if (!nameOfClass) {
        return res.status(500).send("Please enter the details")
    };
    const inviteTokens = `${Math.round(Math.random() * 100)}`
    let dateCreated = `${new Date()}`
    const newClass = new Classes({ nameOfClass, teacher, dateCreated, students: [], inviteTokens })


    await newClass.save();
    const updatedTeacher = await Teachers.findByIdAndUpdate(teacher, { $push: { classes: newClass._id } }, { new: true })
    res.status(200).json({ message: "Class Created Successfully", inviteTokens })

})
router.get("/me", authenticateJwtTeacher, async (req, res) => {
    const teacher = await Teachers.findById(req.teacher).populate("classes").populate("college").populate("dept")
    if (teacher) {

        res.status(200).json(teacher)

    } else {
        res.status(400).json({ message: "Teacher Not Found" })
    }
})
router.get("/getclasses", authenticateJwtTeacher, async (req, res) => {
    const teacherId = req.teacher
    const classes = await Classes.find({ teacher: teacherId }).populate("students").populate("teacher");
    console.log(classes);
    if (!classes) {
        res.status(409).send('No Classes Found')
    } else {
        res.status(200).json(classes);
    }

})
router.get("/getclasses/:classId",authenticateJwtTeacher,async(req,res)=>{
    let classId=req.params.classId;
    let foundClass = await Classes.findOne({_id:classId}).populate("students");
    if(foundClass){
        res.json({message:'Class Found',class:foundClass})
    }
    else{
        res.status(404).json({message:'No Class Found'})
    }
})
//teacher can see a particularr student in the class
router.get("/allClasses/student/:studentId",authenticateJwtTeacher,async (req,res)=>{
    let studentId=req.params.studentId;
    const student=await Students.findOne({_id:studentId}).populate("classesJoined").populate("projectsUploaded").populate("collegeDetails").populate({
        path: "projectsUploaded",
        select: "-content",
      });
    if(!student){
        res.status(404).json({message:'No Student Found'})
    }
    else{
        res.json({message:'Student Found',student})
    }
})
//teacher can see a particularr project of student 
router.get("/student/project/:projectId",authenticateJwtTeacher,async (req,res)=>{
    let projectId=req.params.projectId;
    const project=await Projects.findOne({_id:projectId}).populate("teacher").populate("student")
    if(!project){
        res.status(404).json({message:'No project Found'})
    }
    else{
        res.json({message:'project Found',project})
    }
})
module.exports=router;