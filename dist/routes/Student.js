"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const AuthStudent_1 = __importDefault(require("../middlewares/AuthStudent"));
const Students_1 = require("../controllers/Students");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 15, // for 5MB
    },
}).single("content");
router.get("/me", AuthStudent_1.default, Students_1.handleGetStudentMetaData);
///student signs up
router.post("/signup", Students_1.handleRegisterStudent);
///student signs in
router.post("/login", Students_1.handleStudentLogin);
///student enters invite token and get details of the class
router.post("/getClass", AuthStudent_1.default, Students_1.handleGetClass);
//student joins a class by providing class invitetoken
router.post("/joinClass", AuthStudent_1.default, Students_1.handleJoinClass);
router.post("/projects/upload", AuthStudent_1.default, upload);
exports.default = router;
