
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectsAPI } from '../../api/projects.api';

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await projectsAPI.getAll();
      return data.data || [];
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await projectsAPI.create(payload);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id, { rejectWithValue }) => {
    try {
      await projectsAPI.delete(id);
      return id;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: b => {
    b
      .addCase(fetchProjects.pending,   s => { s.loading = true; })
      .addCase(fetchProjects.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchProjects.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createProject.fulfilled, (s, a) => { s.list.push(a.payload); })
      .addCase(deleteProject.fulfilled, (s, a) => {
        s.list = s.list.filter(p => String(p.id) !== String(a.payload));
      });
  },
});

export default projectsSlice.reducer;
