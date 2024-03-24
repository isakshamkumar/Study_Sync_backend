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
exports.handleProjectUpload = exports.handleJoinClass = exports.handleGetClass = exports.handleStudentLogin = exports.handleRegisterStudent = exports.handleGetStudentMetaData = void 0;
const models_1 = require("../models");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const zod_1 = require("zod");
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
const handleGetStudentMetaData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const student = yield models_1.Students.findById(req.student)
        .populate("collegeDetails")
        .populate("classesJoined")
        .populate({
        path: "projectsUploaded",
        select: "-content",
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
        const existingStudent = yield models_1.Students.findOne({ email });
        if (existingStudent) {
            res.status(403).json({ message: "Student already exists" });
        }
        else {
            console.log('reacher here');
            const collegeDetails = {
                enrollmentNumber: studentEnrollmentNumber,
                collegeId,
                courseEnrolled,
            };
            const newStudent = new models_1.Students({
                name,
                email,
                password,
                collegeDetails,
                classesJoined: [],
                projectsUploaded: [],
            });
            yield newStudent.save();
            const token = jsonwebtoken_1.default.sign({ student: newStudent._id }, config_1.SECRETFORSTUDENT, {
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
    const { name, email, password } = req.body;
    const student = yield models_1.Students.findOne({ name, email, password }).populate("collegeDetails.collegeId");
    if (student) {
        const token = jsonwebtoken_1.default.sign({ student: student._id }, config_1.SECRETFORSTUDENT, {
            expiresIn: "1h",
        });
        res.status(200).json({ message: "Logged In Successfully", token });
    }
    else {
        res.status(400).json({ message: "Cannot Find Student" });
    }
});
exports.handleStudentLogin = handleStudentLogin;
const handleGetClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { inviteToken } = req.body;
    ///assuming the invite token will always be unique
    const availableClass = yield models_1.Classes.findOne({ inviteTokens: inviteToken })
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
    }
    else {
        res.status(400).json({ message: "No Class Found" });
    }
});
exports.handleGetClass = handleGetClass;
const handleJoinClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { inviteToken } = req.body;
    const student = yield models_1.Students.findById(req.student);
    // console.log(student);
    if (student) {
        const foundClass = yield models_1.Classes.findOne({ inviteTokens: inviteToken });
        // console.log(foundClass);
        if (!foundClass) {
            res.status(400).json({ message: "No Class Found" });
        }
        else {
            const updatedClass = yield models_1.Classes.findByIdAndUpdate(foundClass._id, { $push: { students: student._id } }, { new: true });
            const updatedStudent = yield models_1.Students.findByIdAndUpdate(student._id, { $push: { classesJoined: foundClass._id } }, { new: true });
            res.json({ message: "Class Joined Successfully" });
        }
    }
    else {
        res.status(400).json({ message: "No Student Found" });
    }
});
exports.handleJoinClass = handleJoinClass;
const handleProjectUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // req.file contains the uploaded file (PDF)
    // req.body contains other form data (title, description, etc.)
    const projectData = req.body;
    const updatedTags = projectData.tags.split(",");
    projectData.tags = updatedTags;
    const studentHeader = req.headers.student;
    const teacherHeader = req.headers.teacher;
    //@ts-ignore
    const student = yield models_1.Students.findById(req.student);
    if (student) {
        const project = Object.assign(Object.assign({}, projectData), { student: studentHeader, teacher: teacherHeader, isPlagiarized: true, isApproved: false, 
            //@ts-ignore
            content: req.file.buffer });
        const newProject = new models_1.Projects(project);
        yield newProject.save();
        const updatedStudent = yield models_1.Students.findByIdAndUpdate(student._id, { $push: { projectsUploaded: newProject._id } }, { new: true });
        res.json({ message: "Project Uploaded Successfully" });
    }
});
exports.handleProjectUpload = handleProjectUpload;
