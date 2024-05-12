
import express from "express";
import { authorizeRoles, isAuthneticated } from "../middleware/auth";
import { createOrder, getAllOrder } from "../controllers/order.controller";
const orderRouter=express.Router();

orderRouter.post("/create-order",isAuthneticated,createOrder);

orderRouter.get("/get-orders",isAuthneticated,authorizeRoles("admin"),getAllOrder);

export default orderRouter;