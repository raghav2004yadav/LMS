// import express from "express";
// import { registrationUser, activationUser, loginUser, logoutUser } from "../controllers/user.controller";
// import { isAuthneticated } from "../middleware/auth";

// const userRouter = express.Router();

// userRouter.post('/registration', registrationUser);
// userRouter.post('/activation-user', activationUser);
// userRouter.post('/login', loginUser);
// userRouter.get('/logout', isAuthneticated, logoutUser);

// export default userRouter;

import express from "express";
import {
  registrationUser,
  activationUser,
  loginUser,
  logoutUser,
  updateAccessToken,
  getUserInfo,
  SocialAuth,
  updateUserInfo,
  updatePassword,
  updateProfilePicture,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/user.controller";

import { authorizeRoles, isAuthneticated } from "../middleware/auth"; // Fixed typo here
import { updateUserRoleService } from "../services/user.service";

const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activationUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthneticated, logoutUser); // Use isAuthenticated middleware before logoutUser  authorizeRoles('admin')

userRouter.get("/refresh", updateAccessToken);

userRouter.get("/me", isAuthneticated, getUserInfo);

// social auth

userRouter.post("/socialauth", SocialAuth);

//update user info

userRouter.put("/update-user-info", isAuthneticated,updateUserInfo);

//update password 

userRouter.put("/update-user-password", isAuthneticated,updatePassword);

//update user profile picture or avatar 
userRouter.put("/update-user-avatar", isAuthneticated,updateProfilePicture);


userRouter.get("/get-users", isAuthneticated,authorizeRoles("admin"),getAllUsers);




userRouter.put("/update-user", isAuthneticated,authorizeRoles("admin"),updateUserRole);


//delete user routes
userRouter.delete("/delete-user/:id", isAuthneticated,authorizeRoles("admin"),deleteUser);
export default userRouter;
