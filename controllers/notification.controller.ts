import notificationModel from "../modals/notificationModel";
import { Request,Response,NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import corn, { schedule } from "node-cron"; // schedule the task in node js
//get all notification this is only for admin
export const getNotifications=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
try{
    const Notification=await notificationModel.find().sort({createdAt:-1});
    res.status(201).json({
        success:true,
        Notification,
    });
}

catch(error:any){
    return next(new ErrorHandler(error.message,500));
}
});


//update notification status ---only admin

export const updateNotification=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const Notification=await notificationModel.findById(req.params.id);
        if(!Notification){
            return next(new ErrorHandler("Notifications not found",404));
        }
        else{
            Notification?.status?Notification.status="read":Notification?.status;
        }
        await Notification.save();

        const Notifications=await notificationModel.find().sort({createdAt:-1});
        
        res.status(201).json({
            success:true,
            Notifications,
        });
       
        // course.purchased?courseRouter.purchased+=1:course
    }catch(error:any){

        return next(new ErrorHandler(error.message,500));
    }
});


//delete all notifications after one month this the clear read notification 

corn.schedule("0 0 0 * * *",async()=>{
    const thirtyDaysAgo=new Date(Date.now() -30* 24 * 60 * 60 * 1000);
    await notificationModel.deleteMany({status:"read",createdAt:{$lt:thirtyDaysAgo}});
    console.log('Deleted read notifications');
});