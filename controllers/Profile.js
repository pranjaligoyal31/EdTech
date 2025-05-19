const Profile=require('../models/Profile')
const User=require('../models/User')
const CourseProgress = require('../models/CourseProgress')
const Course = require('../models/Course')


exports.updateProfile=async(req,res)=>{
    try {
    //get data
    const {dateOfBirth='',about='',contactNumber,gender}=req.body
    //get userId
    const id=req.user.id
    //validation
    if(!contactNumber||!gender||!id){
        return res.status(400).json({
            success:false,
            message:'All fields are required',
        })
    }
    //find profile
    const userDetails=await User.findById(id)
    const profileId=userDetails.additionalDetails
    const profileDetails=await Profile.findById(profileId)

    //update profile
    profileDetails.dateOfBirth=dateOfBirth
    profileDetails.about=about
    profileDetails.gender=gender
    profileDetails.contactNumber=contactNumber
    //ab yaha humara object bana pada hai toh hum save method ka use karenge to store the updated entry in the database
    await profileDetails.save();
    //return response
    return res.status(200).json({
            success:true,
            message:'Profile Updated Successfully',
    })
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
//socho: how can we schedule this deletion operation jaise
//agar kisine delete kiya ccount to vo 5 din baad delete hoga
//delete account
exports.deleteAccount=async(req,res)=>{
    try {
        //get id
        const id=req.user.id

        //validation
        const userDetails=await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:'User not found',
            })
        }

        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //delete user

        //socho: unenroll user from all the enrolled courses...how??
        await User.findByIdAndDelete({_id:id})
        //return response
        return res.status(200).json({
            success:true,
            message:'User Deleted Successfully',
    })

    } catch (error) {
            return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

exports.getAllUserDetails= async (req,res)=>{
    try {
        //get id
        const id=req.user.id
        //validation and get user details
        const userDetails=await User.findById(id).populate('additionalDetails').exec()
        //return response
        return res.status(200).json({
            success:true,
            message:'User Data Fetched Successfully',
            data:userDetails,
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id
        let userDetails = await User.findOne({ _id: userId, })
            .populate({
                path: "courses",
                populate: {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                    },
                },
            })
            .exec()

        userDetails = userDetails.toObject()

        var SubsectionLength = 0
        for (var i = 0; i < userDetails.courses.length; i++) {
            let totalDurationInSeconds = 0
            SubsectionLength = 0
            for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
                totalDurationInSeconds += userDetails.courses[i].courseContent[
                    j
                ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)

                userDetails.courses[i].totalDuration = convertSecondsToDuration(totalDurationInSeconds)
                SubsectionLength += userDetails.courses[i].courseContent[j].subSection.length
            }

            let courseProgressCount = await CourseProgress.findOne({
                courseID: userDetails.courses[i]._id,
                userId: userId,
            })

            courseProgressCount = courseProgressCount?.completedVideos.length

            if (SubsectionLength === 0) {
                userDetails.courses[i].progressPercentage = 100
            } else {
                // To make it up to 2 decimal point
                const multiplier = Math.pow(10, 2)
                userDetails.courses[i].progressPercentage =
                    Math.round((courseProgressCount / SubsectionLength) * 100 * multiplier) / multiplier
            }
        }

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
            })
        }

        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
        const profileImage = req.files?.profileImage;
        const userId = req.user.id;

        // validation
        // console.log('profileImage = ', profileImage)

        // upload imga eto cloudinary
        const image = await uploadImageToCloudinary(profileImage,
            process.env.FOLDER_NAME, 1000, 1000);

        // console.log('image url - ', image);

        // update in DB 
        const updatedUserDetails = await User.findByIdAndUpdate(userId,
            { image: image.secure_url },
            { new: true }
        )
            .populate({
                path: 'additionalDetails'

            })

        // success response
        res.status(200).json({
            success: true,
            message: `Image Updated successfully`,
            data: updatedUserDetails,
        })
    }
    catch (error) {
        console.log('Error while updating user profile image');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while updating user profile image',
        })
    }
}

