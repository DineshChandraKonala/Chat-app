import mongoose, { mongo } from "mongoose";

//FUNCTION TO CONNECT MONGOOSE
export const connectDB = async()=>{
    try{
        mongoose.connection.on('connected',()=>console.log("Database connected"));
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
    }catch(err){
        console.log(err);
    }
}