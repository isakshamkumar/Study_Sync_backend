"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleJoinClass = exports.handleGetClass = exports.handleStudentLogin = exports.handleRegisterStudent = exports.handleGetStudentMetaData = void 0;
// import { Classes, Projects, Students } from "../models";
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const zod_1 = require("zod");
const Client_1 = __importDefault(require("../prisma/Client"));
const StudentRegisterSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, { message: "Name must be Atleast 2 letters long" })
        .max(20, { message: "Name must be at maximum 20 letters long" }),
    password: zod_1.z
        .string()
        .min(3, { message: "Password Must be Minumum of 3 letters " })
        .max(20, { message: "Password Must be Maximum of 20 letters " }),
    collegeId: zod_1.z.string(),
    enrollmentNumber: zod_1.z.string(),
    email: zod_1.z.string(),
    courseEnrolled: zod_1.z.string(),
});
const StudentLoginSchema = zod_1.z.object({
    email: zod_1.z.string(),
    password: zod_1.z
        .string()
        .min(3, { message: "Password Must be Minumum of 3 letters " })
        .max(20, { message: "Password Must be Maximum of 20 letters " }),
});
//zod schema for handleGet class function
const getClassSchema = zod_1.z.object({
    inviteToken: zod_1.z.string(),
});
const handleGetStudentMetaData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    // const student = await Students.findById(req.student)
    //   .populate("collegeDetails")
    //   .populate("classesJoined")
    //   .populate({
    //     path: "projectsUploaded",
    //     select: "-content",
    //   });
    const student = yield Client_1.default.student.findUnique({
        where: {
            //@ts-ignore
            id: req.student,
        },
    });
    if (student) {
        res.status(200).json(student);
    }
    else {
        res.status(400).json({ message: "student Not Found" });
    }
});
exports.handleGetStudentMetaData = handleGetStudentMetaData;
const handleRegisterStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // collegeId and courseEnrolled will be ids
    try {
        const { name, email, password, enrollmentNumber, collegeId, courseEnrolled, } = StudentRegisterSchema.parse(req.body);
        let studentEnrollmentNumber = parseInt(enrollmentNumber);
        // const existingStudent = await Students.findOne({ email });
        const existingStudent = yield Client_1.default.student.findUnique({
            where: {
                email,
            },
        });
        if (existingStudent) {
            res.status(403).json({ message: "Student already exists" });
        }
        else {
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
            const newStudent = yield Client_1.default.student.create({
                data: {
                    name,
                    email,
                    password,
                    enrollmentNumber: studentEnrollmentNumber,
                    collegeId,
                    coursesEnrolledId: courseEnrolled,
                },
            });
            const token = jsonwebtoken_1.default.sign({ student: newStudent.id }, config_1.SECRETFORSTUDENT, {
                expiresIn: "1h",
            });
            res.status(200).json({ message: "Student Created Successfully", token });
        }
    }
    catch (error) {
        return res.json({ error });
    }
});
exports.handleRegisterStudent = handleRegisterStudent;
const handleStudentLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = StudentLoginSchema.parse(req.body);
        const student = yield Client_1.default.student.findUnique({
            where: {
                email,
                password,
            },
        });
        if (student) {
            const token = jsonwebtoken_1.default.sign({ student: student.id }, config_1.SECRETFORSTUDENT, {
                expiresIn: "1h",
            });
            res.status(200).json({ message: "Logged In Successfully", token });
        }
        else {
            res.status(400).json({ message: "Cannot Find Student" });
        }
    }
    catch (error) {
        return res.json({ error });
    }
});
exports.handleStudentLogin = handleStudentLogin;
const handleGetClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { inviteToken } = getClassSchema.parse(req.body);
        ///assuming the invite token will always be unique
        const availableClass = yield Client_1.default.class.findUnique({
            where: {
                inviteToken: Number(inviteToken),
            },
        });
        if (availableClass) {
            res.json({ message: "class found", availableClass });
        }
        else {
            res.status(400).json({ message: "No Class Found" });
        }
    }
    catch (error) {
        return res.json({ error });
    }
});
exports.handleGetClass = handleGetClass;
const handleJoinClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { inviteToken } = getClassSchema.parse(req.body);
        const student = yield Client_1.default.student.findUnique({
            where: {
                id: req.student
            }
        });
        // console.log(student);
        if (student) {
            const foundClass = yield Client_1.default.class.findUnique({ where: { inviteToken: Number(inviteToken) } });
            // console.log(foundClass);
            if (!foundClass) {
                res.status(400).json({ message: "No Class Found" });
            }
            else {
                // const updatedClass = await prisma.class.findByIdAndUpdate(
                //   foundClass._id,
                //   { $push: { students: student._id } },
                //   { new: true }
                // );
                const updatedClass = yield Client_1.default.class.update({
                    where: {
                        id: foundClass.id
                    },
                    data: {
                        students: {
                            connect: {
                                id: student.id
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
                const updatedStudent = yield Client_1.default.student.update({
                    where: {
                        id: student.id
                    },
                    data: {
                        classesJoined: {
                            connect: {
                                id: foundClass.id
                            }
                        }
                    }
                });
                res.json({ message: "Class Joined Successfully" });
            }
        }
        else {
            res.status(400).json({ message: "No Student Found" });
        }
    }
    catch (error) {
        return res.json({ error });
    }
});
exports.handleJoinClass = handleJoinClass;
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
