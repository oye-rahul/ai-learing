import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { learningAPI } from '../../services/api';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  estimated_hours: number;
  prerequisites: string[];
  content: any;
  project_template_id?: string;
  completed: boolean;
  progress: number;
}

interface LearningPath {
  modules: LearningModule[];
  current_module: string | null;
  completion_percentage: number;
  completed_modules: number;
  total_modules: number;
}

interface LearningState {
  modules: LearningModule[];
  currentModule: LearningModule | null;
  learningPath: LearningPath | null;
  recommendations: LearningModule[];
  loading: boolean;
  error: string | null;
}

const initialState: LearningState = {
  modules: [],
  currentModule: null,
  learningPath: null,
  recommendations: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchLearningModules = createAsyncThunk(
  'learning/fetchModules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await learningAPI.getModules();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch modules');
    }
  }
);

export const startModule = createAsyncThunk(
  'learning/startModule',
  async (moduleId: string, { rejectWithValue }) => {
    try {
      const response = await learningAPI.startModule(moduleId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start module');
    }
  }
);

export const completeLesson = createAsyncThunk(
  'learning/completeLesson',
  async (data: { moduleId: string; lessonId: string }, { rejectWithValue }) => {
    try {
      const response = await learningAPI.completeLesson(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete lesson');
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'learning/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await learningAPI.getRecommendations();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recommendations');
    }
  }
);

export const fetchLearningPath = createAsyncThunk(
  'learning/fetchPath',
  async (_, { rejectWithValue }) => {
    try {
      const response = await learningAPI.getLearningPath();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch learning path');
    }
  }
);

const learningSlice = createSlice({
  name: 'learning',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentModule: (state, action: PayloadAction<LearningModule>) => {
      state.currentModule = action.payload;
    },
    updateModuleProgress: (state, action: PayloadAction<{ moduleId: string; progress: number }>) => {
      const module = state.modules.find(m => m.id === action.payload.moduleId);
      if (module) {
        module.progress = action.payload.progress;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Modules
      .addCase(fetchLearningModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLearningModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
        state.error = null;
      })
      .addCase(fetchLearningModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Start Module
      .addCase(startModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startModule.fulfilled, (state, action) => {
        state.loading = false;
        state.currentModule = action.payload.module;
        const moduleIndex = state.modules.findIndex(m => m.id === action.payload.module.id);
        if (moduleIndex !== -1) {
          state.modules[moduleIndex] = action.payload.module;
        }
        state.error = null;
      })
      .addCase(startModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Complete Lesson
      .addCase(completeLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeLesson.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentModule && state.currentModule.id === action.payload.moduleId) {
          state.currentModule.progress = action.payload.progress;
        }
        const moduleIndex = state.modules.findIndex(m => m.id === action.payload.moduleId);
        if (moduleIndex !== -1) {
          state.modules[moduleIndex].progress = action.payload.progress;
        }
        state.error = null;
      })
      .addCase(completeLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
        state.error = null;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Learning Path
      .addCase(fetchLearningPath.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLearningPath.fulfilled, (state, action) => {
        state.loading = false;
        state.learningPath = action.payload;
        state.error = null;
      })
      .addCase(fetchLearningPath.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentModule, updateModuleProgress } = learningSlice.actions;
export default learningSlice.reducer;
