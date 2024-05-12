import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.services";
import { url } from "inspector";
import CourseModel from "../modals/course.model";
import { redis } from "../utils/redis";
import { json } from "stream/consumers";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import { title } from "process";
import notificationModel from "../modals/notificationModel";
import { getAllUsersService } from "../services/user.service";

//upload course
export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      // call for creating course
      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//edit courses

export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const thumbnail = data.thumbnail;

      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      // to get the course id for edit the specific course
      const courseId = req.params.id;

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        { new: true }
      );

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get single course --without purchings

export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const isCacheExist = await redis.get(courseId);
      if (isCacheExist) {
        const course = JSON.stringify(isCacheExist);

        console.log("redis hitted");
        res.status(200).json({
          succcess: true,
          course,
        });
      } else {
        //select (nothing send our data without purching course)
        const course = await CourseModel.findById(req.params.id).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        await redis.set(courseId, JSON.stringify(course));
        console.log("mongodb hitted");
        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get all course --without purchings

export const getAllCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCacheExist = await redis.get("allCourses");
      if (isCacheExist) {
        const courses = await CourseModel.find().select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );
        //for checking write a console
        // console.log("redis hitted");

        res.status(200).json({
          success: true,
          courses,
        });
      } else {
        const courses = await CourseModel.find().select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        //add to data redis first time
        await redis.set("allCourses", JSON.stringify(courses));

        //checking console for database hitted
        // console.log("monodb hiitted");

        res.status(200).json({
          success: true,
          courses,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get course content --only for valid user

export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //for taking user courselist
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      //for checking course exist or not

      const courseExists = userCourseList?.find(
        (course: any) => course._id.toString() === courseId
      );
      if (!courseExists) {
        return next(
          new ErrorHandler("You are not eligible to access this course", 400)
        );
      }
      const course = await CourseModel.findById(courseId);
      const content = course?.courseData;

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);





//add question in course
interface IAddQuestionData{
  question:string;
  courseId:string;
  contentId:string;
}


export const addQuestion=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
  try{

    const {question,courseId,contentId}:IAddQuestionData=req.body;

    const course=await CourseModel.findById(courseId);

    if(!mongoose.Types.ObjectId.isValid(contentId)){
      return next(new ErrorHandler("Invalid content id ",400));
    }

    const courseContent=course?.courseData?.find((item:any)=>item._id.equals(contentId));



    if(!courseContent){
      return next(new ErrorHandler("Invalid content id ",400));
    }


    //create a new question objecct 
    const newQuestion:any={
      user:req.user,
      question,
      questionReplies:[],
    };


    //add this question to our course content 

    courseContent.questions.push(newQuestion);



    //when user is asking questions create a notification admin dashboard

    await notificationModel.create({
      user: req.user?._id,
      title: "New Question Received",
      message: `You have a new Question in  ${courseContent.title}`,
  });


    //save the update course
    await course?.save();

    res.status(200).json({
      success:true,
      course,
    });

  }
  catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }


})



//add answer in course question
interface IAddAnswerData{
  answer:string;
  courseId:string;
  contentId:string;
  questionId:string;

}


export const addAnswer=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
  try{

    const {answer,courseId,contentId,questionId }:IAddAnswerData =req.body;

    //find the couress in database using course id
    const course=await CourseModel.findById(courseId);
    
    if(!mongoose.Types.ObjectId.isValid(contentId)){
      return next(new ErrorHandler("Invalid content id ",400));
    }

    const courseContent=course?.courseData?.find((item:any)=>item._id.equals(contentId));



    if(!courseContent){
      return next(new ErrorHandler("Invalid content id ",400));
    }

    const question=courseContent?.questions?.find((item:any)=>item._id.equals(questionId));

    if(!question){
      return next(new ErrorHandler("Invalid question id ",400));
    }

    //create a new answer object
    const newAnswer:any={
      user:req.user,
      answer,
    };

    //add this answer to our course content 
    question.questionReplies?.push(newAnswer);

    await course?.save();
    //user ask a question and don't write a answer whose those question ask this purpose for checking condition 
    if(req.user?._id===question.user._id){
      //create a notification

      await notificationModel.create({
        user: req.user?._id,
        title: "New Question Reply Received",
        message: `You have a new Question Reply in  ${courseContent.title}`,
    });
    }
    else{
      const data={
        name:question.user.name,
        title:courseContent.title,
      }
      const html=await ejs.renderFile(path.join(__dirname,"../mails/question-reply.ejs"),data);

      try{
        await sendMail({
          email:question.user.email,
          subject:"Question Reply",
          template:"question-reply.ejs",
          data,
        });
      }catch(error:any){
        return next(new ErrorHandler(error.message,500));
      }

      
    }
    res.status(200).json({
      success:true,
      course,
    });

  }
  catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }

});


//add reveiw in course 

interface IAddReviewData{
  review:string;
  courseId:string;
  rating:string;
  userId:string;
}



export const addReview=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
  try{
    const userCourseList=req.user?.courses;

    const courseId=req.params.id;

    //check if courseId already exists in userCourseList based on  _id
    const courseExists=userCourseList?.some((course:any)=>course._id.toString()===courseId.toString());

    if(!courseExists){
      return next(new ErrorHandler("You are not eligible to access this course ",400));
    }

    const course=await CourseModel.findById(courseId);
    const {review,rating}=req.body as IAddReviewData;

    const reviewData:any={
      user:req.user,
      rating,
      comment:review,
    }

    course?.reviews.push(reviewData);
    let avg=0;
    course?.reviews.forEach((rev:any)=>{
      avg+=rev.rating;
    });

    if(course){
      //one example we have w reviews one is 5 another one is 4 so math working like this 9/2=4.5 ratings
      course.ratings=avg/course.reviews.length;
    }

    await course?.save();


    //create notification 
    const notification={
      title:"New Review Received",
      message:`${req.user?.name} has given a review in ${course?.name}`,
    };

    res.status(200).json({
      success:true,
      course,

    });
  }
  catch(error:any){
    return next(new ErrorHandler(error.message,500));
  }
})



//add reply in review

interface IAddReviewData{
  comment:string;
  courseId:string;
  reviewId:string;

}
export const addReplyToReview=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
try{
  const {comment,courseId,reviewId}=req.body as IAddReviewData;
  const course=await CourseModel.findById(courseId);
  if(!course){
    return next(new ErrorHandler("Course not found ",400));

  }
  const review=course?.reviews?.find((rev:any)=>rev.id.toString()===reviewId);
  if(!review){
    return next(new ErrorHandler("Review not found",404));

  }

  const replyData:any={
    user:req.user,
    comment,
  };

  if(!review.commentReplies){
    review.commentReplies=[];

  }

  review.commentReplies?.push(replyData);

  await course?.save();
  res.status(200).json({
    success:true,
    course,
  });
}catch(error:any){
  return next(new ErrorHandler(error.message,500));
}
})



//get all courses --only for admin

export const getAllUsers=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
  try{
    getAllCoursesService(res);

    
  }
  catch(error:any){
    return next(new ErrorHandler(error.message,400));
  }
});

