import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const fetchCoursesAsync = createAsyncThunk(
    'courses/fetchCoursesAsync',
    async (instructorId = null, { rejectWithValue }) => {
        try {
            let endpoint = '/courses';
            if (instructorId) {
                endpoint += `?instructorId=${instructorId}`;
            }
            return await apiFetch(endpoint);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCurriculumAsync = createAsyncThunk(
    'courses/fetchCurriculumAsync',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/curriculum');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createNewCurriculumCourseAsync = createAsyncThunk(
    'courses/createNewCurriculumCourseAsync',
    async (newCoursePayload, { rejectWithValue }) => {
        try {
            return await apiFetch('/curriculum', {
                method: 'POST',
                body: JSON.stringify({
                    id: `c-cur-${Date.now()}`,
                    ...newCoursePayload,
                }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const approveGradeSheetAsync = createAsyncThunk(
    'courses/approveGradeSheetAsync',
    async (courseId, { rejectWithValue }) => {
        try {
            return await apiFetch(`/courses/${courseId}`, {
                method: 'PATCH',
                body: JSON.stringify({ gradesApproved: true }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateCurriculumCourseAsync = createAsyncThunk(
    'courses/updateCurriculumCourseAsync',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await apiFetch(`/curriculum/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteCurriculumCourseAsync = createAsyncThunk(
    'courses/deleteCurriculumCourseAsync',
    async (id, { rejectWithValue }) => {
        try {
            await apiFetch(`/curriculum/${id}`, { method: 'DELETE' });
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const uploadCourseMaterialAsync = createAsyncThunk(
    'courses/uploadCourseMaterialAsync',
    async ({ courseId, materialPayload }, { rejectWithValue }) => {
        try {
            const course = await apiFetch(`/courses/${courseId}`);
            const updatedMaterials = [...(course.materials || []), materialPayload];

            return await apiFetch(`/courses/${courseId}`, {
                method: 'PATCH',
                body: JSON.stringify({ materials: updatedMaterials }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const courseSlice = createSlice({
    name: 'courses',
    initialState: {
        courses: [],
        curriculum: [],
        status: 'idle',
        actionStatus: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCoursesAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCoursesAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.courses = action.payload;
            })
            .addCase(fetchCoursesAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })


            .addCase(fetchCurriculumAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCurriculumAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.curriculum = action.payload;
            })
            .addCase(fetchCurriculumAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })


            .addCase(createNewCurriculumCourseAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(createNewCurriculumCourseAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                state.curriculum.push(action.payload);
            })
            .addCase(createNewCurriculumCourseAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            })


            .addCase(approveGradeSheetAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(approveGradeSheetAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                const index = state.courses.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.courses[index].gradesApproved = true;
                }
            })
            .addCase(approveGradeSheetAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            })


            .addCase(uploadCourseMaterialAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(uploadCourseMaterialAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                const index = state.courses.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.courses[index] = action.payload;
                }
            })
            .addCase(uploadCourseMaterialAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            })
            
            // updateCurriculumCourseAsync
            .addCase(updateCurriculumCourseAsync.fulfilled, (state, action) => {
                const index = state.curriculum.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.curriculum[index] = action.payload;
                }
            })
            
            // deleteCurriculumCourseAsync
            .addCase(deleteCurriculumCourseAsync.fulfilled, (state, action) => {
                state.curriculum = state.curriculum.filter((c) => c.id !== action.payload);
            });
    },
});

export default courseSlice.reducer;