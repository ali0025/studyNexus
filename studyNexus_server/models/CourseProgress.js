const mongoose=require("mongoose");

const CourseProgress=new mongoose.Schema({
    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
    completedVideos:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubSection"
        }
    ],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
})

module.exports=mongoose.model("CourseProgress",CourseProgress);