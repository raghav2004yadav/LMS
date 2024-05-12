import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import OrderModel from "../modals/orderModel";

//create new order
export const newOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const order = await OrderModel.create(req.body);
    res.status(201).json({
        success: true,
        order
    });
});




//get all order

export const getAllOrderService=async(res:Response)=>{
    const orders=await OrderModel.find().sort({createdAt:-1});
  
    res.status(201).json({
      success:true,
      orders,
    });
  };