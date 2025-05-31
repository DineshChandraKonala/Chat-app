import express from "express";
import { ProtectRoute } from "../middleware/auth.js";
import { signUp,login,isAuthenticated,updateProfile } from "../controllers/userController.js";
const userRouter = express.Router();

userRouter.post("/signup",signUp);
userRouter.post("/login",login);
userRouter.put("/update-profile",ProtectRoute,updateProfile);
userRouter.get("/check",ProtectRoute,isAuthenticated);

export default userRouter;