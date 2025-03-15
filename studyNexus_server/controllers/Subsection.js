const Section=require("../models/Section");
const SubSection=require("../models/SubSection");
const {uploadImageToCloudinary}=require("../utils/imageUploader");

exports.createSubSection=async(req,res)=>{
    try {
        //   fetching data from body   
        const {title,timeduration="",description,sectionId}=req.body;
        // extract file/video
        console.log("this is going to undefined",req.files);
        const video = req.files.video;
        // validation
        if(!title||!description||!sectionId)
        {
            return res.status(400).json({
                success:true,
                message:"all feilds are require"
            })
        }
        // upload video to cloudinary
        const videoDetails=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        
        // CREATE a sub-SECTION
        const subSectiondetails=await SubSection.create({title:title,
            timeduration:`${uploadDetails.duration}`,
            description:description,
            videoUrl:videoDetails.secure_url,
        })
        // update section with thissub section ObjectId
        const updateSection=await Section.findByIdAndUpdate({_id:sectionId},{$push:{SubSection:subSectiondetails._id}},{new:true}).populate("SubSection")
        // .populate("SubSection").exec();
        // return response
        return res.status(200).json({
            success:true,
            message:"subsection created",
            data:updateSection
        })
    } catch (error) {
        return res.status(404).json({
            success:false,
            message:"error while creating subsection",
            error:error.message
        })
    }
}

//   update subsection
exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId, subSectionId, title, description } = req.body
      console.log("subsection id while updating",subSectionId);
      const SubSection = await SubSection.findById(subSectionId)
  
      if (!SubSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        SubSection.title = title
      }
  
      if (description !== undefined) {
        SubSection.description = description
      }
      if (req.files && req.files.video !== undefined) {
        const video = req.files.video
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        SubSection.videoUrl = uploadDetails.secure_url
        SubSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await SubSection.save()
  
      // find updated section and return it
      const updatedSection = await Section.findById(sectionId).populate(
        "SubSection"
      )
  
      console.log("updated section", updatedSection)
  
      return res.json({
        success: true,
        message: "Section updated successfully",
        data: updatedSection,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
        error:error
      })
    }
  }
  

//   subsection delete
exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body
    console.log(subSectionId);
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          SubSection: subSectionId,
        },
      }
    )
    const SubSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    if (!SubSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" })
    }

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "SubSection"
    )

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
  }
}
