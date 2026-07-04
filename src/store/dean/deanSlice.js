import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const fetchDeanDashboardData = createAsyncThunk(
    'dean/fetchDeanDashboardData',
    async (_, { rejectWithValue }) => {
        try {
            const [instructors, bulletins] = await Promise.all([
                apiFetch('/facultyWorkloads'),
                apiFetch('/bulletins'),
            ]);
            return { instructors, bulletins };
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

const deanSlice = createSlice({
    name: 'dean',
    initialState: {
        instructors: [],
        bulletins: [],
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
            })
            .addCase(fetchDeanDashboardData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })


            .addCase(publishGlobalBulletinAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(publishGlobalBulletinAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                state.bulletins.unshift(action.payload);
            })
            .addCase(publishGlobalBulletinAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            });
    },
});

export const { changeSemester } = deanSlice.actions;
export default deanSlice.reducer;