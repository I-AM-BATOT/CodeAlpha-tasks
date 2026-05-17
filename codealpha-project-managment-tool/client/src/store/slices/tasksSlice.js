
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { boardsAPI } from '../../api/boards.api';
import { tasksAPI } from '../../api/tasks.api';

// Always compare IDs as strings to avoid number/string mismatch
const sid = (id) => String(id);

export const fetchBoards = createAsyncThunk('tasks/fetchBoards', async (projectId, { rejectWithValue }) => {
  try {
    const { data } = await boardsAPI.getByProject(projectId);
    return data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message);
  }
});

export const createBoard = createAsyncThunk('tasks/createBoard', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await boardsAPI.create(payload);
    return data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message);
  }
});

export const createTask = createAsyncThunk('tasks/createTask', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await tasksAPI.create(payload);
    return data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message);
  }
});

export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await tasksAPI.update(id, payload);
    return data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message);
  }
});

export const moveTask = createAsyncThunk('tasks/moveTask', async ({ id, boardId }, { rejectWithValue }) => {
  try {
    await tasksAPI.move(id, boardId);
    return { id: sid(id), boardId: sid(boardId) };
  } catch (e) {
    return rejectWithValue(e.response?.data?.message);
  }
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async ({ id, boardId }, { rejectWithValue }) => {
  try {
    await tasksAPI.delete(id);
    return { id: sid(id), boardId: sid(boardId) };
  } catch (e) {
    return rejectWithValue(e.response?.data?.message);
  }
});

// ── helpers ──────────────────────────────────────────────────────

// Find which boardId key contains a task with given id
const findBoardOfTask = (tasksByBoard, taskId) => {
  const tid = sid(taskId);
  for (const bid in tasksByBoard) {
    if (tasksByBoard[bid].find(t => sid(t.id) === tid)) return bid;
  }
  return null;
};

const slice = createSlice({
  name: 'tasks',
  initialState: {
    boards: [],
    tasksByBoard: {},  // keys are always strings
    loading: false,
  },
  reducers: {
    // ── Real-time socket reducers ─────────────────────────────────

    socketTaskCreated(state, action) {
      const t = action.payload;
      if (!t) return;
      const bid = sid(t.boardId);
      if (!state.tasksByBoard[bid]) state.tasksByBoard[bid] = [];
      // Only add if not already present
      if (!state.tasksByBoard[bid].find(x => sid(x.id) === sid(t.id))) {
        state.tasksByBoard[bid].push(t);
        console.log('Redux: task added to board', bid, t.title);
      }
    },

    socketTaskUpdated(state, action) {
      const t = action.payload;
      if (!t) return;
      const bid = sid(t.boardId);
      if (state.tasksByBoard[bid]) {
        const idx = state.tasksByBoard[bid].findIndex(x => sid(x.id) === sid(t.id));
        if (idx > -1) {
          state.tasksByBoard[bid][idx] = t;
          console.log('Redux: task updated', t.title);
        }
      }
    },

    socketTaskMoved(state, action) {
      const { taskId, boardId } = action.payload;
      if (!taskId || !boardId) return;
      const tid = sid(taskId);
      const toBid = sid(boardId);
      const fromBid = findBoardOfTask(state.tasksByBoard, tid);
      if (!fromBid || fromBid === toBid) return;

      const idx = state.tasksByBoard[fromBid].findIndex(t => sid(t.id) === tid);
      if (idx > -1) {
        const [task] = state.tasksByBoard[fromBid].splice(idx, 1);
        if (!state.tasksByBoard[toBid]) state.tasksByBoard[toBid] = [];
        state.tasksByBoard[toBid].push({ ...task, boardId: toBid });
        console.log('Redux: task moved from', fromBid, 'to', toBid);
      }
    },

    socketTaskDeleted(state, action) {
      const { taskId, boardId } = action.payload;
      if (!taskId) return;
      const tid = sid(taskId);
      const bid = boardId ? sid(boardId) : findBoardOfTask(state.tasksByBoard, tid);
      if (bid && state.tasksByBoard[bid]) {
        state.tasksByBoard[bid] = state.tasksByBoard[bid].filter(t => sid(t.id) !== tid);
        console.log('Redux: task deleted from board', bid);
      }
    },
  },

  extraReducers: b => {
    b
      // fetchBoards
      .addCase(fetchBoards.pending, s => { s.loading = true; })
      .addCase(fetchBoards.fulfilled, (s, a) => {
        s.loading = false;
        s.boards = a.payload || [];
        const byBoard = {};
        (a.payload || []).forEach(board => {
          byBoard[sid(board.id)] = (board.tasks || []);
        });
        s.tasksByBoard = byBoard;
      })
      .addCase(fetchBoards.rejected, s => { s.loading = false; })

      // createBoard
      .addCase(createBoard.fulfilled, (s, a) => {
        s.boards.push(a.payload);
        s.tasksByBoard[sid(a.payload.id)] = [];
      })

      // createTask — optimistic: add immediately
      .addCase(createTask.fulfilled, (s, a) => {
        const t = a.payload;
        const bid = sid(t.boardId);
        if (!s.tasksByBoard[bid]) s.tasksByBoard[bid] = [];
        // Avoid duplicate if socket already added it
        if (!s.tasksByBoard[bid].find(x => sid(x.id) === sid(t.id))) {
          s.tasksByBoard[bid].push(t);
        }
      })

      // updateTask
      .addCase(updateTask.fulfilled, (s, a) => {
        const t = a.payload;
        if (!t) return;
        const bid = sid(t.boardId);
        if (s.tasksByBoard[bid]) {
          const idx = s.tasksByBoard[bid].findIndex(x => sid(x.id) === sid(t.id));
          if (idx > -1) s.tasksByBoard[bid][idx] = t;
        }
      })

      // moveTask — optimistic move in UI immediately
      .addCase(moveTask.fulfilled, (s, a) => {
        const { id, boardId } = a.payload;
        const tid = sid(id);
        const toBid = sid(boardId);
        const fromBid = findBoardOfTask(s.tasksByBoard, tid);
        if (!fromBid || fromBid === toBid) return;
        const idx = s.tasksByBoard[fromBid].findIndex(t => sid(t.id) === tid);
        if (idx > -1) {
          const [task] = s.tasksByBoard[fromBid].splice(idx, 1);
          if (!s.tasksByBoard[toBid]) s.tasksByBoard[toBid] = [];
          s.tasksByBoard[toBid].push({ ...task, boardId: toBid });
        }
      })

      // deleteTask
      .addCase(deleteTask.fulfilled, (s, a) => {
        const { id, boardId } = a.payload;
        const tid = sid(id);
        const bid = boardId ? sid(boardId) : findBoardOfTask(s.tasksByBoard, tid);
        if (bid && s.tasksByBoard[bid]) {
          s.tasksByBoard[bid] = s.tasksByBoard[bid].filter(t => sid(t.id) !== tid);
        }
      });
  },
});

export const {
  socketTaskCreated,
  socketTaskUpdated,
  socketTaskMoved,
  socketTaskDeleted,
} = slice.actions;

export default slice.reducer;
