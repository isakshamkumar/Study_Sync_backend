import express, {  Router } from 'express';

import authenticateJwtTeacher  from '../middlewares/AuthTeacher'; 
import { handleTeacherCreateClass, handleTeacherSignup } from '../controllers/Teachers';
import { handleStudentLogin } from '../controllers/Students';

const router: Router = express.Router();



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
