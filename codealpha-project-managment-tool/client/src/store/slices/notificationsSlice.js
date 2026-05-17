
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsAPI } from '../../api/notifications.api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await notificationsAPI.getAll();
      return data.data || [];
    } catch (e) {
      return rejectWithValue(null);
    }
  }
);

export const markAllRead = createAsyncThunk(
  'notifications/markAll',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsAPI.markAllRead();
      return true;
    } catch (e) {
      return rejectWithValue(null);
    }
  }
);

export const markOneRead = createAsyncThunk(
  'notifications/markOne',
  async (id, { rejectWithValue }) => {
    try {
      await notificationsAPI.markOneRead(id);
      return id;
    } catch (e) {
      return rejectWithValue(null);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], loading: false },
  reducers: {
    addNotification(state, action) {
      // avoid duplicates
      const exists = state.list.find(n => n.id === action.payload.id);
      if (!exists) state.list.unshift(action.payload);
    },
  },
  extraReducers: b => {
    b.addCase(fetchNotifications.pending, s => { s.loading = true; })
     .addCase(fetchNotifications.fulfilled, (s, a) => {
       s.loading = false;
       s.list = a.payload;
     })
     .addCase(fetchNotifications.rejected, s => { s.loading = false; })
     .addCase(markAllRead.fulfilled, s => {
       s.list = s.list.map(n => ({ ...n, read: true }));
     })
     .addCase(markOneRead.fulfilled, (s, a) => {
       const n = s.list.find(n => n.id === a.payload);
       if (n) n.read = true;
     });
  },
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;

