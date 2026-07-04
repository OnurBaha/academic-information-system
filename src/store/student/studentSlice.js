import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:3001'

// Kayıtlı öğrenci derslerini getir
export const fetchStudentCourses = createAsyncThunk(
  'student/fetchStudentCourses',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/studentCourses`)
      // JSON Server tip eşleşme sorunu nedeniyle JS tarafında süzüyoruz
      return response.data.filter(c => String(c.studentId) === String(studentId))
    } catch (error) {
      return rejectWithValue(error.message || 'Kayıtlı dersler yüklenemedi')
    }
  }
)

// Tüm ders havuzunu getir
export const fetchAllCourses = createAsyncThunk(
  'student/fetchAllCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/courses`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Ders listesi yüklenemedi')
    }
  }
)

// Öğrenci not çizelgesini getir
export const fetchStudentGrades = createAsyncThunk(
  'student/fetchStudentGrades',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/studentGrades`)
      return response.data.filter(g => String(g.studentId) === String(studentId))
    } catch (error) {
      return rejectWithValue(error.message || 'Not çizelgesi yüklenemedi')
    }
  }
)

// Devamsızlık verilerini getir
export const fetchAttendance = createAsyncThunk(
  'student/fetchAttendance',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/attendance`)
      const list = response.data
      const data = list.find(a => String(a.studentId) === String(studentId))
      return data || null
    } catch (error) {
      return rejectWithValue(error.message || 'Devamsızlık verileri yüklenemedi')
    }
  }
)

// Ders takvimini getir
export const fetchUpcomingClasses = createAsyncThunk(
  'student/fetchUpcomingClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/upcomingClasses`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Ders programı yüklenemedi')
    }
  }
)

// Ders videolarını getir
export const fetchLectures = createAsyncThunk(
  'student/fetchLectures',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/lectures`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Ders videoları yüklenemedi')
    }
  }
)

// Belge taleplerini getir
export const fetchDocumentRequests = createAsyncThunk(
  'student/fetchDocumentRequests',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/documentRequests`)
      return response.data.filter(d => String(d.studentId) === String(studentId))
    } catch (error) {
      return rejectWithValue(error.message || 'Belge talepleri yüklenemedi')
    }
  }
)

// Sertifikaları getir
export const fetchCertificates = createAsyncThunk(
  'student/fetchCertificates',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/certificates`)
      return response.data.filter(c => String(c.studentId) === String(studentId))
    } catch (error) {
      return rejectWithValue(error.message || 'Sertifikalar yüklenemedi')
    }
  }
)

// Add a new document request
export const createDocumentRequest = createAsyncThunk(
  'student/createDocumentRequest',
  async ({ studentId, title, description, requestDate }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/documentRequests`, {
        studentId,
        title,
        description,
        requestDate,
        status: 'Hazır'
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Belge talebi oluşturulamadı')
    }
  }
)

// Confirm course registration (Enroll selected courses from cart)
export const enrollCourses = createAsyncThunk(
  'student/enrollCourses',
  async ({ studentId, coursesToEnroll }, { rejectWithValue }) => {
    try {
      // 1. Post each course to studentCourses
      const enrollmentPromises = coursesToEnroll.map(course => {
        // Map course data to studentCourses format
        const code = course.id
        const courseName = course.name.includes(' — ') ? course.name.split(' — ')[1] : course.name
        return axios.post(`${API_URL}/studentCourses`, {
          studentId,
          courseName,
          instructor: course.instructor,
          category: course.category,
          akts: course.akts,
          progress: 0,
          code
        })
      })

      // 2. Update enrolled count in courses database
      const updatePromises = coursesToEnroll.map(course => {
        return axios.patch(`${API_URL}/courses/${course.id}`, {
          enrolled: course.enrolled + 1
        })
      })

      const results = await Promise.all([...enrollmentPromises, ...updatePromises])
      
      // Get the added student courses (first half of results)
      const addedCourses = results.slice(0, coursesToEnroll.length).map(res => res.data)
      return addedCourses
    } catch (error) {
      return rejectWithValue(error.message || 'Ders kaydı tamamlanamadı')
    }
  }
)

