const mongoose=require("mongoose");

const SectionSchema=new mongoose.Schema({
    sectionName:{
        type:String,
        required:true
    },
    SubSection:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubSection"
        }
    ]
})

module.exports=mongoose.model("Section",SectionSchema);