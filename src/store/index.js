import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth/authSlice'
import studentReducer from './student/studentSlice'
import teacherReducer from './teacher/teacherSlice'
import deanReducer from './dean/deanSlice'
import courseReducer from './course/courseSlice'
import announcementReducer from './announcement/announcementSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    student: studentReducer,
    teacher: teacherReducer,
    dean: deanReducer,
    announcements: announcementReducer,
  },
});