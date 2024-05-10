import { NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import OrderModel from "../modals/orderModel";

//create new order

export const newOrder=CatchAsyncError(async(data:any,next:NextFunction)=>{
    const order=await OrderModel.create(data);
    next(order);
});