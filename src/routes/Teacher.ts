import express, { Request, Response, Router } from 'express';
import { Teachers, Classes } from '../models'
import jwt from 'jsonwebtoken';
import authenticateJwtTeacher  from '../middlewares/AuthTeacher'; 
import { SECRETFORTEACHER } from '../config';
import { handleTeacherCreateClass, handleTeacherSignup } from '../controllers/Teachers';
import { handleStudentLogin } from '../controllers/Students';

const router: Router = express.Router();

// Define interfaces for request bodies


export interface LoginRequestBody {
 password: string;
 email: string;
}

export interface CreateClassRequestBody {
 nameOfClass: string;
}

// Teacher signup
router.post("/signup",handleTeacherSignup );

// Teacher signin
router.post("/login",handleStudentLogin );

// Teacher create class
router.post("/createclass", authenticateJwtTeacher, handleTeacherCreateClass);


export default router;
