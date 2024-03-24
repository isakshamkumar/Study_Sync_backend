"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Teachers = exports.Students = exports.Projects = exports.Colleges = exports.Courses = exports.Classes = void 0;
const classesModel_1 = __importDefault(require("./classesModel"));
exports.Classes = classesModel_1.default;
const courseModel_1 = __importDefault(require("./courseModel"));
exports.Courses = courseModel_1.default;
const collegeModel_1 = __importDefault(require("./collegeModel"));
exports.Colleges = collegeModel_1.default;
const projectModel_1 = __importDefault(require("./projectModel"));
exports.Projects = projectModel_1.default;
const studentModel_1 = __importDefault(require("./studentModel"));
exports.Students = studentModel_1.default;
const teacherModel_1 = __importDefault(require("./teacherModel"));
exports.Teachers = teacherModel_1.default;
