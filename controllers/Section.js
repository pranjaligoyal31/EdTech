const Section=require('../models/Section')
const Course=require('../models/Course')
exports.createSection=async(req,res)=>{
    try {
        //data fetch
        const {sectionName,courseId}=req.body;
        //data validation
        if(!sectionName||!courseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            })
        }
        //create section
        const newSection=await Section.create({sectionName});
        //update course with section objectId
        const updatedCourseDetails=await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                },
            },
            {new:true},
        )
        //use populate to replace sections/sub-sections both in updatedCourseDetails

        //return response
        return res.status(200).json({
                success:true,
                message:'Section created successfully',
                data:updatedCourseDetails,
        })

    } catch (error) {
        return res.status(500).json({
                success:false,
                message:'Unable to create section',
                error:error.message,
            })
    }
}

exports.updateSection=async (req,res)=>{
    try {
        //data input
        const {sectionName,sectionId}=req.body;

        //data validation
        if(!sectionName||!courseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            })
        }

        //update data
        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true})
        //return response
        return res.status(200).json({
                success:true,
                message:'Section updated successfully',
        })

    } catch (error) {
        return res.status(500).json({
                success:false,
                message:'Unable to create section',
                error:error.message,
        })
    }
}

exports.deleteSection=async (req,res)=>{
    try {
        //get ID - assuming that we are sending ID in params
        const {sectionId} = req.params;
        //use findByIDAndDelete
        await Section.findByIdAndDelete(sectionId);
        //question: do we need to delete the entry from courseSchema 
        //return response
        return res.status(200).json({
                success:true,
                message:'Deleted the section successfully',
                error:error.message,
        })

    } catch (error) {
        return res.status(500).json({
                success:false,
                message:'Unable to delete section',
                error:error.message,
        })
    }
}