// Bildirimleri (duyuruları) getir
export const fetchNotifications = createAsyncThunk(
  'student/fetchNotifications',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/notifications`)
      return response.data.filter(n => String(n.studentId) === String(studentId))
    } catch (error) {
      return rejectWithValue(error.message || 'Bildirimler yüklenemedi')
    }
  }
)

// Bildirimi okundu/okunmadı olarak işaretle
export const toggleNotificationRead = createAsyncThunk(
  'student/toggleNotificationRead',
  async ({ id, read }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/notifications/${id}`, { read })
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Bildirim durumu güncellenemedi')
    }
  }
)

// Yeni bildirim oluştur (Simülasyon için)
export const createNotification = createAsyncThunk(
  'student/createNotification',
  async (notifData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/notifications`, notifData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Bildirim oluşturulamadı')
    }
  }
)

const initialState = {
  studentCourses: [],
  courses: [],
  studentGrades: [],
  attendance: null,
  upcomingClasses: [],
  lectures: [],
  documentRequests: [],
  certificates: [],
  cart: [],
  notifications: [],
  searchQuery: '',
  
  status: {
    studentCourses: 'idle',
    courses: 'idle',
    studentGrades: 'idle',
    attendance: 'idle',
    upcomingClasses: 'idle',
    lectures: 'idle',
    documentRequests: 'idle',
    certificates: 'idle',
    enrollment: 'idle',
    documentRequest: 'idle',
    notifications: 'idle'
  },
  
  errors: {
    studentCourses: null,
    courses: null,
    studentGrades: null,
    attendance: null,
    upcomingClasses: null,
    lectures: null,
    documentRequests: null,
    certificates: null,
    enrollment: null,
    documentRequest: null,
    notifications: null
  }
}

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const course = action.payload
      // Check if already in cart or already enrolled
      const isAlreadyInCart = state.cart.some(item => item.id === course.id)
      const isAlreadyEnrolled = state.studentCourses.some(item => item.code === course.id)
      
      if (!isAlreadyInCart && !isAlreadyEnrolled) {
        state.cart.push(course)
      }
    },
    removeFromCart: (state, action) => {
      const courseId = action.payload
      state.cart = state.cart.filter(item => item.id !== courseId)
    },
    clearCart: (state) => {
      state.cart = []
    },
    clearStudentState: (state) => {
      return initialState
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchStudentCourses
      .addCase(fetchStudentCourses.pending, (state) => {
        state.status.studentCourses = 'loading'
        state.errors.studentCourses = null
      })
      .addCase(fetchStudentCourses.fulfilled, (state, action) => {
        state.status.studentCourses = 'succeeded'
        state.studentCourses = action.payload
      })
      .addCase(fetchStudentCourses.rejected, (state, action) => {
        state.status.studentCourses = 'failed'
        state.errors.studentCourses = action.payload
      })
      
      // fetchAllCourses
      .addCase(fetchAllCourses.pending, (state) => {
        state.status.courses = 'loading'
        state.errors.courses = null
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.status.courses = 'succeeded'
        state.courses = action.payload
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.status.courses = 'failed'
        state.errors.courses = action.payload
      })

      // fetchStudentGrades
      .addCase(fetchStudentGrades.pending, (state) => {
        state.status.studentGrades = 'loading'
        state.errors.studentGrades = null
      })
      .addCase(fetchStudentGrades.fulfilled, (state, action) => {
        state.status.studentGrades = 'succeeded'
        state.studentGrades = action.payload
      })
      .addCase(fetchStudentGrades.rejected, (state, action) => {
        state.status.studentGrades = 'failed'
        state.errors.studentGrades = action.payload
      })

      // fetchAttendance
      .addCase(fetchAttendance.pending, (state) => {
        state.status.attendance = 'loading'
        state.errors.attendance = null
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.status.attendance = 'succeeded'
        state.attendance = action.payload
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.status.attendance = 'failed'
        state.errors.attendance = action.payload
      })

      // fetchUpcomingClasses
      .addCase(fetchUpcomingClasses.pending, (state) => {
        state.status.upcomingClasses = 'loading'
        state.errors.upcomingClasses = null
      })
      .addCase(fetchUpcomingClasses.fulfilled, (state, action) => {
        state.status.upcomingClasses = 'succeeded'
        state.upcomingClasses = action.payload
      })
      .addCase(fetchUpcomingClasses.rejected, (state, action) => {
        state.status.upcomingClasses = 'failed'
        state.errors.upcomingClasses = action.payload
      })

      // fetchLectures
      .addCase(fetchLectures.pending, (state) => {
        state.status.lectures = 'loading'
        state.errors.lectures = null
      })
      .addCase(fetchLectures.fulfilled, (state, action) => {
        state.status.lectures = 'succeeded'
        state.lectures = action.payload
      })
      .addCase(fetchLectures.rejected, (state, action) => {
        state.status.lectures = 'failed'
        state.errors.lectures = action.payload
      })

      // fetchDocumentRequests
      .addCase(fetchDocumentRequests.pending, (state) => {
        state.status.documentRequests = 'loading'
        state.errors.documentRequests = null
      })
      .addCase(fetchDocumentRequests.fulfilled, (state, action) => {
        state.status.documentRequests = 'succeeded'
        state.documentRequests = action.payload
      })
      .addCase(fetchDocumentRequests.rejected, (state, action) => {
        state.status.documentRequests = 'failed'
        state.errors.documentRequests = action.payload
      })

      // fetchCertificates
      .addCase(fetchCertificates.pending, (state) => {
        state.status.certificates = 'loading'
        state.errors.certificates = null
      })
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.status.certificates = 'succeeded'
        state.certificates = action.payload
      })
      .addCase(fetchCertificates.rejected, (state, action) => {
        state.status.certificates = 'failed'
        state.errors.certificates = action.payload
      })

      // createDocumentRequest
      .addCase(createDocumentRequest.pending, (state) => {
        state.status.documentRequest = 'loading'
        state.errors.documentRequest = null
      })
      .addCase(createDocumentRequest.fulfilled, (state, action) => {
        state.status.documentRequest = 'succeeded'
        state.documentRequests.unshift(action.payload) // add to start of list
      })
      .addCase(createDocumentRequest.rejected, (state, action) => {
        state.status.documentRequest = 'failed'
        state.errors.documentRequest = action.payload
      })

      // enrollCourses
      .addCase(enrollCourses.pending, (state) => {
        state.status.enrollment = 'loading'
        state.errors.enrollment = null
      })
      .addCase(enrollCourses.fulfilled, (state, action) => {
        state.status.enrollment = 'succeeded'
        state.studentCourses = [...state.studentCourses, ...action.payload]
        state.cart = [] // clear cart
      })
      .addCase(enrollCourses.rejected, (state, action) => {
        state.status.enrollment = 'failed'
        state.errors.enrollment = action.payload
      })

      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.status.notifications = 'loading'
        state.errors.notifications = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status.notifications = 'succeeded'
        state.notifications = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status.notifications = 'failed'
        state.errors.notifications = action.payload
      })

      // toggleNotificationRead
      .addCase(toggleNotificationRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload.id)
        if (index !== -1) {
          state.notifications[index] = action.payload
        }
      })

      // createNotification (Simülasyon için)
      .addCase(createNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload)
      })
  }
})

export const { addToCart, removeFromCart, clearCart, clearStudentState, setSearchQuery } = studentSlice.actions
export default studentSlice.reducer
