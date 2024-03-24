"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const studentSchema = new mongoose_1.default.Schema({
    name: String,
    email: String,
    password: String,
    collegeDetails: {
        enrollmentNumber: Number,
        collegeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Colleges" },
        courseEnrolled: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Courses" }, //particular course
    },
    classesJoined: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Classes',
        },
    ],
    projectsUploaded: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Projects" }]
}, { timestamps: true });
const Students = mongoose_1.default.model('Students', studentSchema);
exports.default = Students;
