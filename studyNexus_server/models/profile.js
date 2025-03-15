const mongoose=require("mongoose");

const profileSchema=new mongoose.Schema({
    gender:{
        type:String,
       
    },
    dob:{
        type:String,        
        trim:true,
    },
    phone_no:{
        type:Number,
      
    },
    state:{
        type:String,             
    },
   profession:{
        type:String,
        trim:true,
    }
   
})

module.exports=mongoose.model("Profile",profileSchema);