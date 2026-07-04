import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const fetchTeacherStudentsGradesAsync = createAsyncThunk(
    'teacher/fetchTeacherStudentsGradesAsync',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/studentGrades');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateStudentGradeAsync = createAsyncThunk(
    'teacher/updateStudentGradeAsync',
    async ({ gradeId, field, score }, { rejectWithValue }) => {
        try {
            const currentGrade = await apiFetch(`/studentGrades/${gradeId}`);
            const updatedFields = { ...currentGrade, [field]: parseInt(score, 10) || 0 };

            const midterm = updatedFields.midterm || 0;
            const project = updatedFields.project || 0;
            const final = updatedFields.final || 0;
            const average = Math.round((midterm * 0.3) + (project * 0.3) + (final * 0.4));

            let letterGrade = 'FF';
            if (average >= 90) letterGrade = 'AA';
            else if (average >= 80) letterGrade = 'BA';
            else if (average >= 70) letterGrade = 'BB';
            else if (average >= 60) letterGrade = 'CB';
            else if (average >= 50) letterGrade = 'CC';
            else if (average >= 45) letterGrade = 'DC';
            else letterGrade = 'FF';

            return await apiFetch(`/studentGrades/${gradeId}`, {
                method: 'PATCH',
                body: JSON.stringify({ [field]: parseInt(score, 10) || 0, average, letterGrade }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateAttendanceAsync = createAsyncThunk(
    'teacher/updateAttendanceAsync',
    async ({ gradeId, attendanceStatus }, { rejectWithValue }) => {
        try {
            return await apiFetch(`/studentGrades/${gradeId}`, {
                method: 'PATCH',
                body: JSON.stringify({ attendanceStatus }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const teacherSlice = createSlice({
    name: 'teacher',
    initialState: {
        studentsGrades: [],
        selectedCourseId: null,
        status: 'idle',
        actionStatus: 'idle',
        error: null,
    },
    reducers: {
        setSelectedCourseId: (state, action) => {
            state.selectedCourseId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeacherStudentsGradesAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchTeacherStudentsGradesAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.studentsGrades = action.payload;
            })
            .addCase(fetchTeacherStudentsGradesAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })


            .addCase(updateStudentGradeAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(updateStudentGradeAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                const index = state.studentsGrades.findIndex((g) => g.id === action.payload.id);
                if (index !== -1) {
                    state.studentsGrades[index] = action.payload;
                }
            })
            .addCase(updateStudentGradeAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            })


            .addCase(updateAttendanceAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(updateAttendanceAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                const index = state.studentsGrades.findIndex((g) => g.id === action.payload.id);
                if (index !== -1) {
                    state.studentsGrades[index].attendanceStatus = action.payload.attendanceStatus;
                }
            })
            .addCase(updateAttendanceAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            });
    },
});

export const { setSelectedCourseId } = teacherSlice.actions;
export default teacherSlice.reducer;
