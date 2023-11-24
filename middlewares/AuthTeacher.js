const jwt = require('jsonwebtoken');
const { SECRETFORTEACHER } = require('../config');
const authenticateJwtTeacher = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const tokenforteacher = authHeader.split(' ')[1];
        jwt.verify(tokenforteacher, SECRETFORTEACHER, (err, teacher) => {
            if (err) {
                console.log("error")
                return res.sendStatus(403);
            }
            console.log(teacher)
            req.teacher = teacher.teacher;
            console.log("next")
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports=authenticateJwtTeacher