const express=require('express')
const router=express.Router()
const {
    createCourse,
    showAllCourses,
    getCourseDetails,
}=require('../controllers/Course')

//categories controller import
const {
    showAllCategories,
    createCategory,
    getCategoryPageDetails,
}=require('../controllers/Category')

//section controllers import
const {
    createSection,
    updateSection,
    deleteSection,
}=require('../controllers/Section')

//sub-section controllers import 
const{
    createSubSection,
    updateSubSection,
    deleteSubSection,
}=require('../controllers/SubSection')

//rating controllers import
const {
    createRating,
    getAverageRating,
    getAllRating,
    getAllRatingReview, //
}=require('../controllers/RatingAndReview')

const {
  updateCourseProgress
} = require("../controllers/courseProgress");


//importing middlewares
const {auth,isInstructor,isStudent,isAdmin}=require('../middlewares/auth')

//course routes

//courses can only be craeted by instructors
router.post('/createCourse',auth,isInstructor,createCourse)
//add a section to course
router.post('/addSection',auth,isInstructor,createSection)
//update a section 
router.post('/updateSection',auth,isInstructor,updateSection)
//delete a section 
router.post('/deleteSection',auth,isInstructor,deleteSection)
//edit sub-section
router.post('/updateSubSection',auth,isInstructor,updateSubSection)
//delete subsection
router.post('/deleteSubSection',auth,isInstructor,deleteSubSection)
//add a subSection to a section
router.post('/addSubSection',auth,isInstructor,createSubSection)
//get all registered courses
router.get('/getAllCourses',showAllCourses)
//get details for specific courses
router.get('/getCourseDetails',getCourseDetails)

router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", getCategoryPageDetails)



//rating and review
router.post('/createRating',auth,isStudent,createRating)
router.get('/getAverageRating',getAverageRating)
router.get('/getReviews',getAllRatingReview)

module.exports=router
