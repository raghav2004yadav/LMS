import { Request } from "express";
import { IUser } from "../controllers/user.controller";
// import { name } from "ejs";


declare global{
    namespace Express{
        interface Request{
            user?:IUser
        }
    }
}