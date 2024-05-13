import express from "express"
import { isAuthneticated,authorizeRoles } from "../middleware/auth";
import { getCoursesAnalytics, getOrderAnalytics, getUsersAnalytics } from "../controllers/analytics.controller";

const analyticsRouter=express.Router();


//get users analytics router ---only for admin

analyticsRouter.get("/get-users-analytics",isAuthneticated,authorizeRoles("admin"),getUsersAnalytics);


//get courses analytics router ---only for admin
analyticsRouter.get("/get-courses-analytics",isAuthneticated,authorizeRoles("admin"),getCoursesAnalytics);

//get Orders analytics router ---only for admin
analyticsRouter.get("/get-orders-analytics",isAuthneticated,authorizeRoles("admin"),getOrderAnalytics);



export default analyticsRouter;



