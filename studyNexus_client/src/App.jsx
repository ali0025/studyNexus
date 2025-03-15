import React from 'react'
import { Route,Routes ,useNavigate} from 'react-router-dom'
import Home from "./pages/Home"
import Contact from './pages/Contact'
import "./App.css"
import Aboutus from "./pages/Aboutus"
import Cart from "./components/core/Dashboard/Cart"
import Login from './pages/Login'
import Error from "./pages/Error"
import EditCourse from "./components/core/Dashboard/EditCourse"
import ForgotPassword from "./pages/ForgotPassword"
import ViewCourse from "./pages/ViewCourse"
import VideoDetails from "./components/core/ViewCourse/VideoDetails"
import CourseDetails from "./pages/CourseDetails"
import AddCourse from "./components/core/Dashboard/AddCourse"
import Instructor from "./components/core/Dashboard/Instructor"
import UpdatePassword from "./pages/UpdatePassword"
import Dashboard from "./pages/Dashboard"
import { getUserDetails } from "./services/operations/profileAPI"
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses"
import MyProfile from "./components/core/Dashboard/MyProfile"
import VerifyEmail from "./pages/VerifyEmail"
import Settings from "./components/core/Dashboard/Settings"
import Signup from './pages/Signup'
import MyCourses from "./components/core/Dashboard/MyCourses"
import PrivateRoute from "./components/core/Auth/PrivateRoute"
import OpenRoute from './components/core/Auth/OpenRoute'
import Navbar from './components/Common/Navbar'
import Catalog from "./pages/Catalog"
import { ACCOUNT_TYPE } from "./utils/constants"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.profile)
  useEffect(() => {
    if (localStorage.getItem("token")) {
      const token = JSON.parse(localStorage.getItem("token"))
      dispatch(getUserDetails(token, navigate))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="flex min-h-screen w-screen flex-col bg-richblack-900 font-inter">
      {/* <Navbar/> */}
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/about" element={<Aboutus />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />
        <Route path="catalog/:catalogName" element={<Catalog />} />
        <Route
          path="login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />
        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
                <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />
        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />
        <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />
         {/* Private Route - for Only Logged in User */}
         <Route
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* Route for all users */}
          <Route path="dashboard/my-profile" element={<MyProfile />} />
          <Route path="dashboard/Settings" element={<Settings />} />
          {/* Route only for Instructors */}
          {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
            <>
              <Route path="dashboard/instructor" element={<Instructor />} />
              <Route path="dashboard/my-courses" element={<MyCourses />} />
              <Route path="dashboard/add-course" element={<AddCourse />} />
              <Route
                path="dashboard/edit-course/:courseId"
                element={<EditCourse />}
              />
            </>
          )}
          {/* Route only for Students */}
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="dashboard/enrolled-courses"
                element={<EnrolledCourses />}
              />
              <Route path="/dashboard/cart" element={<Cart />} />
            </>
          )}
          <Route path="dashboard/settings" element={<Settings />} />
        </Route>
         {/* For the watching course lectures */}
         <Route
          element={
            <PrivateRoute>
              <ViewCourse />
            </PrivateRoute>
          }
        >
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                element={<VideoDetails />}
              />
            </>
          )}
        </Route>
{/* 404 Page */}
<Route path="*" element={<Error />} />

      </Routes>
      
     
    </div>
  )
}

export default App
