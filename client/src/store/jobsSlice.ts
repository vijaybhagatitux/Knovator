// src/store/jobsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Job {
  _id: string;
  title: string;
  company?: string;
  location?: string;
  type?: string;
  publishedAt?: string;
  description?: string;
  url?: string;
}

export interface JobsResponse {
  total: number;
  page: number;
  limit: number;
  rows: Job[];
}

export const fetchJobs = createAsyncThunk<
  JobsResponse,
  { page?: number; limit?: number; search?: string },
  { rejectValue: any }
>(
  'jobs/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 20, search } = params || {};
      const q = new URLSearchParams();
      q.set('page', String(page));
      q.set('limit', String(limit));
      if (search) q.set('search', search);

      const url = `http://localhost:4000/api/jobs?${q.toString()}`;
      const { data } = await axios.get<JobsResponse>(url);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

interface JobsState {
  data: JobsResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = { data: null, loading: false, error: null };

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchJobs.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<JobsResponse>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || String(action.error.message);
      });
  },
});

// ✅ export must be outside of the slice definition
export default jobsSlice.reducer;
