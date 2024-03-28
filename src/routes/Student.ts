import express, {  Router } from "express";
const router: Router = express.Router();
import authenticateJwtStudent, {
} from "../middlewares/AuthStudent";


import { handleGetClass, handleGetStudentMetaData, handleJoinClass, handleRegisterStudent, handleStudentLogin } from "../controllers/Students";

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 15, // for 5MB
  },
}).single("content");

router.get("/me", authenticateJwtStudent,handleGetStudentMetaData );
///student signs up
router.post("/signup", handleRegisterStudent);

///student signs in
router.post("/login", handleStudentLogin);

///student enters invite token and get details of the class
router.post("/getClass", authenticateJwtStudent,handleGetClass );
//student joins a class by providing class invitetoken
router.post(
  "/joinClass",
  authenticateJwtStudent,
 handleJoinClass
);
router.post(
  "/projects/upload",
  authenticateJwtStudent,
  upload,
  
);

export default router;
