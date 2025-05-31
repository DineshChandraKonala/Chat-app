import User from "../models/user.js";
import jwt from "jsonwebtoken";

export const ProtectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required. Please login." 
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token format" 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId)
        .select("-password -__v")
        .lean();

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "User no longer exists" 
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false, 
        message: "Token is invalid or expired" 
      });
    }
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};