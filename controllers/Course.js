const Course=require('../models/Course')
const Category=require('../models/Category')
const SubSection=require('../models/SubSection')
const User=require('../models/User')
const {uploadImageToCloudinary}=require('../utils/imageUploader')
const CourseProgress=require('../models/CourseProgress')

//createCourse handler function
exports.createCourse = async (req, res) => {
    try {
        // extract data
        let { courseName, courseDescription, whatYouWillLearn, price, category, instructions: _instructions, status, tag: _tag } = req.body;

        // Convert the tag and instructions from stringified Array to Array
        const tag = typeof _tag === 'string' ? JSON.parse(_tag) : _tag || [];
        const instructions = typeof _instructions === 'string' ? JSON.parse(_instructions) : _instructions || [];


        console.log("tag = ", tag)
        console.log("instructions = ", instructions)

        // get thumbnail of course
        const thumbnail = req.files?.thumbnailImage;

        // validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price
            || !category || !thumbnail || !instructions.length || !tag.length) {
            return res.status(400).json({
                success: false,
                message: 'All Fileds are required'
            });
        }

        if (!status || status === undefined) {
            status = "Draft";
        }

        // check current user is instructor or not , bcoz only instructor can create 
        // we have insert user id in req.user , (payload , while auth ) 
        const instructorId = req.user.id;


        // check given category is valid or not
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(401).json({
                success: false,
                message: 'Category Details not found'
            })
        }


        // upload thumbnail to cloudinary
        const thumbnailDetails = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // create new course - entry in DB
        const newCourse = await Course.create({
            courseName, courseDescription, instructor: instructorId, whatYouWillLearn, price, category: categoryDetails._id,
            tag, status, instructions, thumbnail: thumbnailDetails.secure_url, createdAt: Date.now(),
        });

        // add course id to instructor courses list, this is bcoz - it will show all created courses by instructor 
        await User.findByIdAndUpdate(instructorId,
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        );


        // Add the new course to the Categories
        await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        );

        // return response
        res.status(200).json({
            success: true,
            data: newCourse,
            message: 'New Course created successfully'
        })
    }

    catch (error) {
        console.log('Error while creating new course');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while creating new course'
        })
    }
}


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
                    model: "SubSection",
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

