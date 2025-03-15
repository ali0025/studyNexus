const mongoose=require("mongoose");

const SubSection=new mongoose.Schema({
        title:{
            type:String,
            required:true,
            trim:true,
        },
        timeduration:{
            type:Number,
           
        },
        description:{
           type:String,
           required:true,
           trim:true,
        },
        videoUrl:{
            type:String,
            required:true,           
        }   
})

module.exports=mongoose.model("SubSection",SubSection);