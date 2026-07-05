import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

// New Thunks used by CourseRegistration, StudentDashboard and Courses
export const fetchStudentCourses = createAsyncThunk(
    'student/fetchStudentCourses',
    async (studentId, { rejectWithValue }) => {
        try {
            return await apiFetch(`/studentCourses?studentId=${studentId}`);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchStudentGrades = createAsyncThunk(
    'student/fetchStudentGrades',
    async (studentId, { rejectWithValue }) => {
        try {
            return await apiFetch(`/studentGrades?studentId=${studentId}`);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAttendance = createAsyncThunk(
    'student/fetchAttendance',
    async (studentId, { rejectWithValue }) => {
        try {
            const data = await apiFetch(`/attendance?studentId=${studentId}`);
            return Array.isArray(data) ? data[0] : data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUpcomingClasses = createAsyncThunk(
    'student/fetchUpcomingClasses',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/upcomingClasses');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Course Registration Thunks
export const fetchAllCourses = createAsyncThunk(
    'student/fetchAllCourses',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/courses');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createNotification = createAsyncThunk(
    'student/createNotification',
    async (notificationPayload, { rejectWithValue }) => {
        try {
            return await apiFetch('/notifications', {
                method: 'POST',
                body: JSON.stringify(notificationPayload)
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchStudentGradesAsync = createAsyncThunk(
    'student/fetchStudentGradesAsync',
    async (studentId, { rejectWithValue }) => {
        try {
            return await apiFetch(`/studentGrades?studentId=${studentId}`);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchStudentDocumentsAsync = createAsyncThunk(
    'student/fetchStudentDocumentsAsync',
    async (studentId, { rejectWithValue }) => {
        try {
            return await apiFetch(`/documents?studentId=${studentId}`);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchStudentDashboardAsync = createAsyncThunk(
    'student/fetchStudentDashboardAsync',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/studentDashboard');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const submitStudentHomeworkAsync = createAsyncThunk(
    'student/submitHomeworkAsync',
    async ({ gradeId, homeworkPayload }, { rejectWithValue }) => {
        try {
            // 1. Update the student's grade record
            const gradeResult = await apiFetch(`/studentGrades/${gradeId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    homeworkStatus: 'submitted',
                    homeworkSubmitTime: new Date().toLocaleString('tr-TR'),
                    homeworkFile: homeworkPayload.fileName,
                    studentComment: homeworkPayload.studentComment,
                    githubLink: homeworkPayload.githubLink,
                }),
            });

            // 2. Create or update the homework review entry so the teacher sees it
            try {
                const reviews = await apiFetch('/homeworkReviews');
                const existing = reviews.find(r => 
                    r.studentId === homeworkPayload.studentId && 
                    r.courseCode === homeworkPayload.courseCode && 
                    r.homeworkId === homeworkPayload.homeworkId
                );

                const reviewData = {
                    studentId: homeworkPayload.studentId,
                    courseCode: homeworkPayload.courseCode,
                    homeworkId: homeworkPayload.homeworkId,
                    name: homeworkPayload.studentName,
                    avatar: homeworkPayload.avatar || (homeworkPayload.studentName ? homeworkPayload.studentName.charAt(0) : 'Ö'),
                    meta: `${homeworkPayload.studentNumber} · ${homeworkPayload.title || 'Ödev'}`,
                    github: homeworkPayload.githubLink,
                    fileName: homeworkPayload.fileName,
                    time: new Date().toLocaleString('tr-TR'),
                    status: 'Bekliyor',
                    grade: '',
                    feedback: ''
                };

                if (existing) {
                    await apiFetch(`/homeworkReviews/${existing.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            github: reviewData.github,
                            fileName: reviewData.fileName,
                            time: reviewData.time,
                            status: 'Bekliyor'
                        })
                    });
                } else {
                    await apiFetch('/homeworkReviews', {
                        method: 'POST',
                        body: JSON.stringify({
                            id: `rev-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
                            ...reviewData
                        })
                    });
                }
            } catch (reviewErr) {
                console.error("Error updating homeworkReviews:", reviewErr);
            }

            return gradeResult;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const requestOfficialDocumentAsync = createAsyncThunk(
    'student/requestOfficialDocumentAsync',
    async (documentPayload, { rejectWithValue }) => {
        try {
            return await apiFetch('/documents', {
                method: 'POST',
                body: JSON.stringify({
                    id: `doc-${Date.now()}`,
                    ...documentPayload,
                    requestDate: new Date().toLocaleDateString('tr-TR'),
                    status: 'pending',
                    verificationCode: `QR-${Math.floor(100000 + Math.random() * 900000)}`
                }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// FAZ 2.4 — Dekan ApprovalCenter'a öğrenci talebi gönder
export const submitStudentRequestAsync = createAsyncThunk(
    'student/submitStudentRequestAsync',
    async (requestPayload, { rejectWithValue }) => {
        try {
            return await apiFetch('/studentRequests', {
                method: 'POST',
                body: JSON.stringify({
                    id: `sr-${Date.now()}`,
                    ...requestPayload,
                    status: 'pending',
                    createdAt: new Date().toLocaleDateString('tr-TR'),
                }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// FAZ 4.1 — Ders Kaydı Yap (studentCourses koleksiyonuna ekle)
export const registerStudentCoursesAsync = createAsyncThunk(
    'student/registerStudentCoursesAsync',
    async ({ studentId, coursesList }, { rejectWithValue }) => {
        try {
            const promises = coursesList.map(course => {
                return apiFetch('/studentCourses', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: `sc-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
                        studentId: studentId,
                        courseName: course.name,
                        instructor: course.instructor || 'Eğitmen Belirtilmemiş',
                        category: course.category || 'Mühendislik',
                        akts: course.akts,
                        progress: 0,
                        code: course.code
                    })
                });
            });
            return await Promise.all(promises);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// FAZ 6.1 — Forum Sorularını Çek
export const fetchForumQuestionsAsync = createAsyncThunk(
    'student/fetchForumQuestionsAsync',
    async (courseCode, { rejectWithValue }) => {
        try {
            return await apiFetch(`/forumQuestions?courseCode=${courseCode}`);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// FAZ 6.2 — Forumda Yeni Soru Sor
export const postForumQuestionAsync = createAsyncThunk(
    'student/postForumQuestionAsync',
    async (questionPayload, { rejectWithValue }) => {
        try {
            return await apiFetch('/forumQuestions', {
                method: 'POST',
                body: JSON.stringify({
                    id: `fq-${Date.now()}`,
                    status: 'unanswered',
                    createdAt: new Date().toLocaleString('tr-TR'),
                    responseTimeHours: null,
                    reportedReason: null,
                    ...questionPayload
                })
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const studentSlice = createSlice({
    name: 'student',
    initialState: {
        studentCourses: [],
        studentGrades: [],
        attendance: null,
        upcomingClasses: [],
        courses: [], // Course registration offered courses
        grades: [],
        documents: [],
        dashboardData: null,
        forumQuestions: [], // FAZ 6.1
        status: {
            studentCourses: 'idle',
            studentGrades: 'idle',
            attendance: 'idle',
            upcomingClasses: 'idle',
            courses: 'idle',
            documents: 'idle',
            forumQuestions: 'idle', // FAZ 6.1
            global: 'idle',
        },
        actionStatus: 'idle',
        error: null,
    },
    reducers: {
        clearStudentState: (state) => {
            state.studentCourses = [];
            state.studentGrades = [];
            state.attendance = null;
            state.upcomingClasses = [];
            state.courses = [];
            state.grades = [];
            state.documents = [];
            state.dashboardData = null;
            state.status = {
                studentCourses: 'idle',
                studentGrades: 'idle',
                attendance: 'idle',
                upcomingClasses: 'idle',
                courses: 'idle',
                documents: 'idle',
                global: 'idle',
            };
            state.actionStatus = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // New Thunk: fetchStudentCourses
            .addCase(fetchStudentCourses.pending, (state) => {
                state.status.studentCourses = 'loading';
                state.error = null;
            })
            .addCase(fetchStudentCourses.fulfilled, (state, action) => {
                state.status.studentCourses = 'succeeded';
                state.studentCourses = action.payload;
            })
            .addCase(fetchStudentCourses.rejected, (state, action) => {
                state.status.studentCourses = 'failed';
                state.error = action.payload;
            })

            // New Thunk: fetchStudentGrades
            .addCase(fetchStudentGrades.pending, (state) => {
                state.status.studentGrades = 'loading';
                state.error = null;
            })
            .addCase(fetchStudentGrades.fulfilled, (state, action) => {
                state.status.studentGrades = 'succeeded';
                state.studentGrades = action.payload;
                state.grades = action.payload;
            })
            .addCase(fetchStudentGrades.rejected, (state, action) => {
                state.status.studentGrades = 'failed';
                state.error = action.payload;
            })

            // New Thunk: fetchAttendance
            .addCase(fetchAttendance.pending, (state) => {
                state.status.attendance = 'loading';
                state.error = null;
            })
            .addCase(fetchAttendance.fulfilled, (state, action) => {
                state.status.attendance = 'succeeded';
                state.attendance = action.payload;
            })
            .addCase(fetchAttendance.rejected, (state, action) => {
                state.status.attendance = 'failed';
                state.error = action.payload;
            })

            // New Thunk: fetchUpcomingClasses
            .addCase(fetchUpcomingClasses.pending, (state) => {
                state.status.upcomingClasses = 'loading';
                state.error = null;
            })
            .addCase(fetchUpcomingClasses.fulfilled, (state, action) => {
                state.status.upcomingClasses = 'succeeded';
                state.upcomingClasses = action.payload;
            })
            .addCase(fetchUpcomingClasses.rejected, (state, action) => {
                state.status.upcomingClasses = 'failed';
                state.error = action.payload;
            })

            // Course Registration: fetchAllCourses
            .addCase(fetchAllCourses.pending, (state) => {
                state.status.courses = 'loading';
                state.error = null;
            })
            .addCase(fetchAllCourses.fulfilled, (state, action) => {
                state.status.courses = 'succeeded';
                state.courses = action.payload;
            })
            .addCase(fetchAllCourses.rejected, (state, action) => {
                state.status.courses = 'failed';
                state.error = action.payload;
            })

            // Old Thunk: fetchStudentGradesAsync
            .addCase(fetchStudentGradesAsync.pending, (state) => {
                state.status.global = 'loading';
                state.error = null;
            })
            .addCase(fetchStudentGradesAsync.fulfilled, (state, action) => {
                state.status.global = 'succeeded';
                state.grades = action.payload;
                state.studentGrades = action.payload;
            })
            .addCase(fetchStudentGradesAsync.rejected, (state, action) => {
                state.status.global = 'failed';
                state.error = action.payload;
            })

            // Old Thunk: fetchStudentDocumentsAsync
            .addCase(fetchStudentDocumentsAsync.pending, (state) => {
                state.status.documents = 'loading';
                state.error = null;
            })
            .addCase(fetchStudentDocumentsAsync.fulfilled, (state, action) => {
                state.status.documents = 'succeeded';
                state.documents = action.payload;
            })
            .addCase(fetchStudentDocumentsAsync.rejected, (state, action) => {
                state.status.documents = 'failed';
                state.error = action.payload;
            })

            // Old Thunk: fetchStudentDashboardAsync
            .addCase(fetchStudentDashboardAsync.pending, (state) => {
                state.status.global = 'loading';
                state.error = null;
            })
            .addCase(fetchStudentDashboardAsync.fulfilled, (state, action) => {
                state.status.global = 'succeeded';
                state.dashboardData = action.payload;
            })
            .addCase(fetchStudentDashboardAsync.rejected, (state, action) => {
                state.status.global = 'failed';
                state.error = action.payload;
            })

            // Submit Homework
            .addCase(submitStudentHomeworkAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(submitStudentHomeworkAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                const index = state.grades.findIndex((g) => g.id === action.payload.id);
                if (index !== -1) {
                    state.grades[index] = action.payload;
                }
                const sIndex = state.studentGrades.findIndex((g) => g.id === action.payload.id);
                if (sIndex !== -1) {
                    state.studentGrades[sIndex] = action.payload;
                }
            })
            .addCase(submitStudentHomeworkAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            })

            // Request Document
            .addCase(requestOfficialDocumentAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(requestOfficialDocumentAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                state.documents.unshift(action.payload);
            })
            .addCase(requestOfficialDocumentAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            })

            // FAZ 2.4 — Submit Student Request (Dekan ApprovalCenter için)
            .addCase(submitStudentRequestAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(submitStudentRequestAsync.fulfilled, (state) => {
                state.actionStatus = 'succeeded';
            })
            .addCase(submitStudentRequestAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            })
            // FAZ 4.1 — Register Student Courses
            .addCase(registerStudentCoursesAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(registerStudentCoursesAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                state.studentCourses = [...state.studentCourses, ...action.payload];
            })
            .addCase(registerStudentCoursesAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            })
            // FAZ 6.1 — Fetch Forum Questions
            .addCase(fetchForumQuestionsAsync.pending, (state) => {
                state.status.forumQuestions = 'loading';
                state.error = null;
            })
            .addCase(fetchForumQuestionsAsync.fulfilled, (state, action) => {
                state.status.forumQuestions = 'succeeded';
                state.forumQuestions = action.payload;
            })
            .addCase(fetchForumQuestionsAsync.rejected, (state, action) => {
                state.status.forumQuestions = 'failed';
                state.error = action.payload;
            })

            // FAZ 6.2 — Post Forum Question
            .addCase(postForumQuestionAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(postForumQuestionAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                state.forumQuestions.unshift(action.payload);
            })
            .addCase(postForumQuestionAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearStudentState } = studentSlice.actions;
export default studentSlice.reducer;