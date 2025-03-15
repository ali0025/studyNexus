const mongoose=require("mongoose");
const { mailSender } = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:Number,
        required:true        
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:60*5,
    }
})

// function - to send emails
async function sendVerificationEmail(email,otp)
{
    try {
        const mailResponse=await mailSender(email,"Verfication email from StudyNexus",emailTemplate(otp));
        console.log("Email Sent Sucessfully",mailResponse);        
    } catch (error) {
        console.log("error while sending emails ",email);
        throw error;
    }

}


OTPSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

module.exports=mongoose.model("OTP",OTPSchema);