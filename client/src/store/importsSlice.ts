// src/store/importsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface ImportLog {
  _id: string;
  startedAt: string;
  sourceUrl: string;
  totalFetched: number;
  totalImported: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: number;
  failures?: any[]; // keep flexible for failures structure
  status: string;
  createdAt?: string;
  updatedAt?: string;
  finishedAt?: string;
}

export interface ImportsResponse {
  total: number;
  page: number;
  limit: number;
  rows: ImportLog[];
}

export const fetchImportLogs = createAsyncThunk<
  ImportsResponse,
  { page?: number; limit?: number; sourceUrl?: string },
  { rejectValue: any }
>(
  'imports/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 20, sourceUrl } = params || {};
      const q = new URLSearchParams();
      q.set('page', String(page));
      q.set('limit', String(limit));
      if (sourceUrl) q.set('sourceUrl', sourceUrl);

      const url = `http://localhost:4000/api/imports/logs?${q.toString()}`;
      const { data } = await axios.get<ImportsResponse>(url);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

interface ImportsState {
  data: ImportsResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: ImportsState = { data: null, loading: false, error: null };

const importsSlice = createSlice({
  name: 'imports',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchImportLogs.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImportLogs.fulfilled, (state, action: PayloadAction<ImportsResponse>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchImportLogs.rejected, (state, action) => {
        state.loading = false;
        // action.payload may be the rejectWithValue value; fallback to action.error.message
        state.error = (action.payload as any)?.error || String(action.error.message || action.payload || 'Unknown error');
      });
  },
});

export default importsSlice.reducer;
