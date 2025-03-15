const mongoose=require("mongoose");

const ratingReviewSchema=new mongoose.Schema({
    rating:{
        type:Number,
        required:true
    },
    review:{
        type:String,        
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        requried:true
    },
    course: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Course",
		index: true,
	},
})

module.exports=mongoose.model("ratingReview",ratingReviewSchema);