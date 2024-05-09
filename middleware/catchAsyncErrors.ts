
// import express,{ NextFunction,Request,Response } from "express";


// export const CatchAsyncError= (theFunc:any)=>(req,res,next)=>{
//     Promise.resolve(theFunc(req:Request,res:Response,next:NextFunction)).catch(next);
// };





import { Request, Response, NextFunction } from "express";

// Define the type of the async function that will be passed
type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

// Create a utility function to catch async errors
export const CatchAsyncError = (theFunc: AsyncFunction) => (req: Request, res: Response, next: NextFunction): void => {
    theFunc(req, res, next).catch(next);
};
