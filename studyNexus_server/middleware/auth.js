const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("../models/User");


// auth
// Authenticates users by verifying the JWT token.
// Execution: Runs before protected routes to ensure only authenticated users can access them.
exports.auth=async (req,res,next)=>{
    try {
        // extract token
        const token=req.cookies.token||
                    req.body.token||
                    req.header("Authorization").
                    replace("Bearer ","");

        // if token not present return response
        if(!token)
        {
            return res.status(401).json({
                success:false,
                message:"token is missing"
            })
        }
        // veryfying token
        try {
            const decode= jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user=decode;
        } catch (error) {
            
            return res.status(401).json({
                success:false,
                message:"couldnt is invalid "+error.message
                
            })
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"something went wrong while validating token"
        })
    }
}


// isStudent

exports.isStudent=async (req,res,next)=>{
    try {
        if(req.user.accountType!=="Student")
        {
            return res.status(401).json({
                success:false,
                message:"this is a protected route for Student Only"
            })
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"User cannot be verified, please try again later"
        })
    }
}


// isInstructor
exports.isInstructor=async (req,res,next)=>{
    try {
        if(req.user.accountType!=="Instructor")
        {
            return res.status(401).json({
                success:false,
                message:"this is a protected route for Instructor Only"
            })
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"User cannot be verified, please try again later"
        })
    }
}
// isAdmin
exports.isAdmin=async (req,res,next)=>{
    try {
        if(req.user.accountType!=="Admin")
        {
            return res.status(401).json({
                success:false,
                message:"this is a protected route for Admin Only"
            })
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"User cannot be verified, please try again later"
        })
    }
}