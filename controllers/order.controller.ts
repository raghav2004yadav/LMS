import { Request,Response,NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel,{IOrder} from "../modals/orderModel";
import userModel from "../modals/user_model";
import CourseModel from "../modals/course.model";
import path from "path";
import ejs, { Template } from "ejs";
import sendMail from "../utils/sendMail";
import notificationModel from "../modals/notificationModel";
import { getAllOrderService, newOrder } from "../services/order.service";


//create order

// export const createOrder=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
//     try{
//         const {courseId,payment_info}=req.body as IOrder;
//         const user= await userModel.findById(req.user?._id);
//         const courseExistInUser=user?.courses.some((course:any)=>course._id.toString()===courseId);
//         if(courseExistInUser){
//             return next(new ErrorHandler("You have already purchased this course",400));
//         }

//         const course=await CourseModel.findById(courseId);

//         if(!course){
//             return next(new ErrorHandler("Course not found",404));
//         }

//         const data:any={
//             courseId:course._id,
//             userId:user?._id,
//             payment_info,
//         };

//         // newOrder(data,res,next);

//         const mailData={
//             order:{
//                 _id:course._id.toString().slice(0,6),
//                 name:course.name,
//                 price:course.price,
//                 date:new Date().toLocaleDateString('en-us',{year:'numeric',month:'long',day:'numeric'}),
//             }
//         }


//         const html=await ejs.renderFile(path.join(__dirname,'../mails/order-confirmation.ejs'),{order:mailData});

//             try{
//                 if(user){
//                     await sendMail({
//                         email:user.email,
//                         subject:"Order Confirmation",
//                         template:"order-confirmation.ejs",
//                         data:mailData,
//                     });
//                 }

//             }catch(error:any){
//                 return next(new ErrorHandler(error.message,500));
//             }

//             user?.courses.push(course?._id);

//             await user?.save();

//             //admin notification hey new order create
//             await notificationModel.create({
//                 user:user?._id,
//                 title:"New Order",
//                 message:`You have a new order from ${course?.name}`,

//             });


//             if(course.purchased){
//                 course.purchased+=1;
//             }

//             await course.save();

//             newOrder(data,res,next);

           

        
//     }catch(error:any){
//         return next(new ErrorHandler(error.message,500));

//     }
// })






//another files
//create order

export const createOrder = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, payment_info } = req.body as IOrder;
        const user = await userModel.findById(req.user?._id);
        const courseExistInUser = user?.courses.some((course: any) => course._id.toString() === courseId);
        if (courseExistInUser) {
            return next(new ErrorHandler("You have already purchased this course", 400));
        }

        const course = await CourseModel.findById(courseId);

        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }

        const data: any = {
            courseId: course._id,
            userId: user?._id, // Add userId to the data
            payment_info,
        };

        // New order creation
        const order = await OrderModel.create(data);

        const mailData = {
            order: {
                _id: order._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' }),
            }
        }

        const html = await ejs.renderFile(path.join(__dirname, '../mails/order-confirmation.ejs'), { order: mailData });

        try {
            if (user) {
                await sendMail({
                    email: user.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData,
                });
            }

        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }

        user?.courses.push(course?._id);

        await user?.save();

        // Admin notification: new order created
        await notificationModel.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new order from ${course?.name}`,
        });

        // Increment purchased count for the course
       course.purchased? course.purchased+=1: course.purchased;

        await course.save();

        res.status(201).json({
            success: true,
            order
        });


        // newOrder(data,res,next);

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));

    }
})


//get all courses --only for admin

export const getAllOrder=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
      getAllOrderService(res);
  
      
    }
    catch(error:any){
      return next(new ErrorHandler(error.message,500));
    }
  });





