const jwt = require('jsonwebtoken');
const { SECRETFORSTUDENT } = require('../config');
const authenticateJwtStudent = (req, res, next) => {
    // console.log("hello");
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const tokenforstudent = authHeader.split(' ')[1];
        jwt.verify(tokenforstudent, SECRETFORSTUDENT, (err, student) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.student = student.student;//student ki mongodb id 
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports=authenticateJwtStudent