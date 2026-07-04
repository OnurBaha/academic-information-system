import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth/authSlice'
import studentReducer from './student/studentSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer
  }
})

export default store
