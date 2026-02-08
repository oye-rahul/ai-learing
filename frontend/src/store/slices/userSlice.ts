import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userAPI } from '../../services/api';

interface UserProgress {
  skills: Record<string, number>;
  completed_modules: string[];
  current_module: string | null;
  streak_days: number;
  total_learning_hours: number;
}

interface UserState {
  progress: UserProgress | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  progress: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchUserProgress = createAsyncThunk(
  'user/fetchProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getProgress();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch progress');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile(profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const updateUserSkills = createAsyncThunk(
  'user/updateSkills',
  async (skills: Record<string, number>, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateSkills(skills);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update skills');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStreak: (state, action: PayloadAction<number>) => {
      if (state.progress) {
        state.progress.streak_days = action.payload;
      }
    },
    incrementLearningHours: (state, action: PayloadAction<number>) => {
      if (state.progress) {
        state.progress.total_learning_hours += action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Progress
      .addCase(fetchUserProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.progress = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Skills
      .addCase(updateUserSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserSkills.fulfilled, (state, action) => {
        state.loading = false;
        if (state.progress) {
          state.progress.skills = action.payload.skills;
        }
        state.error = null;
      })
      .addCase(updateUserSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateStreak, incrementLearningHours } = userSlice.actions;
export default userSlice.reducer;
