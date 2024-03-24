"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthTeacher_1 = __importDefault(require("../middlewares/AuthTeacher"));
const Teachers_1 = require("../controllers/Teachers");
const Students_1 = require("../controllers/Students");
const router = express_1.default.Router();
// Teacher signup
router.post("/signup", Teachers_1.handleTeacherSignup);
// Teacher signin
router.post("/login", Students_1.handleStudentLogin);
// Teacher create class
router.post("/createclass", AuthTeacher_1.default, Teachers_1.handleTeacherCreateClass);
exports.default = router;
