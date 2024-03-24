"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const projectSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    teacher: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Teachers',
    },
    student: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Students',
    },
    isPlagiarized: {
        type: Boolean,
    },
    isApproved: {
        type: Boolean,
    },
    tags: [String],
    content: {
        type: Buffer, //binary data-->buffer
    },
}, { timestamps: true });
const Projects = mongoose_1.default.model("Projects", projectSchema);
exports.default = Projects;
