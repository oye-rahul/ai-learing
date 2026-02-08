import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { projectsAPI } from '../../services/api';

interface Project {
  id: string;
  title: string;
  description: string;
  language: string;
  template_id?: string;
  code: string;
  collaborators: string[];
  created_at: string;
  updated_at: string;
  is_public: boolean;
}

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  templates: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  templates: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await projectsAPI.getProjects();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData: Partial<Project>, { rejectWithValue }) => {
    try {
      const response = await projectsAPI.createProject(projectData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async (data: { id: string; updates: Partial<Project> }, { rejectWithValue }) => {
    try {
      const response = await projectsAPI.updateProject(data.id, data.updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      await projectsAPI.deleteProject(projectId);
      return projectId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
    }
  }
);

export const addCollaborator = createAsyncThunk(
  'projects/addCollaborator',
  async (data: { projectId: string; email: string }, { rejectWithValue }) => {
    try {
      const response = await projectsAPI.addCollaborator(data.projectId, data.email);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add collaborator');
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProject: (state, action: PayloadAction<Project>) => {
      state.currentProject = action.payload;
    },
    updateProjectCode: (state, action: PayloadAction<{ projectId: string; code: string }>) => {
      if (state.currentProject && state.currentProject.id === action.payload.projectId) {
        state.currentProject.code = action.payload.code;
      }
      const projectIndex = state.projects.findIndex(p => p.id === action.payload.projectId);
      if (projectIndex !== -1) {
        state.projects[projectIndex].code = action.payload.code;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        const project = action.payload?.project ?? action.payload;
        state.projects.unshift(project);
        state.currentProject = project;
        state.error = null;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const project = action.payload?.project ?? action.payload;
        const projectIndex = state.projects.findIndex(p => p.id === project.id);
        if (projectIndex !== -1) {
          state.projects[projectIndex] = project;
        }
        if (state.currentProject && state.currentProject.id === project.id) {
          state.currentProject = project;
        }
        state.error = null;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(p => p.id !== action.payload);
        if (state.currentProject && state.currentProject.id === action.payload) {
          state.currentProject = null;
        }
        state.error = null;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Collaborator
      .addCase(addCollaborator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCollaborator.fulfilled, (state, action) => {
        state.loading = false;
        const projectIndex = state.projects.findIndex(p => p.id === action.payload.projectId);
        if (projectIndex !== -1) {
          state.projects[projectIndex].collaborators = action.payload.collaborators;
        }
        if (state.currentProject && state.currentProject.id === action.payload.projectId) {
          state.currentProject.collaborators = action.payload.collaborators;
        }
        state.error = null;
      })
      .addCase(addCollaborator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentProject, updateProjectCode } = projectsSlice.actions;
export default projectsSlice.reducer;
