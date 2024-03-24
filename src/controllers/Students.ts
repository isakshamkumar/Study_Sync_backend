import { Request, Response } from "express";
import { Classes, Projects, Students } from "../models";
import jwt from "jsonwebtoken";
import { SECRETFORSTUDENT } from "../config";
import { RequestWithStudent } from "../middlewares/AuthStudent";
import { z } from "zod";

const StudentRegisterSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be Atleast 2 letters long" })
    .max(20, { message: "Name must be at maximum 20 letters long" }),
  password: z
    .string()
    .min(3, { message: "Password Must be Minumum of 3 letters " })
    .max(20, { message: "Password Must be Maximum of 20 letters " }),
  collegeId: z.string(),
  enrollmentNumber: z.string(),
  email: z.string(),
  courseEnrolled: z.string(),
});
type StudentSignUpRequestBody=z.infer<typeof  StudentRegisterSchema>;
const StudentLoginSchema = z.object({
  email: z.string(),
  password: z
    .string()
    .min(3, { message: "Password Must be Minumum of 3 letters " })
    .max(20, { message: "Password Must be Maximum of 20 letters " }),
});
type StudentLoginRequestBody= z.infer<typeof StudentLoginSchema>
//zod schema for handleGet class function
const getClassSchema = z.object({
  inviteToken:z.string()
});
type StudentGetClassRequestBody=z.infer<typeof  getClassSchema>

export const handleGetStudentMetaData = async (req: Request, res: Response) => {
  //@ts-ignore
  const student = await Students.findById(req.student)
    .populate("collegeDetails")
    .populate("classesJoined")
    .populate({
      path: "projectsUploaded",
      select: "-content",
    });

  if (student) {
    res.status(200).json(student);
  } else {
    res.status(400).json({ message: "student Not Found" });
  }
};

export const handleRegisterStudent = async (req: Request, res: Response) => {
  // collegeId and courseEnrolled will be ids
  try {
    const {
      name,
      email,
      password,
      enrollmentNumber,
      collegeId,
      courseEnrolled,
    }:StudentSignUpRequestBody = StudentRegisterSchema.parse(req.body);
    let studentEnrollmentNumber = parseInt(enrollmentNumber);
    const existingStudent = await Students.findOne({ email });
    if (existingStudent) {
      res.status(403).json({ message: "Student already exists" });
    } else {
      console.log("reacher here");

      const collegeDetails = {
        enrollmentNumber: studentEnrollmentNumber,
        collegeId,
        courseEnrolled,
      };
      const newStudent = new Students({
        name,
        email,
        password,
        collegeDetails,
        classesJoined: [],
        projectsUploaded: [],
      });
      await newStudent.save();
      const token = jwt.sign({ student: newStudent._id }, SECRETFORSTUDENT, {
        expiresIn: "1h",
      });
      res.status(200).json({ message: "Student Created Successfully", token });
    }
  } catch (error) {
    return res.json({ error });
  }
};

export const handleStudentLogin = async (req: Request, res: Response) => {
  try{
    const { email, password }:StudentLoginRequestBody = StudentLoginSchema.parse(req.body);
    const student = await Students.findOne({ email, password }).populate(
      "collegeDetails.collegeId"
    );
    if (student) {
      const token = jwt.sign({ student: student._id }, SECRETFORSTUDENT, {
        expiresIn: "1h",
      });
      res.status(200).json({ message: "Logged In Successfully", token });
    } else {
      res.status(400).json({ message: "Cannot Find Student" });
    }
  }catch(error){
    return res.json({error})
  }
 
};
export const handleGetClass = async (req: Request, res: Response) => {
  try {
    const { inviteToken }:StudentGetClassRequestBody = getClassSchema.parse(req.body);
  ///assuming the invite token will always be unique
  const availableClass = await Classes.findOne({ inviteTokens: inviteToken })
    .populate("teacher")
    .populate("students");
  if (availableClass) {
    const resClass = {
      _id: availableClass._id,
      nameOfClass: availableClass.nameOfClass,
      //@ts-ignore
      teacher: availableClass.teacher.name,
      dateCreated: availableClass.dateCreated,
      students: availableClass.students,
    };
    res.json({ message: "class found", resClass });
  } else {
    res.status(400).json({ message: "No Class Found" });
  }
  } catch (error) {
    return res.json({error})
  }
  
};

export const handleJoinClass = async (
  req: RequestWithStudent,
  res: Response
) => {
  try {
    const { inviteToken }:StudentGetClassRequestBody = getClassSchema.parse(req.body);
    const student = await Students.findById(req.student);
    // console.log(student);
    if (student) {
      const foundClass = await Classes.findOne({ inviteTokens: inviteToken });
      // console.log(foundClass);
      if (!foundClass) {
        res.status(400).json({ message: "No Class Found" });
      } else {
        const updatedClass = await Classes.findByIdAndUpdate(
          foundClass._id,
          { $push: { students: student._id } },
          { new: true }
        );
        const updatedStudent = await Students.findByIdAndUpdate(
          student._id,
          { $push: { classesJoined: foundClass._id } },
          { new: true }
        );
        res.json({ message: "Class Joined Successfully" });
      }
    } else {
      res.status(400).json({ message: "No Student Found" });
    }
  } catch (error) {
    return res.json({error})
  }

};

//first do file upload then create schema
export const handleProjectUpload = async (req: Request, res: Response) => {
  // req.file contains the uploaded file (PDF)
  // req.body contains other form data (title, description, etc.)
  const projectData = req.body;
  const updatedTags = projectData.tags.split(",");
  projectData.tags = updatedTags;
  const studentHeader = req.headers.student;
  const teacherHeader = req.headers.teacher;
  //@ts-ignore
  const student = await Students.findById(req.student);

  if (student) {
    const project = {
      ...projectData, //project data contains tags also which is array of strings
      student: studentHeader,
      teacher: teacherHeader,
      isPlagiarized: true,
      isApproved: false,
      //@ts-ignore
      content: req.file.buffer, // Store the file content as a buffer
    };

    const newProject = new Projects(project);
    await newProject.save();
    const updatedStudent = await Students.findByIdAndUpdate(
      student._id,
      { $push: { projectsUploaded: newProject._id } },
      { new: true }
    );

    res.json({ message: "Project Uploaded Successfully" });
  }
};
