require('dotenv').config();
import express from 'express';
export const app=express();
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import exp from 'constants';
import { Request,Response,NextFunction } from 'express';
import {ErrorMiddleware} from './middleware/error';
import userRouter from './routes/user.route';
import courseRouter from './routes/course.route';
import orderRouter from './routes/order.route';
import notificationRoute from './routes/notification.route';
//body parser
app.use(express.json({limit:"500mb"}));


//cookie parser
app.use(cookieParser());

app.set('trust proxy', 1);


// cors == cross origin resource sharing


app.use(cors({
    origin:process.env.ORIGIN
}));


//routes

app.use("/api/vs",userRouter);
app.use("/api/vs",courseRouter);
app.use("/api/vs",orderRouter);
app.use("/api/vs",notificationRoute);
//testing route
app.get("/test",(req: Request ,res: Response ,next: NextFunction)=>{
    res.status(200).json({
        success:true,
        message:"Api is Working",
    });
});


//all route

app.all("*",(req: Request,res: Response,next: NextFunction)=>{
    const err=new Error(`Route ${req.originalUrl}not found`) as any;
    err.statusCode=404;
    next(err);
});



//error handler uses

app.use(ErrorMiddleware);


