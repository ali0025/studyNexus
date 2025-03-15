const mongoose = require("mongoose");
const otpGenerator = require('otp-generator')
const User = require("../models/User");
const OTP = require("../models/otp");
const profile = require("../models/profile");
const bcrypt = require('bcryptjs');

const jwt = require("jsonwebtoken");

require("dotenv").config();


// sendOTP

exports.sentOTP = async (req, res) => {
    // fetchin email from req body
    try {
        const { email } = req.body;
        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.status(401).json({
                success: false,
                message: "User already registered"
            })
        }
        // generating otp
        var otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        console.log("otp generated is -> ", otpGenerator);
 
        // checking otp unique or not
        let result = await OTP.findOne({ otp: otp });
        console.log("otp generated is -> ", otpGenerator);
        console.log("OTP-> ", otp)
        console.log("Result-> ", result)
       
        
        while (result) {
            var otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
            console.log("generating otp again becoz of uniqueness not found");
        }


        // creating an otp entry
        const otpPayload = { email, otp };
        const otpBody = await OTP.create(otpPayload);
        console.log("otpbody - ", otpBody);

        res.status(200).json({
            success: true,
            message: "otp generated and stored in db successfully",
            otp
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

// SIGNUP

exports.signUp = async (req, res) => {
    try {
        const { firstName, lastName,
            email, password,
            accountType, confirmPassword,otp,additionalDetail,
            contact_no } = req.body;

        // validating
        if (!firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword 
            ) {
            return res.status(403).json({
                success: false,
                message: "all feilds are required this",
                
            })
        }
        // password matching
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "password doent match"
            })
        }
        // checking user already exist
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).json({
                success: false,
                message: "User already registered"
            })
        }

        // find most recent otp stored for user
        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("recent OTP : ", recentOtp);
        if (recentOtp.length === 0) {
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            })
        }
        else if (recentOtp.otp != otp) {
            return res.status(400).json({
                success: false,
                message: "invalid OTP",   
                receivedOtp: otp,
        storedOtp: recentOtp.otp,
        receivedOtpType: typeof otp,
        storedOtpType: typeof recentOtp.otp
                
            })

        }

        // password hashing 
        const hashedpassword =await bcrypt.hash(password, 10);

        // creating entry in db

        const profiledetails = await profile.create({
            gender: null,
            dob: null,
            phone_no: null,
            state: null,
            profession: null
        })

        const user = await User.create({
            firstName, lastName,
            email, password: hashedpassword,
            accountType, additionalDetail,
            contact_no,
            additionalDetail: profiledetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`
        })

        // RETURN RESPONSE
        return res.status(200).json({
            success: true,
            message: "user registered successfully",
            user
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "user cannot be registered ,please try again later",
            
        })

    }



}

// LOGIN

exports.login = async (req, res) => {
    try {
        // get data from req
        const { email, password } = req.body;
        // validation data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "all feilds are required"
            })
        }
        // checking if user already exist
        const existingUser = await User.findOne({ email }).populate("additionalDetail");
        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "User not registered please SignUp"
            })
        }
        
        // generate jwt,after password mathcing
        if (await bcrypt.compare(password, existingUser.password)) {
            const payload = {
                email: existingUser.email,
                id: existingUser._id,
                accountType: existingUser.accountType
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });
            existingUser.token = token;
            existingUser.password = undefined;

            // creating cookie and sending response
            const options = {
                expires: new Date(Date.now() + 3 * 60 * 60 * 24 * 1000),
                httpOnly: true
            }
            res.cookie("token", token, options).status(200).json(
                {
                    success: true,
                    token,
                    existingUser,
                    message: "logged in successfully"
                }
            )

        }
        else {
            return res.status(401).json({
                success: false,
                message: "password is incorrect"
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "unable to login",

        })
    }
}



// CHANGEPASSWORD
exports.changePassword = async (req, res) => {
    // get data from req body
    const { currentPassword, newPassword, confirmPassword } = req.body;
    // validation
    if (!newPassword || !confirmPassword || !currentPassword) {
        return res.status(403).json({
            success: false,
            message: "all feilds are required"
        })
    }
    
    const userDetails = await User.findById(req.user.id);
    const checkpass=await bcrypt.compare(currentPassword,userDetails.password);
    console.log(checkpass);
    if (checkpass && (confirmPassword !== newPassword)) {

        const hashedpassword =await bcrypt.hash(newPassword, 10);
        const user = await User.findOneAndUpdate({ password: hashedpassword });
        console.log("data after changing password ", user);
        return res.status(200).json({
            success: true,
            message: "password changed successfully"
        })
    }
    else {
        return res.status(401).json({
            success: false,
            message: "wrong password or current password not match with confirmPassword"
        })

    }


}


