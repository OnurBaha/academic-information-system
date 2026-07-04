import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const loginUserAsync = createAsyncThunk(
    'auth/loginUserAsync',
    async ({ username, password }, { rejectWithValue }) => {
        try {
            const users = await apiFetch('/users');

            const matchedUser = users.find(
                (u) => (u.username === username || u.studentNumber === username || u.email === username) && u.password === password
            );

            if (!matchedUser) throw new Error('Geçersiz kullanıcı adı veya şifre.');

            // Güvenlik amacıyla şifreyi state üzerinde taşımıyoruz
            const { password: _, ...userWithoutPassword } = matchedUser;
            return userWithoutPassword;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateProfileAsync = createAsyncThunk(
    'auth/updateProfileAsync',
    async (profileData, { rejectWithValue }) => {
        try {
            const updatedUser = await apiFetch(`/users/${profileData.id}`, {
                method: 'PATCH',
                body: JSON.stringify(profileData),
            });
            const { password: _, ...userWithoutPassword } = updatedUser;
            return userWithoutPassword;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
        status: 'idle',
        error: null,
        actionStatus: 'idle',
    },
    reducers: {
        logout: (state) => {
            state.currentUser = null;
            state.status = 'idle';
            state.error = null;
            localStorage.removeItem('currentUser');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUserAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginUserAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentUser = action.payload;
                localStorage.setItem('currentUser', JSON.stringify(action.payload));
            })
            .addCase(loginUserAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })


            .addCase(updateProfileAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(updateProfileAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                state.currentUser = action.payload;
                localStorage.setItem('currentUser', JSON.stringify(action.payload));
            })
            .addCase(updateProfileAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;