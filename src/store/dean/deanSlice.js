import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const fetchDeanDashboardData = createAsyncThunk(
    'dean/fetchDeanDashboardData',
    async (_, { rejectWithValue }) => {
        try {
            const [
                instructors, bulletins, users, courses, curriculum, 
                deanOverview, studentAnalytics, courseAssignments,
                studentRequests, termStatus, systemLogs, graduationApprovals,
                documents, forumQuestions, liveStreams, schedules, academicEvents,
                faculties, departments
            ] = await Promise.all([
                apiFetch('/facultyWorkloads'),
                apiFetch('/bulletins'),
                apiFetch('/users'),
                apiFetch('/courses'),
                apiFetch('/curriculum'),
                apiFetch('/deanOverview'),
                apiFetch('/studentAnalytics'),
                apiFetch('/courseAssignments'),
                apiFetch('/studentRequests'),
                apiFetch('/termStatus'),
                apiFetch('/systemLogs'),
                apiFetch('/graduationApprovals'),
                apiFetch('/documents'),
                apiFetch('/forumQuestions'),
                apiFetch('/liveStreams'),
                apiFetch('/schedules'),
                apiFetch('/academicEvents'),
                apiFetch('/faculties'),
                apiFetch('/departments')
            ]);
            return { 
                instructors, bulletins, users, courses, curriculum, 
                deanOverview, studentAnalytics, courseAssignments,
                studentRequests, termStatus, systemLogs, graduationApprovals,
                documents, forumQuestions, liveStreams, schedules, academicEvents,
                faculties, departments
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const publishGlobalBulletinAsync = createAsyncThunk(
    'dean/publishGlobalBulletinAsync',
    async (bulletinPayload, { rejectWithValue }) => {
        try {
            return await apiFetch('/bulletins', {
                method: 'POST',
                body: JSON.stringify({
                    id: `bull-${Date.now()}`,
                    date: new Date().toLocaleDateString('tr-TR'),
                    ...bulletinPayload,
                }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateCourseAssignmentStatus = createAsyncThunk(
    'dean/updateCourseAssignmentStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await apiFetch(`/courseAssignments/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateStudentRequestStatus = createAsyncThunk(
    'dean/updateStudentRequestStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await apiFetch(`/studentRequests/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateGraduationApprovalStatus = createAsyncThunk(
    'dean/updateGraduationApprovalStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await apiFetch(`/graduationApprovals/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateTermLocks = createAsyncThunk(
    'dean/updateTermLocks',
    async (locksPayload, { rejectWithValue }) => {
        try {
            return await apiFetch('/termStatus', {
                method: 'PUT',
                body: JSON.stringify(locksPayload),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const writeSystemLog = createAsyncThunk(
    'dean/writeSystemLog',
    async (logPayload, { rejectWithValue }) => {
        try {
            return await apiFetch('/systemLogs', {
                method: 'POST',
                body: JSON.stringify({
                    id: `log-${Date.now()}`,
                    timestamp: new Date().toLocaleString('tr-TR'),
                    ...logPayload,
                }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateUserStatus = createAsyncThunk(
    'dean/updateUserStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await apiFetch(`/users/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateUserTuition = createAsyncThunk(
    'dean/updateUserTuition',
    async ({ id, tuitionPaid }, { rejectWithValue }) => {
        try {
            return await apiFetch(`/users/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ tuitionPaid }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const triggerEmergencyAlert = createAsyncThunk(
    'dean/triggerEmergencyAlert',
    async (alertPayload, { rejectWithValue }) => {
        try {
            return await apiFetch('/termStatus', {
                method: 'PATCH',
                body: JSON.stringify(alertPayload),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createNewSection = createAsyncThunk(
    'dean/createNewSection',
    async (sectionPayload, { rejectWithValue }) => {
        try {
            return await apiFetch('/courses', {
                method: 'POST',
                body: JSON.stringify({
                    id: `c-sec-${Date.now()}`,
                    ...sectionPayload,
                    enrolled: 0,
                    gradesApproved: false
                }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateDocumentStatusAsync = createAsyncThunk(
    'dean/updateDocumentStatusAsync',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await apiFetch(`/documents/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const moderateForumQuestionAsync = createAsyncThunk(
    'dean/moderateForumQuestionAsync',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await apiFetch(`/forumQuestions/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteForumQuestionAsync = createAsyncThunk(
    'dean/deleteForumQuestionAsync',
    async (id, { rejectWithValue }) => {
        try {
            await apiFetch(`/forumQuestions/${id}`, { method: 'DELETE' });
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const terminateLiveStreamAsync = createAsyncThunk(
    'dean/terminateLiveStreamAsync',
    async (id, { rejectWithValue }) => {
        try {
            return await apiFetch(`/liveStreams/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'ended', viewerCount: 0 }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateStudentAdvisorAsync = createAsyncThunk(
    'dean/updateStudentAdvisorAsync',
    async ({ id, advisorId, advisor }, { rejectWithValue }) => {
        try {
            return await apiFetch(`/users/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ advisorId, advisor })
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addInstructorAsync = createAsyncThunk(
    'dean/addInstructorAsync',
    async (payload, { rejectWithValue }) => {
        try {
            return await apiFetch('/facultyWorkloads', {
                method: 'POST',
                body: JSON.stringify({
                    id: `fw-${Date.now()}`,
                    ...payload
                })
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateInstructorAsync = createAsyncThunk(
    'dean/updateInstructorAsync',
    async (payload, { rejectWithValue }) => {
        try {
            const { id, ...data } = payload;
            return await apiFetch(`/facultyWorkloads/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteInstructorAsync = createAsyncThunk(
    'dean/deleteInstructorAsync',
    async (id, { rejectWithValue }) => {
        try {
            await apiFetch(`/facultyWorkloads/${id}`, { method: 'DELETE' });
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addScheduleAsync = createAsyncThunk(
    'dean/addScheduleAsync',
    async (schedulePayload, { rejectWithValue }) => {
        try {
            return await apiFetch('/schedules', {
                method: 'POST',
                body: JSON.stringify({
                    id: `sch-${Date.now()}`,
                    ...schedulePayload
                }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteScheduleAsync = createAsyncThunk(
    'dean/deleteScheduleAsync',
    async (id, { rejectWithValue }) => {
        try {
            await apiFetch(`/schedules/${id}`, { method: 'DELETE' });
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const approveScheduleAsync = createAsyncThunk(
    'dean/approveScheduleAsync',
    async (id, { rejectWithValue }) => {
        try {
            return await apiFetch(`/schedules/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'approved' }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addAcademicEventAsync = createAsyncThunk(
    'dean/addAcademicEventAsync',
    async (payload, { rejectWithValue }) => {
        try {
            return await apiFetch('/academicEvents', {
                method: 'POST',
                body: JSON.stringify({
                    id: `acev-${Date.now()}`,
                    ...payload
                }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteAcademicEventAsync = createAsyncThunk(
    'dean/deleteAcademicEventAsync',
    async (id, { rejectWithValue }) => {
        try {
            await apiFetch(`/academicEvents/${id}`, { method: 'DELETE' });
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const deanSlice = createSlice({
    name: 'dean',
    initialState: {
        instructors: [],
        bulletins: [],
        users: [],
        courses: [],
        curriculum: [],
        deanOverview: null,
        studentAnalytics: null,
        courseAssignments: [],
        studentRequests: [],
        termStatus: { isTermClosed: false, isGradeLocksActive: true, emergencyAlertActive: false, emergencyAlertText: "" },
        systemLogs: [],
        graduationApprovals: [],
        documents: [],
        forumQuestions: [],
        liveStreams: [],
        schedules: [],
        academicEvents: [],
        faculties: [], // FAZ 2
        departments: [], // FAZ 2
        activeSemester: '2026-2027 Güz Dönemi',
        status: 'idle',
        actionStatus: 'idle',
        error: null,
    },
    reducers: {
        changeSemester: (state, action) => {
            state.activeSemester = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDeanDashboardData.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchDeanDashboardData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.instructors = action.payload.instructors;
                state.bulletins = action.payload.bulletins;
                state.users = action.payload.users;
                state.courses = action.payload.courses;
                state.curriculum = action.payload.curriculum;
                state.deanOverview = action.payload.deanOverview;
                state.studentAnalytics = action.payload.studentAnalytics;
                state.courseAssignments = action.payload.courseAssignments;
                state.studentRequests = action.payload.studentRequests;
                state.termStatus = action.payload.termStatus;
                state.systemLogs = action.payload.systemLogs;
                state.graduationApprovals = action.payload.graduationApprovals;
                state.documents = action.payload.documents || [];
                state.forumQuestions = action.payload.forumQuestions || [];
                state.liveStreams = action.payload.liveStreams || [];
                state.schedules = action.payload.schedules || [];
                state.academicEvents = action.payload.academicEvents || [];
                state.faculties = action.payload.faculties || [];
                state.departments = action.payload.departments || [];
            })
            .addCase(fetchDeanDashboardData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(publishGlobalBulletinAsync.fulfilled, (state, action) => {
                state.bulletins.unshift(action.payload);
            })
            .addCase(updateCourseAssignmentStatus.fulfilled, (state, action) => {
                const index = state.courseAssignments.findIndex(x => x.id === action.payload.id);
                if (index !== -1) {
                    state.courseAssignments[index] = action.payload;
                }
            })
            .addCase(updateStudentRequestStatus.fulfilled, (state, action) => {
                const index = state.studentRequests.findIndex(x => x.id === action.payload.id);
                if (index !== -1) {
                    state.studentRequests[index] = action.payload;
                }
            })
            .addCase(updateGraduationApprovalStatus.fulfilled, (state, action) => {
                const index = state.graduationApprovals.findIndex(x => x.id === action.payload.id);
                if (index !== -1) {
                    state.graduationApprovals[index] = action.payload;
                }
            })
            .addCase(updateTermLocks.fulfilled, (state, action) => {
                state.termStatus = action.payload;
            })
            .addCase(writeSystemLog.fulfilled, (state, action) => {
                state.systemLogs.unshift(action.payload);
            })
            .addCase(updateUserStatus.fulfilled, (state, action) => {
                const index = state.users.findIndex(x => x.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            // öğrenci danışmanını güncelle
            .addCase(updateStudentAdvisorAsync.fulfilled, (state, action) => {
                const index = state.users.findIndex(x => x.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            // akademisyen ekle
            .addCase(addInstructorAsync.fulfilled, (state, action) => {
                state.instructors.push(action.payload);
            })
            // akademisyen bilgilerini güncelle
            .addCase(updateInstructorAsync.fulfilled, (state, action) => {
                const index = state.instructors.findIndex(i => i.id === action.payload.id);
                if (index !== -1) {
                    state.instructors[index] = action.payload;
                }
            })
            // akademisyeni sil
            .addCase(deleteInstructorAsync.fulfilled, (state, action) => {
                state.instructors = state.instructors.filter(i => i.id !== action.payload);
            })
            .addCase(triggerEmergencyAlert.fulfilled, (state, action) => {
                state.termStatus = action.payload;
            })
            .addCase(createNewSection.fulfilled, (state, action) => {
                state.courses.push(action.payload);
            })
            .addCase(updateDocumentStatusAsync.fulfilled, (state, action) => {
                const index = state.documents.findIndex(x => x.id === action.payload.id);
                if (index !== -1) {
                    state.documents[index] = action.payload;
                }
            })
            .addCase(moderateForumQuestionAsync.fulfilled, (state, action) => {
                const index = state.forumQuestions.findIndex(x => x.id === action.payload.id);
                if (index !== -1) {
                    state.forumQuestions[index] = action.payload;
                }
            })
            .addCase(deleteForumQuestionAsync.fulfilled, (state, action) => {
                state.forumQuestions = state.forumQuestions.filter(x => x.id !== action.payload);
            })
            .addCase(terminateLiveStreamAsync.fulfilled, (state, action) => {
                const index = state.liveStreams.findIndex(x => x.id === action.payload.id);
                if (index !== -1) {
                    state.liveStreams[index] = action.payload;
                }
            })
            .addCase(addScheduleAsync.fulfilled, (state, action) => {
                state.schedules.push(action.payload);
            })
            .addCase(deleteScheduleAsync.fulfilled, (state, action) => {
                state.schedules = state.schedules.filter(x => x.id !== action.payload);
            })
            .addCase(approveScheduleAsync.fulfilled, (state, action) => {
                const index = state.schedules.findIndex(x => x.id === action.payload.id);
                if (index !== -1) {
                    state.schedules[index] = action.payload;
                }
            })
            .addCase(addAcademicEventAsync.fulfilled, (state, action) => {
                state.academicEvents.push(action.payload);
            })
            .addCase(deleteAcademicEventAsync.fulfilled, (state, action) => {
                state.academicEvents = state.academicEvents.filter(x => x.id !== action.payload);
            });
    },
});

export const { changeSemester } = deanSlice.actions;
export default deanSlice.reducer;