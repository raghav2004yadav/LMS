import { Request,Response,NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { generateLast12MonthsData } from "../utils/analytics.generator";
import userModel from "../modals/user_model";
import CourseModel from "../modals/course.model";
import OrderModel from "../modals/orderModel";

//get users analytics --only for admin

export const getUsersAnalytics=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const users= await generateLast12MonthsData(userModel);
        res.status(200).json({
            success:true,
            users,
        });
    }
    catch(error:any){
        return next(new ErrorHandler(error.message,500));
    }
});


//get Courses analytics --only for admin

export const getCoursesAnalytics=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const courses= await generateLast12MonthsData(CourseModel);
        res.status(200).json({
            success:true,
            courses,
        });
    }
    catch(error:any){
        return next(new ErrorHandler(error.message,500));
    }
});



//get Order analytics --only for admin

export const getOrderAnalytics=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const orders= await generateLast12MonthsData(OrderModel);
        res.status(200).json({
            success:true,
            orders,
        });
    }
    catch(error:any){
        return next(new ErrorHandler(error.message,500));
    }
});