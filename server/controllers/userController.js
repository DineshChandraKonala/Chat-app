import { generateToken } from "../lib/utils.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import { ProtectRoute } from "../middleware/auth.js";
import bcrypt from "bcryptjs";

//SIGN UP
export const signUp = async(req,res)=>{
    const{fullName,email,password,bio} = req.body;
    try{
    if(!fullName || !email || !password || !bio){
        return res.json({success : false,message : "Missing Details"});
    }
    const user = await User.findOne({email});
    if(user){
        return res.json({success : false,message : "Email Already exists"})
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    const newUser = await User.create({
        fullName,email,password:hashedPassword,bio
    })
    const token = generateToken(newUser._id);
    res.json({success:true,userData : newUser,token,message : "Account created Successfully!"})
    }catch(err){
        console.log(err.message)
        res.json({success : false ,message : err.message})
    }
}

//CONTROLLER FOR LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing email or password" });
    }

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(userData._id);
    return res.json({ success: true, userData, token, message: "Login Successful!" });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


//IS AUTHENTICATED
export const isAuthenticated = (req,res)=>{
    res.json({success : true ,user : req.user});
}

export const updateProfile = async (req, res) => {
  const { profilePic, bio, fullName } = req.body;

  try {
    const userId = req.user._id; // <-- get user ID from authenticated user

    let updateData = { bio, fullName };

    if (profilePic) {
      // If you want to upload to cloudinary or similar,
      // handle that here, for now just save base64 string or URL
      updateData.profilePic = profilePic; 
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};

