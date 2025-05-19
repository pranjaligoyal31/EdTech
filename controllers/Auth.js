const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender=require('../utils/mailSender')
const otpTemplate = require('../mail/emailVerificationTemplate');
const Profile=require('../models/Profile')
require("dotenv").config();



//send otp
// exports.sendOTP = async (req,res) => {
//     try{
//     //fetch email from request ki body
//     const {email} = req.body;

//     //check if user already exists
//     const checkUserPresent = await User.findOne({email});

//     //if user already exists,then return a response
//     if(checkUserPresent) {
//         return res.status(401).json({
//             success:false,
//             message:'User already registered',
//         })
//     }

//     //generate otp
//     var otp = otpGenerator.generate(6, {
//         upperCaseAlphabets:false,
//         lowerCaseAlphabets:false,
//         specialChars:false,
//     });
//     console.log("OTP generated: ", otp);

//     //check unique otp or not
//     let result = await OTP.findOne({otp: otp});
//         while(result) {
//             otp = otpGenerator.generate(6, { 
//                 upperCaseAlphabets:false,
//                 lowerCaseAlphabets:false,
//                 specialChars:false,
//             });
//             result = await OTP.findOne({otp: otp}); 
//         }

//         const otpPayload = {email, otp};

//         const otpBody = await OTP.create(otpPayload);
//         console.log(otpBody);

//         await mailSender(email, "Verification OTP", `Your OTP is: ${otp}`);

//         res.status(200).json({
//             success:true,
//             message:"OTP sent successfully",
//             otp,
//         })
// }
// catch(error){
//     console.log(error);
//     return res.status(500).json({
//         success:false,
//         message:error.message,
//     })

// }


// };

exports.sendOTP = async (req, res) => {
    try {

        // fetch email from re.body 
        const { email } = req.body;

        // check user already exist ?
        const checkUserPresent = await User.findOne({ email }).sort({ createdAt: -1 });;

        // if exist then response
        if (checkUserPresent) {
            console.log('(when otp generate) User alreay registered')
            return res.status(401).json({
                success: false,
                message: 'User is Already Registered'
            })
        }

        // generate Otp
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })
        console.log('Your otp - ', otp);

        const name = email.split('@')[0].split('.').map(part => part.replace(/\d+/g, '')).join(' ');
        console.log(name);

        // send otp in mail
        await mailSender(email, 'OTP Verification Email', otpTemplate(otp, name));

        // create an entry for otp in DB
        const otpBody = await OTP.create({ email, otp });
        // console.log('otpBody - ', otpBody);



        // return response successfully
        res.status(200).json({
            success: true,
            otp,
            message: 'Otp sent successfully'
        });
    }

    catch (error) {
        console.log('Error while generating Otp - ', error);
        res.status(200).json({
            success: false,
            message: 'Error while generating Otp',
            error: error.message
        });
    }
}

//signUp

exports.signUp = async (req, res ) => {

try {

    //data fetch krlo from request ki body
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    } = req.body;
    //validate krlo
    if(!firstName|| !lastName ||!email|| !password ||!confirmPassword || !otp) {
        return res.status(403).json({
            success:false,
            message:"All fields are required" ,
        })
    }
    //2 password(password,confirm password) match krlo
    if(password !== confirmPassword) {
        return res.status(400).json({
            success:false,
            message:'Password and ConfirmPassword Value does not match, please try again',
        });
    }
    //check user already exist or not
    const existingUser = await User.findOne({email});
    if(existingUser) {
        return res.status(400).json({
            success:false,
            message:'User is already registered',
        });
    }

    //find most recent OTP stored for the user
    const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);//cretedaat:-1-->sorting such that newest comes first
    console.log(recentOtp);
    //validate OTP
    if(recentOtp.length == 0) {
        //otp not found
        return res.status(400).json({
            success:false,
            message:'OTP found',
        })
    } else if(otp !== recentOtp[0].otp) {
        //Invalid OTP
        return res.status(400).json({
            success:false,
            message:"Invalid OTP",
        });
    }
    
    //hash passowrd
    const hashedPassword = await bcrypt.hash(password, 10);
    //entry create krlo in DB

    const profileDetails = await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    });


    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType,
        additionalDetails:profileDetails._id,
        image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName} ${lastName}`,
    })

    //return response
    return res.status(200).json({
        success:true,
        message:'User is registered Successfully',
        user,
    });

} catch (error) {
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"User cannot be registered.Please try again",
    })
}
}

//Login

exports.login = async (req,res) => {
    try {
        //get data from req ki body
        const {email, password} = req.body;
        //validation data
        if(!email || !password) {
            return  res.status(403).json({
                success:false,
                message:'All fields are required, please try again',
            });
        }
        //user ko check kro ki exist krta ya nhi krta
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first",
            });
        }
        //generate jwt,after password matching
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET , {
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;

        
        //create cookie and send response
        const options = {
            expires:new Date(Date.now() + 3*24*60*60*1000),//means cookie expires in 3 days
            httpOnly:true,
        }
        res.cookie("token", token, options).status(200).json({
            success:true,
            token,
            user,
            message:'Logged in successfully',
        })
    }
    else {
        return res.status(401).json({
            success:false,
            message:'Password is incorrect',
        });
    }
    }
     catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, please try again',
        });
    }
};

//changepassword
exports.changePassword = async (req,res) => {
    try {
        //get data from req->body
        //get data oldpassword, newpassword, confirm newpassword
        //validation

        //update pwd in DB
        //send mail - password updated
        //return response
    } catch (error) {
        
    }
}