import jwt from 'jsonwebtoken'
import {SECRETFORSTUDENT} from '../config'
import { Request,Response,NextFunction } from 'express';
export interface RequestWithStudent extends Request {
    student?: string;
   }
const authenticateJwtStudent = (req:RequestWithStudent, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const tokenforteacher = authHeader.split(' ')[1];
        jwt.verify(tokenforteacher, SECRETFORSTUDENT, (err:any, student:any) => {
            if (err) {
                console.log("error")
                return res.sendStatus(403);
            }
            // console.log(teacher)
            req.student = student.student;
            console.log("next")
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

export default authenticateJwtStudent