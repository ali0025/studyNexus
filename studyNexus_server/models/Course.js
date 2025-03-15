const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    courseDescription: {
        type: String,
    },
    courseName: {
        type: String,
        required: true,
        trim:true,
    },
    title: {
        type: String,
       
    },
    price: {
        type: Number,
        required: true,
    },
    thumbnail: {
        type: String,
        // required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    tag:{
        type:[String],
        
    },
    ratingReviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ratingReview"
    }],
    whatYouWillLearn: {
        type: String
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        }
    ],
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    studentEnroll: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        

    }],
    instructions: {
        type: [String],
      },
    status: {
        type: String,
        enum: ["Draft", "Published"],
      },
})
module.exports = mongoose.model("Course", CourseSchema);