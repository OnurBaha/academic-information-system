import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

// Tüm duyuruları çekme (Genel + Sınıf)
export const fetchAnnouncementsAsync = createAsyncThunk(
    'announcements/fetchAnnouncementsAsync',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/announcements');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Dekan veya Fakülte Yönetimi için Genel Duyuru Yayınlama
export const publishGlobalAnnouncementAsync = createAsyncThunk(
    'announcements/publishGlobalAnnouncementAsync',
    async (announcementPayload, { rejectWithValue }) => {
        try {
            return await apiFetch('/announcements', {
                method: 'POST',
                body: ({
                    id: `ann-glob-${Date.now()}`,
                    date: new Date().toLocaleDateString('tr-TR'),
                    pinned: announcementPayload.pinned || false,
                    title: announcementPayload.title,
                    body: announcementPayload.body,
                    target: 'global',
                }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Öğretmen için Sınıf/Ders Bazlı Duyuru Yayınlama
export const publishClassAnnouncementAsync = createAsyncThunk(
    'announcements/publishClassAnnouncementAsync',
    async ({ courseId, title, body, pinned }, { rejectWithValue }) => {
        try {
            return await apiFetch('/announcements', {
                method: 'POST',
                body: ({
                    id: `ann-class-${Date.now()}`,
                    date: new Date().toLocaleDateString('tr-TR'),
                    pinned: pinned || false,
                    title,
                    body,
                    target: 'class',
                    courseId,
                }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const announcementSlice = createSlice({
    name: 'announcements',
    initialState: {
        announcements: [],
        status: 'idle',
        actionStatus: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder

            .addCase(fetchAnnouncementsAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAnnouncementsAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.announcements = action.payload;
            })
            .addCase(fetchAnnouncementsAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })


            .addCase(publishGlobalAnnouncementAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(publishGlobalAnnouncementAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                state.announcements.unshift(action.payload);
            })
            .addCase(publishGlobalAnnouncementAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            })


            .addCase(publishClassAnnouncementAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(publishClassAnnouncementAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                state.announcements.unshift(action.payload);
            })
            .addCase(publishClassAnnouncementAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            });
    },
});

export default announcementSlice.reducer;
