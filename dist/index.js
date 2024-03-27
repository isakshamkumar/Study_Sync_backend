"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const Teacher_1 = __importDefault(require("./routes/Teacher"));
const Student_1 = __importDefault(require("./routes/Student"));
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("./models");
dotenv_1.default.config();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/teacher", Teacher_1.default);
app.use("/student", Student_1.default);
//move zode type to a common folder
// add prisma
//change route logic to prisma
//add features
mongoose_1.default.connection.on('error', err => {
    console.log('MongoDb connection error', err);
});
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.MONGODB_CONNECTION_STRING || '');
        }
        catch (error) {
            console.error('Error connecting to MongoDB', error);
        }
    });
}
connectToDatabase();
const db = mongoose_1.default.connection;
db.on("error", (error) => console.log("MongoDb connection errror ", error));
db.once("open", () => console.log("Connected to database"));
app.get("/allColleges", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let colleges = yield models_1.Colleges.find({});
    // console.log(colleges);
    res.json({ message: "List of all colleges", colleges });
}));
//send all available departments
app.get("/alldepartments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let courses = yield models_1.Courses.find({});
    // console.log(colleges);
    res.json({ message: "List of all courses", courses });
}));
app.get("/allTeachers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let teachers = yield models_1.Teachers.find({});
    // console.log(colleges);
    res.json({ message: "List of all teachers", teachers });
}));
// app.post('/createCollege',async(req,res)=>{
//     const {name,pincode,courses}=req.body;
//add check if college exists
//     const newCollege = new Colleges({ name, pincode, courses });
//     await newCollege.save();
//     res.json({ message: "College Created Successfully",newCollege });
// })
app.get("/portal/seeProject?keyword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.keyword) {
        return res
            .status(400)
            .json({ error: "The 'keyword' parameter is required." });
    }
    if (typeof req.query.keyword !== "string") {
        return res
            .status(400)
            .json({ error: "The 'keyword' parameter must be a string." });
    }
    const keyword = req.query.keyword.toLowerCase();
    const projects = yield models_1.Projects.find({
        $or: [{ tags: { $in: [keyword] } }],
    }).select("-content");
    if (!projects) {
        res.status(404).json("No Projects Found");
    }
    else {
        res.json(projects);
    }
}));
app.listen(3000, () => console.log("Server running on port 3000"));
