   import { Request, Response } from 'express';
   import { SECRETFORTEACHER } from '../config';
   import { Classes, Teachers } from '../models';
   import jwt from 'jsonwebtoken';

   import { z } from "zod"

   const TeacherRegisterSchema= z.object({
       name: z
        .string()
        .min(2, { message: "Name must be Atleast 2 letters long" })
        .max(20, { message: "Name must be at maximum 20 letters long" }),
        password: z
    .string()
    .min(3, { message: "Password Must be Minumum of 3 letters " })
    .max(20, { message: "Password Must be Maximum of 20 letters " }),
    email: z.string(),
    college:z.string(),
    contactNumber: z.string(),
    dept:z.string()
   })
   type TeacherSignupRequestBody= z.infer<typeof TeacherRegisterSchema>
   // export interface SignupRequestBody {
   //    name: string;
   //    password: string;
   //    college: string;
   //    email: string;
   //    dept: string;
   //    contactNumber: string;
   // }
   const TeacherLoginSchema= z.object({
      email: z.string(),
      password: z
    .string()
    .min(3, { message: "Password Must be Minumum of 3 letters " })
    .max(20, { message: "Password Must be Maximum of 20 letters " })
   })

   type TeacherLoginRequestBody=z.infer<typeof TeacherLoginSchema>
const TeacherCreateClassSchema= z.object({
   nameOfClass:z.string()
})
type TeacherCreateClassRequestBody=z.infer<typeof TeacherCreateClassSchema>
   export const handleTeacherSignup = async (req: Request, res: Response) => {
      try {
         const {
            name,
            password,
            college,
            email,
            dept,
            contactNumber,
         }: TeacherSignupRequestBody = TeacherRegisterSchema.parse(req.body);
   
         try {
            // Use bcrypt
            const teacher = await Teachers.findOne({ email });
            if (teacher) {
                  return res.status(403).send({ message: "Teacher already exists" });
            } else {
                  const newTeacher = new Teachers({
                     name,
                     password,
                     email,
                     college,
                     dept,
                     contactNumber,
                     classes: [],
                     projectsRecieved: [],
                  });
                  await newTeacher.save();
                  const token = jwt.sign({ teacher: newTeacher._id }, SECRETFORTEACHER, {
                     expiresIn: '1h',
                  });
                  return res.json({ message: 'Teacher created successfully', token });
            }
         } catch (error) {
            console.error('Error:', error);
            return res.status(500).send({ message: 'Internal Server Error' });
         }  
      } catch (error) {
         return res.json({error})
      }
    
   };

   export const handleTeacherLogin=async (req: Request, res: Response) => {
      try {
         const {  password, email }:TeacherLoginRequestBody = TeacherLoginSchema.parse(req.body);
         const teacher = await Teachers.findOne({ name, password, email }).populate("college");
         if (teacher) {
            const token = jwt.sign({ teacher: teacher._id }, SECRETFORTEACHER, { expiresIn: '1h' });
            res.json({ message: "Logged In Successfully", token, college: teacher.college });
         } else {
            res.status(403).json({ message: 'Teacher not found' });
         }
      } catch (error) {
       return res.json({error})  
      }
     
   }
   export const handleTeacherCreateClass=async (req: Request, res: Response) => {
      try {
         const { nameOfClass }:TeacherCreateClassRequestBody = TeacherCreateClassSchema.parse( req.body);
      //@ts-ignore
      const teacher = req.teacher;
      if (!nameOfClass) {
         return res.status(500).send("Please enter the details");
      };
      const inviteTokens = `${Math.round(Math.random() * 100)}`;
      let dateCreated = `${new Date()}`;
      const newClass = new Classes({ nameOfClass, teacher, dateCreated, students: [], inviteTokens });
   
      await newClass.save();
      const updatedTeacher = await Teachers.findByIdAndUpdate(teacher, { $push: { classes: newClass._id } }, { new: true });
      res.status(200).json({ message: "Class Created Successfully", inviteTokens });
      } catch (error) {
         return res.json({error})
      }
      
   }