import express from "express";
import {
    addAnswer,
    addQuestion,
  editCourse,
  getAllCourse,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controllers";
import { authorizeRoles, isAuthneticated } from "../middleware/auth";
const courseRouter = express.Router();

courseRouter.post(
  "/create-course",
  isAuthneticated,
  authorizeRoles("admin"),
  uploadCourse
);

courseRouter.put(
  "/edit-course/:id",
  isAuthneticated,
  authorizeRoles("admin"),
  editCourse
);

//get single course without purchings

courseRouter.get("/get-course/:id", isAuthneticated, getSingleCourse);

//get all course without purchings

courseRouter.get("/get-courses", isAuthneticated, getAllCourse);




//get course with purchings 
courseRouter.get("/get-course-content/:id", isAuthneticated,getCourseByUser);

//add question router
courseRouter.put("/add-question", isAuthneticated,addQuestion);


//add answer router
courseRouter.put("/add-answer", isAuthneticated,addAnswer);

export default courseRouter;
