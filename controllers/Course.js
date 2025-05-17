const Course=require('../models/Course')
const Tag=require('../models/tags')
const User=require('../models/User')
const {uploadImageToCLoudinary}=require('../utils/imageUploader')

//createCourse handler function
exports.createCourse = async (req,res)=>{
    try {
        //fetch data
        const {courseName,courseDescription,whatYouWillLearn,price,tag}=req.body;
        //get thumbnail
        const thumbnail=req.files.thumbnailImage;
        //validation--all fields are mandatory
        if(!courseName||!courseDescription||!whatYouWillLearn||!price||!tag){
            return res.status(400).json({
                success:false,
                message:'All fields are required'
            })
        }
        //check for instructor -- as instructor ki id is required for creating a new course
        const userId=req.user.id; //this is stored in the payload
        //catch here
        const instructorDetails=await User.findById(userId)
        console.log("Instructor details : ",instructorDetails)
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor details not found'
            })
        }
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:'Tag details not found'
            })
        }
        //upload image to cloudinary
        const thumbnailImage=await uploadImageToCLoudinary(thumbnail,process.env.FOLDER_NAME)

        //CREATE an entry for new course
        const newCourse=await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
             //kyuki intsructor ki object id hai
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        })

        //add the new course to userSchema of Instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id
                }
            },
            {new:true},
        )
        //update schema of tag 
        //diy

        //return response
        return res.status(200).json({
            success:true,
            message:"Course created successfully",
            data:newCourse,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'Failed to create course',
            error:error.message,
        })
    }
};


//getAllCourses handler function
exports.showAllCourses=async (req,res)=>{
    try {
        const allCourses = await Course.find({},{courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true,
        }).populate("instructor").exec();
        return res.status(200).json({
            success:true,
            message:'Data from all courses fetched successfully',
            data:allCourses,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'Cannot fetch course data',
            error:error.message,
        })
    }
};

//get Course details
exports.getCourseDetails = async (req, res) => {
    try {
        // get course ID
        const { courseId } = req.body;
        //find course detail
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

            //validation
            if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId}`,
            });
        }
        //return response
        return res.status(200).json({
            success:true,
            message:"Course details fetched successfullt",
            data:courseDetails,
        })
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

