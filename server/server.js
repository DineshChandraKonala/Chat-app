import express from "express";
import cors from "cors";
import http from "http";
import "dotenv/config";
import { Server } from "socket.io";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

//EXPRESS APP
const app = express();
//CREATE HTTP SERVER
const server = http.createServer(app);

//INITIALIZE SOCKET.io TO SERVER
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//STORE ONLINE USERS
export const userSocketMap = {};

//socket.io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User connected",userId);
    if(userId){
        userSocketMap[userId] = socket.id;
    }
    //emit online users to all connected users
    io.emit("getOnlineUsers",Object.keys(userSocketMap))
    socket.on("disconnect",()=>{
        console.log(" User Disconnected",userId);
        delete userSocketMap[userId]
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

//MIDDLEWARE
app.use(express.json({limit : "4mb"}));
app.use(cors({
  origin: "http://localhost:5173", // or your frontend URL
  credentials: true,
}));

//ROUTES SETUP
app.use("/api/status",(req,res)=> res.send("App is Live"));
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)

//CONNCECT DB
await connectDB();
const Port = process.env.Port || 5000;
server.listen(Port,()=>{
    console.log("App is running on port", Port);
});