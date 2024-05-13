import express from "express";
import { isAuthneticated,authorizeRoles } from "../middleware/auth";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layout.controller";
const layoutRouter=express.Router();


layoutRouter.post("/create-layout",isAuthneticated,authorizeRoles("admin"),createLayout);


layoutRouter.put("/edit-layout",isAuthneticated,authorizeRoles("admin"),editLayout);


layoutRouter.get("/get-layout",getLayoutByType);

export default layoutRouter;