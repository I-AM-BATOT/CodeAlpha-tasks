
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api/auth.api';

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try { const { data } = await authAPI.login(creds); return data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Login failed'); }
});

export const register = createAsyncThunk('auth/register', async (d, { rejectWithValue }) => {
  try { await authAPI.register(d); return true; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Registration failed'); }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try { const { data } = await authAPI.me(); return data.data; }
  catch (e) { return rejectWithValue(null); }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await authAPI.logout(); } catch {}
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (d, { rejectWithValue }) => {
  try { const { data } = await authAPI.updateProfile(d); return data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Update failed'); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('accessToken'),
    loading: false,
    error: null,
  },
  reducers: {
    clearError(s) { s.error = null; },
  },
  extraReducers: b => {
    b
      .addCase(login.pending,   s => { s.loading = true;  s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user    = a.payload.user;
        s.token   = a.payload.accessToken;
        localStorage.setItem('accessToken', a.payload.accessToken);
      })
      .addCase(login.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(register.pending,   s => { s.loading = true;  s.error = null; })
      .addCase(register.fulfilled, s => { s.loading = false; })
      .addCase(register.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; })
      .addCase(fetchMe.rejected,  s => {
        s.token = null;
        localStorage.removeItem('accessToken');
      })

      .addCase(logout.fulfilled, s => {
        s.user  = null;
        s.token = null;
        localStorage.removeItem('accessToken');
      })

      .addCase(updateProfile.fulfilled, (s, a) => { s.user = a.payload; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

