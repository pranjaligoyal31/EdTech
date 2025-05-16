const Profile=require('../models/Profile')
const User=require('../models/User')

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