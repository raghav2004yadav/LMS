import express from "express";
import { authorizeRoles,isAuthneticated } from "../middleware/auth";
import { getNotifications, updateNotification } from "../controllers/notification.controller";
const notificationRoute=express.Router();


notificationRoute.get("/get-all-notifications",isAuthneticated,authorizeRoles("admin"),getNotifications);

//update notifications
notificationRoute.put("/update-notifications/:id",isAuthneticated,authorizeRoles("admin"),updateNotification);


export default notificationRoute;