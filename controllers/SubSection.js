const SubSection=require('../models/SubSection')
const Section=require('../models/Section')
const {uploadImageToCloudinary} = require('../utils/imageUploader')

exports.createSubSection=async (req,res)=>{
    try {
        //fetch data from req body
        const {sectionId,title,timeDuration,description}=req.body

        //extract file/video
        const video=req.files.videoFile;
        //validation
        if(!sectionId||!title||!description||!video){
            return res.status(400).json({
                success:false,
                message:'All fileds are required'
            })
        }
        //upload video to cloudinary
        const uploadDetails=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        //create a subsection
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url
        })
        //update section with this subsection
        const updatedSection=await Section.findByIdAndUpdate({_id:sectionId},{
            $push:{
                subSection:subSectionDetails._id,
            }
        },{new:true})

        //log updated section here after adding populate query
        //return response
        return res.status(200).json({
            success:true,
            message:'Sub section created successfully',
        })
    } catch (error) {
        return res.status(500).json({
            success:true,
            message:'Internal Server Error',
            error:error.message,
        })
    }
}
//make updateSubSection



//make delete subSection