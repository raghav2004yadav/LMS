// import { Request, Response, NextFunction } from "express";
// import { CatchAsyncError } from "./catchAsyncErrors";
// import ErrorHandler from "../utils/ErrorHandler";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { redis } from "../utils/redis";

// //Authneticated user

// export const isAuthneticated = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const access_token = req.cookies.access_token;

//     if (!access_token) {
//       return next(
//         new ErrorHandler("Please login to access this resource", 401)
//       );
//     }

//     const decode = jwt.verify(
//       access_token,
//       process.env.ACCESS_TOKEN as string
//     ) as JwtPayload;

    
//     console.log("Decoded Payload:", decode); 

//      // Verify access token
//     //  const decode = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET as string) as { id: string };
    

//     if (!decode) {
//       return next(new ErrorHandler("access token is not valid  ", 400));
//     }

//     const user = await redis.get(decode.id);
//     if (!user) {
//       return next(new ErrorHandler("user not found", 400));
//     }

//     req.user = JSON.parse(user);
//     next();
//   }
// );



































//safecode

// auth.ts
import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import exp from "constants";

// export const isAuthenticated = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {

//     console.log("Cookies:", req.cookies); // Log cookies
//     const access_token = req.cookies.access_token as string;
//     if (!access_token) {
//       throw new ErrorHandler("Please login to access this resource", 401);
//     }

//     const decode = jwt.verify(
//       access_token,
//       process.env.ACCESS_TOKEN as string
//     ) as JwtPayload;

//     if (!decode) {
//       throw new ErrorHandler("Access token is not valid", 401);
//     }

//     req.user = decode;
//     next();
//   } catch (error) {
//     next(error);
//   }
// };



export const isAuthneticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    const access_token = req.cookies['access_token'] as string ;
    console.log("Cookies:", req.cookies);
    console.log("accesstoken:", access_token);



    // const access_token_cookie = req.headers.cookie?.split(';').find(cookie => cookie.trim().startsWith('access_token='));
    // const access_token = access_token_cookie ? access_token_cookie.split('=')[1] : undefined;
    // console.log("Cookies:", req.headers.cookie);
    // console.log("accesstoken:", access_token);
    // const access_token = req.cookies.access_token as string;

    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 400)
      );
    }

    try {
      const decode = jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN as string
      ) as JwtPayload;

      if (!decode) {
        return next(new ErrorHandler("access token is not valid  ", 400));
      }

      const user = await redis.get(decode.id);
      if (!user) {
        return next(new ErrorHandler("user not found", 400));
      }

      req.user = JSON.parse(user);
      next();
    } catch (error:any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);



// validate user route
export const authorizeRoles= (...roles:string[])=>{
  return(req:Request,res:Response,next:NextFunction)=>{
    if(!roles.includes(req.user?.role || '')){
      return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resource `,403));
    }
    next();
  }
}
