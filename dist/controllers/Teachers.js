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
exports.handleTeacherCreateClass = exports.handleTeacherLogin = exports.handleTeacherSignup = void 0;
const config_1 = require("../config");
const models_1 = require("../models");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const handleTeacherSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password, college, email, dept, contactNumber, } = req.body;
    try {
        // Use bcrypt
        const teacher = yield models_1.Teachers.findOne({ email });
        if (teacher) {
            return res.status(403).send({ message: "Teacher already exists" });
        }
        else {
            const newTeacher = new models_1.Teachers({
                name,
                password,
                email,
                college,
                dept,
                contactNumber,
                classes: [],
                projectsRecieved: [],
            });
            yield newTeacher.save();
            const token = jsonwebtoken_1.default.sign({ teacher: newTeacher._id }, config_1.SECRETFORTEACHER, {
                expiresIn: '1h',
            });
            return res.json({ message: 'Teacher created successfully', token });
        }
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
});
exports.handleTeacherSignup = handleTeacherSignup;
const handleTeacherLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password, email } = req.body;
    const teacher = yield models_1.Teachers.findOne({ name, password, email }).populate("college");
    if (teacher) {
        const token = jsonwebtoken_1.default.sign({ teacher: teacher._id }, config_1.SECRETFORTEACHER, { expiresIn: '1h' });
        res.json({ message: "Logged In Successfully", token, college: teacher.college });
    }
    else {
        res.status(403).json({ message: 'Teacher not found' });
    }
});
exports.handleTeacherLogin = handleTeacherLogin;
const handleTeacherCreateClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nameOfClass } = req.body;
    //@ts-ignore
    const teacher = req.teacher;
    if (!nameOfClass) {
        return res.status(500).send("Please enter the details");
    }
    ;
    const inviteTokens = `${Math.round(Math.random() * 100)}`;
    let dateCreated = `${new Date()}`;
    const newClass = new models_1.Classes({ nameOfClass, teacher, dateCreated, students: [], inviteTokens });
    yield newClass.save();
    const updatedTeacher = yield models_1.Teachers.findByIdAndUpdate(teacher, { $push: { classes: newClass._id } }, { new: true });
    res.status(200).json({ message: "Class Created Successfully", inviteTokens });
});
exports.handleTeacherCreateClass = handleTeacherCreateClass;
