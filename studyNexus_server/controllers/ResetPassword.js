const User = require("../models/User");
const {mailSender} = require("../utils/mailSender");
const bcrypt = require('bcryptjs');

const crypto = require("crypto")


// reset passwordToken
exports.resetPasswordToken = async (req, res) => {
   try {
     // get email from req body
     const { email } = req.body;
     const user = await User.findOne({email});
     if (!user) {
         return res.status(401).json({
             success: false,
             message: "your email is not registered with us"
         })
     }
     // generate token
     const token=crypto.randomUUID();
     const updatedDetails=await User.findOneAndUpdate({email},
                                                      {token:token,resetPasswordExpires:Date.now()+5*60*1000,}
                                                      ,{new:true});
     
     // create url
     const url=`http://localhost:5173/update-password/${token}`
     // send mail containing url
     await mailSender(email,"password Reset Link",
                             `password reset link url : ${url}`);
     // return response
      res.status(200).json({
         success:true,
         message:"email sent successfully,please check and changed password"
     })
   } catch (error) {
    console.log(error);
    return res.status(500).json({
        success:true,
        message:"something went wrong while sending password link"
    })
   }
}

// reset password
exports.resetPassword=async(req,res)=>{
   try {
     // data fetching 
     const {password,confirmPassword,token}=req.body;
     // validation
     if(password!==confirmPassword)
     {
         return res.status(401).json({
             success:true,
             message:"password not matching"
         })        
     }
     // get userdetailfrom db using token
     const userDetails=await User.findOne({token:token})
     // if no entry- invalid token
     if(!userDetails)
     {
         return res.status(400).json({
             success:true,
             message:"token is invalid"
         })
     }
     // token time check
     if(userDetails.resetPasswordExpires<Date.now())
     {
         return res.status(400).json({
             success:false,
             message:"token is expired please regenerate token"
         })
     }
     // hash password
     const hashedpassword=await bcrypt.hash(password,10);
    //  password update
    await User.findOneAndUpdate({token:token},
        {password:hashedpassword},
        {new:true}
    );
    return res.status(200).json
    ({
        success:false,
        message:"password reset successful",

    })
     
   } catch (error) {
    return res.status(401).json(
        {
            success:false,
            message:"erro in resetting password"
        }
    )
   }

}