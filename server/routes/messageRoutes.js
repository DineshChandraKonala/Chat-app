import express from "express";
import { ProtectRoute } from "../middleware/auth.js";
import { 
  getUsersForSideBar, 
  getMessages, 
  markMessagesAsSeen, 
  sendMessage 
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", ProtectRoute, getUsersForSideBar);
messageRouter.get("/:id", ProtectRoute, getMessages);
messageRouter.put("/mark/:id", ProtectRoute, markMessagesAsSeen);
messageRouter.post("/send/:id", ProtectRoute, sendMessage);

export default messageRouter;