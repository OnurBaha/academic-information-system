import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

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
            return await apiFetch(`/studentGrades/${gradeId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    homeworkStatus: 'submitted',
                    homeworkSubmitTime: new Date().toLocaleString('tr-TR'),
                    homeworkFile: homeworkPayload.fileName,
                    studentComment: homeworkPayload.studentComment,
                    githubLink: homeworkPayload.githubLink,
                }),
            });
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

const studentSlice = createSlice({
    name: 'student',
    initialState: {
        grades: [],
        documents: [],
        dashboardData: null,
        status: 'idle',
        actionStatus: 'idle',
        error: null,
    },
    reducers: {
        clearStudentState: (state) => {
            state.grades = [];
            state.documents = [];
            state.dashboardData = null;
            state.status = 'idle';
            state.actionStatus = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Grades
            .addCase(fetchStudentGradesAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchStudentGradesAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.grades = action.payload;
            })
            .addCase(fetchStudentGradesAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Fetch Documents
            .addCase(fetchStudentDocumentsAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchStudentDocumentsAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.documents = action.payload;
            })
            .addCase(fetchStudentDocumentsAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Fetch Dashboard
            .addCase(fetchStudentDashboardAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchStudentDashboardAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.dashboardData = action.payload;
            })
            .addCase(fetchStudentDashboardAsync.rejected, (state, action) => {
                state.status = 'failed';
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
            });
    },
});

export const { clearStudentState } = studentSlice.actions;
export default studentSlice.reducer;