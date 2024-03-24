"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authenticateJwtStudent = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const tokenforteacher = authHeader.split(' ')[1];
        jsonwebtoken_1.default.verify(tokenforteacher, config_1.SECRETFORSTUDENT, (err, student) => {
            if (err) {
                console.log("error");
                return res.sendStatus(403);
            }
            // console.log(teacher)
            req.student = student.student;
            console.log("next");
            next();
        });
    }
    else {
        res.sendStatus(401);
    }
};
exports.default = authenticateJwtStudent;
