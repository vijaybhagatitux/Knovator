import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from './jobsSlice';
import importsReducer from './importsSlice';

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    imports: importsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
