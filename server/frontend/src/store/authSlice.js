import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMe } from '../services/authService';

// Called once on app load to restore session from cookie
export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
    return await getMe();
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user:      null,   // { id, email, role, employeeId, firstName, lastName, position }
        isLoading: true,   // true while checking /me on startup
    },
    reducers: {
        setUser(state, action) {
            state.user      = action.payload;
            state.isLoading = false;
        },
        clearUser(state) {
            state.user      = null;
            state.isLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(initializeAuth.pending,   (state)          => { state.isLoading = true; })
            .addCase(initializeAuth.fulfilled,  (state, action)  => { state.user = action.payload; state.isLoading = false; })
            .addCase(initializeAuth.rejected,   (state)          => { state.user = null; state.isLoading = false; });
    },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
