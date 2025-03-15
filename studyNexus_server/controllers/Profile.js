const Profile = require("../models/profile");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress")
const Course=require("../models/Course");
const { convertSecondsToDuration } = require("../utils/secToDuration")
const { uploadImageToCloudinary } = require("../utils/imageUploader")



exports.updateProfile = async (req, res) => {
    try {
        const {gender,dob="",phone_no,state="",profession}=req.body;

        // get userId
        const id=req.user.id;
        

        const userDetails=await User.findById(id);
        const profileId=userDetails.additionalDetail;
        const profileDetails=await Profile.findById(profileId);

        // updateProfile
        console.log("porfowe",profileDetails.dob);
        profileDetails.dob=dob;
        profileDetails.gender=gender;
        profileDetails.phone_no=phone_no;
        profileDetails.state=state;
        profileDetails.profession=profession;
        await profileDetails.save();
        
        // return
        return res.status(200).json({
            success:true,
            message:"profile updated successfully",
            profileDetails
        })
    } catch (error) {
      console.log(error);
        return res.status(500).json({
            success:false,
            message:"profile didnt update ,please try again later",
        })
    }
}

exports.deleteAccount = async (req, res) => {
    try {
      const id = req.user.id
      const user = await User.findById(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }
      // Delete Assosiated Profile with the User
      await Profile.findByIdAndDelete({
        _id: new mongoose.Types.ObjectId(user.additionalDetail),
      })
      for (const courseId of user.courses) {
        await Course.findByIdAndUpdate(
          courseId,
          { $pull: { studentEnroll: id } },
          { new: true }
        )
      }
   
  // Remove the user from all enrolled courses
  const courseProgressList = user.courseProgress; // Array of CourseProgress

  for (const progress of courseProgressList) {
      await Course.findByIdAndUpdate(
          progress.courseId,
          { $pull: { studentEnroll: id } },
          { new: true }
      );
  }
  // Delete all course progress records for the user
  await CourseProgress.deleteMany({ userId: id });

      // Now Delete User
      await User.findByIdAndDelete({ _id: id })
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      })
      await CourseProgress.deleteMany({ userId: id })
    } catch (error) {
      console.log(error)
      res
        .status(500)
        .json({ success: false, message: "User Cannot be deleted successfully" })
    }
  }
  
exports.getAllUserDetails = async (req, res) => {
    try {
      const id = req.user.id
      const userDetails = await User.findById(id)
        .populate("additionalDetail")
        .exec()
      console.log(userDetails)
      res.status(200).json({
        success: true,
        message: "User Data fetched successfully",
        data: userDetails,
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
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
        
      })
    }
  }
  
  
// getEnrolledCourses
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "SubSection",
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
        totalDurationInSeconds += userDetails.courses[i].courseContent[j].SubSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].SubSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseId: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      // console.log("this is course progress length",courseProgressCount);
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
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

// instructorDashboard
exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentEnroll.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}
