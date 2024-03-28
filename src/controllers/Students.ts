import { Request, Response } from "express";
// import { Classes, Projects, Students } from "../models";
import jwt from "jsonwebtoken";
import { SECRETFORSTUDENT } from "../config";
import { RequestWithStudent } from "../middlewares/AuthStudent";
import { z } from "zod";
import prisma from "../prisma/Client";

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
type StudentSignUpRequestBody = z.infer<typeof StudentRegisterSchema>;
const StudentLoginSchema = z.object({
  email: z.string(),
  password: z
    .string()
    .min(3, { message: "Password Must be Minumum of 3 letters " })
    .max(20, { message: "Password Must be Maximum of 20 letters " }),
});
type StudentLoginRequestBody = z.infer<typeof StudentLoginSchema>;
//zod schema for handleGet class function
const getClassSchema = z.object({
  inviteToken: z.string(),
});
type StudentGetClassRequestBody = z.infer<typeof getClassSchema>;

export const handleGetStudentMetaData = async (req: Request, res: Response) => {
  //@ts-ignore
  // const student = await Students.findById(req.student)
  //   .populate("collegeDetails")
  //   .populate("classesJoined")
  //   .populate({
  //     path: "projectsUploaded",
  //     select: "-content",
  //   });
  const student = await prisma.student.findUnique({
    where: {
      //@ts-ignore
      id: req.student,
    },
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
    }: StudentSignUpRequestBody = StudentRegisterSchema.parse(req.body);
    let studentEnrollmentNumber = parseInt(enrollmentNumber);
    // const existingStudent = await Students.findOne({ email });
    const existingStudent = await prisma.student.findUnique({
      where: {
        email,
      },
    });
    if (existingStudent) {
      res.status(403).json({ message: "Student already exists" });
    } else {
      // console.log("reacher here");

      // const collegeDetails = {
      //   enrollmentNumber: studentEnrollmentNumber,
      //   collegeId,
      //   courseEnrolled,
      // };
      // const newStudent = new Students({
      //   name,
      //   email,
      //   password,
      //   collegeDetails,
      //   classesJoined: [],
      //   projectsUploaded: [],
      // });
      const newStudent = await prisma.student.create({
        data: {
          name,
          email,
          password,
          enrollmentNumber: studentEnrollmentNumber,
          collegeId,
          coursesEnrolledId: courseEnrolled,
        },
      });

      const token = jwt.sign({ student: newStudent.id }, SECRETFORSTUDENT, {
        expiresIn: "1h",
      });
      res.status(200).json({ message: "Student Created Successfully", token });
    }
  } catch (error) {
    return res.json({ error });
  }
};

export const handleStudentLogin = async (req: Request, res: Response) => {
  try {
    const { email, password }: StudentLoginRequestBody =
      StudentLoginSchema.parse(req.body);
    const student = await prisma.student.findUnique({
      where: {
        email,
        password,
      },
    });
    if (student) {
      const token = jwt.sign({ student: student.id }, SECRETFORSTUDENT, {
        expiresIn: "1h",
      });
      res.status(200).json({ message: "Logged In Successfully", token });
    } else {
      res.status(400).json({ message: "Cannot Find Student" });
    }
  } catch (error) {
    return res.json({ error });
  }
};
export const handleGetClass = async (req: Request, res: Response) => {
  try {
    const { inviteToken }: StudentGetClassRequestBody = getClassSchema.parse(
      req.body
    );
    ///assuming the invite token will always be unique
    const availableClass = await prisma.class.findUnique({
      where: {
        inviteToken: Number(inviteToken),
      },
    });

    if (availableClass) {
      res.json({ message: "class found", availableClass });
    } else {
      res.status(400).json({ message: "No Class Found" });
    }
  } catch (error) {
    return res.json({ error });
  }
};

export const handleJoinClass = async (
  req: RequestWithStudent,
  res: Response
) => {
  try {
    const { inviteToken }: StudentGetClassRequestBody = getClassSchema.parse(
      req.body
    );
    const student = await prisma.student.findUnique({
      where:{
        id:req.student
      }
    });
    // console.log(student);
    if (student) {
      const foundClass = await prisma.class.findUnique({where:{ inviteToken: Number(inviteToken) }});
      // console.log(foundClass);
      if (!foundClass) {
        res.status(400).json({ message: "No Class Found" });
      } else {
        // const updatedClass = await prisma.class.findByIdAndUpdate(
        //   foundClass._id,
        //   { $push: { students: student._id } },
        //   { new: true }
        // );
        const updatedClass = await prisma.class.update({
          where:{
             id:foundClass.id
          },
          data:{
             students:{
                connect:{
                   id:student.id
                }
             }
          }
        });
        // console.log(updatedClass);
        // res.status(200).json({ message: "Class Joined Successfully", updatedClass });
        // const updatedStudent = await Students.findByIdAndUpdate(
        //   student._id,
        //   { $push: { classesJoined: foundClass._id } },
        //   { new: true }
        // );
        const updatedStudent= await prisma.student.update({
          where:{
             id:student.id
          },
          data:{
             classesJoined:{
                connect:{
                   id:foundClass.id
                }
             }
          }
        })
        res.json({ message: "Class Joined Successfully" });
      }
    } else {
      res.status(400).json({ message: "No Student Found" });
    }
  } catch (error) {
    return res.json({ error });
  }
};

//first do file upload then create schema
// export const handleProjectUpload = async (req: Request, res: Response) => {
//   // req.file contains the uploaded file (PDF)
//   // req.body contains other form data (title, description, etc.)
//   const projectData = req.body;
//   const updatedTags = projectData.tags.split(",");
//   projectData.tags = updatedTags;
//   const studentHeader = req.headers.student;
//   const teacherHeader = req.headers.teacher;
//   //@ts-ignore
//   const student = await Students.findById(req.student);

//   if (student) {
//     const project = {
//       ...projectData, //project data contains tags also which is array of strings
//       student: studentHeader,
//       teacher: teacherHeader,
//       isPlagiarized: true,
//       isApproved: false,
//       //@ts-ignore
//       content: req.file.buffer, // Store the file content as a buffer
//     };

//     const newProject = new Projects(project);
//     await newProject.save();
//     const updatedStudent = await Students.findByIdAndUpdate(
//       student._id,
//       { $push: { projectsUploaded: newProject._id } },
//       { new: true }
//     );

//     res.json({ message: "Project Uploaded Successfully" });
//   }
// };
