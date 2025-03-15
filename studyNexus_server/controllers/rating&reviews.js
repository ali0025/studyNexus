const RatingAndReview=require("../models/ratingReview");
const Course=require("../models/Course");


exports.createRating=async (req,res)=>
{
    try {
        // get user id
    const userId=req.user.id;
    const{rating,review,courseId}=req.body;
console.log(userId,courseId,review);
    // check if user enrolled or not
    const courseDetails = await Course.findOne({
      _id: courseId,
        studentEnroll: { $elemMatch: { $eq: userId } },
      })
  console.log("coursedetails in rating and review",courseDetails)
    if(!courseDetails)
    {
        return res.status(404).json({
            success:false,
            message:"user not enrolledlksdnmlv in course"
        })
    }
    const alreadyReviewed = await RatingAndReview.findOne({
        user: userId,
        course: courseId,
      })
  
      if (alreadyReviewed) {
        return res.status(403).json({
          success: false,
          message: "Course already reviewed by user",
        })
      }
    // create rating and review
    const ratingReview=await RatingAndReview.create({rating:rating,
        review:review,
        course:courseId,
        user:userId
    })
    // update course with this rating reivew
    const updatedCourse=await Course.findByIdAndUpdate(courseId,{$push:{ratingReviews:ratingReview._id}},{new:true});
    console.log(updatedCourse);
    // return response
    
    return res.status(201).json({
        success: true,
        message: "Rating and review created successfully",
        ratingReview,
      })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message,
        })   
    }
}

// getaveragerating
exports.getAverageRating=async(req,res)=>{
    try {
        // get courseId
        const courseId=req.user.courseId;
        // Calculate the average rating using the MongoDB aggregation pipeline
    const result = await RatingAndReview.aggregate([
        {
          $match: {
            course: new mongoose.Types.ObjectId(courseId), // Convert courseId to ObjectId
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
          },
        },
      ])
  
      if (result.length > 0) {
        return res.status(200).json({
          success: true,
          averageRating: result[0].averageRating,
        })
      }
  
      // If no ratings are found, return 0 as the default rating
      return res.status(200).json({ success: true, averageRating: 0 })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
          success: false,
          message: "Failed to retrieve the rating for the course",
          error: error.message,
        })
    }
}
// Get all rating and reviews
exports.getAllRatingReview = async (req, res) => {
    try {
      const allReviews = await RatingAndReview.find({})
        .sort({ rating: "desc" })
        .populate({
          path: "user",
          select: "firstName lastName email image", // Specify the fields you want to populate from the "Profile" model
        })
        .populate({
          path: "course",
          select: "courseName", //Specify the fields you want to populate from the "Course" model
        })
        .exec()
  
      res.status(200).json({
        success: true,
        data: allReviews,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve the rating and review for the course",
        error: error.message,
      })
    }
  }
  