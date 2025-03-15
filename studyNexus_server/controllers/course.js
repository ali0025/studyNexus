const Course = require("../models/Course");
const Category = require("../models/category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")

// createcourse handler function
exports.createCourse = async (req, res) => {
    try {
        // data fetch
        const { courseName, status,tag:_tag,instructions: _instructions ,courseDescription, whatYouWillLearn, price, category } = req.body;
        // get thumbnail
        const thumbnail = req.files.thumbnail;
    //     // Convert the tag and instructions from stringified Array to Array
    const tag = JSON.parse(_tag)
    const instructions = JSON.parse(_instructions)

    // console.log("tag", tag)
    // console.log("instructions", instructions)

        // fetch file
        // validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "All feilds are required"
            })
        }
        // instructor validation
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("instructorDetails ", instructorDetails);
        if (!status || status === undefined) {
          status = "Draft"
        }
        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "instructor details not found"
            })
        }
        // category validation
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "category details not found"
            })
        }
        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // CREATE AN ENTRY FOR NEW COURSE
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
        });

        // add the new course to user Schema of instructor
        await User.findByIdAndUpdate(instructorDetails._id, { $push: { courses: newCourse._id } }, { new: true });

        // update the category schema
        const cat=await Category.findByIdAndUpdate(category, {
            $push: {
                courses: newCourse._id
            }
        }, { new: true });
        console.log("category updated response",cat);

        const populatedCourse = await Course.findById(newCourse).populate("instructor");

        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            populatedCourse: populatedCourse,
            data:newCourse
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "failed to create course",
            error: error.message,
            
        })
    }
}


// show all courses
exports.getAllCourses = async (res, req) => {
    try {
        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            courseDescription: true,
            instructor: true,
            ratingReviews: true,
            studentEnroll: true
        }).populate("instructor").exec();
        return res.status(200).json({
            success: true,
            message: "data for all courses fetched successfully",
            data: allCourses
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "failed to show all courses",
            error: error.message
        })
    }
}


// getcoursedetails
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        // populate: {
        //   path: "additionalDetails",
        // },
      })
      .populate("category")
      // .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "SubSection",
          select: "-videoUrl",
        },
      })
      .exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.SubSection.forEach((SubSection) => {
        const timeDurationInSeconds = parseInt(SubSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data:"tjis"
    })
  }
}

// Edit Course Details
exports.editCourse = async (req, res) => {
    try {
      
      const { courseId } = req.body
      const updates = req.body
      const course = await Course.findById(courseId)
  
      if (!course) {
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        
        const thumbnail = req.files.thumbnailImage
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          process.env.FOLDER_NAME
        )
        course.thumbnail = thumbnailImage.secure_url
      }
  
      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          if (key === "tag" || key === "instructions") {
            course[key] = JSON.parse(updates[key])
          } else {
            course[key] = updates[key]
          }
        }
      }
  
      await course.save()
  
      const updatedCourse = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          // populate: {
          //   path: "additionalDetails",
          // },
        })
        .populate("category")
        // .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "SubSection",
          },
        })
        .exec()
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }


  exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const userId = req.user.id
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          // populate: {
          //   path: "additionalDetails",
          // },
        })
        .populate("category")
        // .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "SubSection",
          },
        })
        .exec()
        // console.log("courseid",courseId,"userid",userId)
      let courseProgressCount = await CourseProgress.findOne({
        courseId: courseId,
        userId: userId,
      })
  
      console.log("courseProgressCount : ", courseProgressCount)
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.SubSection.forEach((SubSection) => {
          const timeDurationInSeconds = parseInt(SubSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }


// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 })
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
  }
  // Delete the Course
  exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
  
      // Find the course
      const course = await Course.findById(courseId)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
  
      // Unenroll students from the course
      const studentsEnrolled = course.studentEnroll
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
  
      // Delete sections and sub-sections
      const courseSections = course.courseContent
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId)
        if (section) {
          const subSections = section.SubSection
          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId)
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId)
      }
  
      // Delete the course
      await Course.findByIdAndDelete(courseId)
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
  }
  