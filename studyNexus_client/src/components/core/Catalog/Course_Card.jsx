import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import RatingStars from "../../Common/RatingStars"
import GetAvgRating from "../../../utils/avgRating"

function Course_Card({ course, Height }) {
  const [avgReviewCount, setAvgReviewCount] = useState(0)

  useEffect(() => {
    const count = GetAvgRating(course.ratingAndReviews)
    setAvgReviewCount(count)
  }, [course])

  return (
    <Link to={`/courses/${course._id}`}>
      <div className="rounded-lg bg-richblack-800 transition-all duration-200 hover:scale-[1.02]">
        {/* Thumbnail */}
        <div className="w-full overflow-hidden rounded-t-lg">
          <img
            src={course?.thumbnail}
            alt="course thumbnail"
            className={`w-full ${Height || "h-[200px]"} object-cover rounded-t-lg`}
          />
        </div>

        {/* Course Details */}
        <div className="flex flex-col gap-2 px-3 py-4">
          <p className="text-lg font-semibold text-richblack-5 line-clamp-2">
            {course?.courseName}
          </p>
          <p className="text-sm text-richblack-50">
            {course?.instructor?.firstName} {course?.instructor?.lastName}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-yellow-5">{avgReviewCount || 0}</span>
            <RatingStars Review_Count={avgReviewCount} />
            <span className="text-richblack-400">
              {course?.ratingAndReviews?.length} Ratings
            </span>
          </div>
          <p className="text-base font-medium text-richblack-5">
            ₹ {course?.price}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default Course_Card
