import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:3001'

// Öğrenci girişi thunk
export const loginStudent = createAsyncThunk(
  'auth/loginStudent',
  async ({ ogrenciNo, password }, { rejectWithValue }) => {
    try {
      // JSON Server tip eşleşme sorunu yaşamamak için tümünü çekip JS ile filtreliyoruz
      const response = await axios.get(`${API_URL}/students`)
      const students = response.data
      const student = students.find(s => s.ogrenciNo === ogrenciNo)
      
      if (!student) {
        return rejectWithValue('Öğrenci numarası veya şifre hatalı')
      }
      
      if (student.password !== password) {
        return rejectWithValue('Öğrenci numarası veya şifre hatalı')
      }
      
      // Oturumu localStorage'da sakla
      localStorage.setItem('auth_user', JSON.stringify(student))
      return student
    } catch (error) {
      return rejectWithValue(error.message || 'Bir hata oluştu')
    }
  }
)

// Demo öğrenci girişi thunk (Ahmet Yılmaz)
export const loginDemoStudent = createAsyncThunk(
  'auth/loginDemoStudent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/students/1`)
      const student = response.data
      
      localStorage.setItem('auth_user', JSON.stringify(student))
      return student
    } catch (error) {
      return rejectWithValue(error.message || 'Demo girişi başarısız oldu')
    }
  }
)

// localStorage kontrolü
const storedUser = localStorage.getItem('auth_user')
const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedUser,
  status: 'idle',
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.status = 'idle'
      state.error = null
      localStorage.removeItem('auth_user')
    }
  },
  extraReducers: (builder) => {
    builder
      // loginStudent
      .addCase(loginStudent.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginStudent.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(loginStudent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // loginDemoStudent
      .addCase(loginDemoStudent.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginDemoStudent.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(loginDemoStudent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
