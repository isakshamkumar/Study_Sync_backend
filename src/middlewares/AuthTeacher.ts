import jwt from 'jsonwebtoken'
import { Request, Response , NextFunction} from 'express';
import { SECRETFORTEACHER } from '../config'
export interface RequestWithTeacher extends Request {
    teacher?: string;
   }
const authenticateJwtTeacher = (req :RequestWithTeacher, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const tokenforteacher = authHeader.split(' ')[1];
        jwt.verify(tokenforteacher, SECRETFORTEACHER, (err:any, teacher:any) => {
            if (err) {
                console.log("error")
                return res.sendStatus(403);
            }
            // console.log(teacher)
            // (req as any).teacher = teacher.teacher;
            req['teacher']=teacher.teacher
            console.log("next")
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

export default authenticateJwtTeacher