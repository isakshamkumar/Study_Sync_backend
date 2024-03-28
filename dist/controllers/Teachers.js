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
const Client_1 = __importDefault(require("../prisma/Client"));
const uuid_1 = require("uuid");
// import { Classes, Teachers } from '../models';
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const TeacherRegisterSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, { message: "Name must be Atleast 2 letters long" })
        .max(20, { message: "Name must be at maximum 20 letters long" }),
    password: zod_1.z
        .string()
        .min(3, { message: "Password Must be Minumum of 3 letters " })
        .max(20, { message: "Password Must be Maximum of 20 letters " }),
    email: zod_1.z.string(),
    college: zod_1.z.string(),
    contactNumber: zod_1.z.string(),
    dept: zod_1.z.string()
});
// export interface SignupRequestBody {
//    name: string;
//    password: string;
//    college: string;
//    email: string;
//    dept: string;
//    contactNumber: string;
// }
const TeacherLoginSchema = zod_1.z.object({
    email: zod_1.z.string(),
    password: zod_1.z
        .string()
        .min(3, { message: "Password Must be Minumum of 3 letters " })
        .max(20, { message: "Password Must be Maximum of 20 letters " })
});
const TeacherCreateClassSchema = zod_1.z.object({
    nameOfClass: zod_1.z.string()
});
const handleTeacherSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, password, college, email, dept, contactNumber, } = TeacherRegisterSchema.parse(req.body);
        try {
            // Use bcrypt
            const teacher = yield (Client_1.default === null || Client_1.default === void 0 ? void 0 : Client_1.default.teacher.findUnique({
                where: {
                    email: email,
                },
            }));
            if (teacher) {
                return res.status(403).send({ message: "Teacher already exists" });
            }
            else {
                const newTeacher = yield (Client_1.default === null || Client_1.default === void 0 ? void 0 : Client_1.default.teacher.create({
                    data: {
                        name,
                        password,
                        email,
                    }
                }));
                const token = jsonwebtoken_1.default.sign({ teacher: newTeacher.id }, config_1.SECRETFORTEACHER, {
                    expiresIn: '1h',
                });
                return res.json({ message: 'Teacher created successfully', token });
            }
        }
        catch (error) {
            console.error('Error:', error);
            return res.status(500).send({ message: 'Internal Server Error' });
        }
    }
    catch (error) {
        return res.json({ error });
    }
});
exports.handleTeacherSignup = handleTeacherSignup;
const handleTeacherLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, email } = TeacherLoginSchema.parse(req.body);
        const teacher = yield Client_1.default.teacher.findUnique({
            where: {
                email,
                password
            }
        });
        if (teacher) {
            const token = jsonwebtoken_1.default.sign({ teacher: teacher.id }, config_1.SECRETFORTEACHER, { expiresIn: '1h' });
            res.json({ message: "Logged In Successfully", token });
        }
        else {
            res.status(403).json({ message: 'Teacher not found' });
        }
    }
    catch (error) {
        return res.json({ error });
    }
});
exports.handleTeacherLogin = handleTeacherLogin;
const handleTeacherCreateClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nameOfClass } = TeacherCreateClassSchema.parse(req.body);
        //@ts-ignore
        const teacherId = req.teacher;
        if (!nameOfClass) {
            return res.status(500).send("Please enter the details");
        }
        ;
        const inviteToken = Number((0, uuid_1.v4)());
        let dateCreated = `${new Date()}`;
        const newClass = yield Client_1.default.class.create({
            data: {
                nameOfClass,
                inviteToken,
                teacher: {
                    connect: {
                        id: teacherId
                    }
                }
            }
        });
        // const updatedTeacher = await Teachers.findByIdAndUpdate(teacherId, { $push: { classes: newClass._id } }, { new: true });
        const updatedTeacher = yield Client_1.default.teacher.update({
            where: {
                id: teacherId
            },
            data: {
                classes: {
                    connect: {
                        id: newClass.id
                    }
                }
            }
        });
        res.status(200).json({ message: "Class Created Successfully", inviteToken });
    }
    catch (error) {
        return res.json({ error });
    }
});
exports.handleTeacherCreateClass = handleTeacherCreateClass;
