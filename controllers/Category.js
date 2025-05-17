const Category = require('../models/Category');
//create  handler function
exports.createCategory = async(req,res)=>{
    try {
        //fetch data
        const {name,description}=req.body
        //validation -- both fields must be there
        if(!name||!description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        //create entry in database
        const categoryDetails=await Category.create({
            name:name,
            description:description,
        });
        //console.log(tagDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"Category Created Successfully"
        })
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message: 'Error while creating category',
            error:error.message,
        })
    }
}
//getAllCategories handler function
exports.showAllCategories=async (req,res)=>{
        try {
            const allCategories=await Category.find({},{name:true,description:true});
            res.status(200).json({
                success:true,
                data: allCategories,
                message:"All categories returned successfully",
                
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
            success: false,
            message: 'Error while fetching all allCategories'
        })
        
     }
}

//category page details handler function
exports.getCategoryPageDetails = async (req, res) => {
    try {
        //get category id
        const { categoryId } = req.body;
        //get courses for specific category id
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: "ratingAndReviews",
            })
            .exec()
        //validation
         if (!selectedCategory) {
            // console.log("Category not found.")
            return res.status(404).json({ 
                success: false, 
                message: "Category not found" ,
            });
        }
        ////get courses for different categories
        const differentCategories = await Category.find({
            _id: { $ne: categoryId },
        })
        .populate("courses")
        .exec();

        //get top selling courses



        //return response
         res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
            },
        })
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}