import axios from 'axios';

// Use relative /api in dev (proxied to backend); override with REACT_APP_API_URL if needed
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  register: (userData: {
    email: string;
    password: string;
    username: string;
    role: string
  }) => api.post('/auth/register', userData),

  logout: () => api.post('/auth/logout'),

  refreshToken: () => api.post('/auth/refresh'),

  resetPassword: (email: string) => api.post('/auth/reset-password', { email }),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPasswordWithToken: (token: string, newPassword: string) =>
    api.post('/auth/reset-password-with-token', { token, newPassword }),

  getMe: () => api.get('/users/me'),
};

// User API
export const userAPI = {
  getMe: () => api.get('/users/me'),

  updateProfile: (profileData: any) => api.put('/users/me', profileData),

  getProgress: () => api.get('/users/progress'),

  getActivity: (days?: number) => api.get('/users/activity', { params: days ? { days } : {} }),

  updateSkills: (skills: Record<string, number>) =>
    api.post('/users/skills', { skills }),

  exportData: () => api.get('/users/export'),
};

// AI API
export const aiAPI = {
  explainCode: (data: { code: string; language: string }) =>
    api.post('/ai/explain', data),

  optimizeCode: (data: { code: string; language: string }) =>
    api.post('/ai/optimize', data),

  debugCode: (data: { code: string; language: string; error?: string }) =>
    api.post('/ai/debug', data),

  convertCode: (data: { code: string; fromLanguage: string; toLanguage: string }) =>
    api.post('/ai/convert', data),

  generateCode: (data: { description: string; language: string }) =>
    api.post('/ai/generate', data),

  chatWithAI: (data: {
    message: string;
    code?: string;
    language?: string;
    conversationHistory?: any[]
  }) => api.post('/ai/chat', data),

  learnChat: (data: { message: string; conversationHistory?: { role: string; content: string }[] }) =>
    api.post('/ai/learn-chat', data),

  getCodeSuggestions: (data: {
    partialCode: string;
    language: string;
    cursorPosition?: number
  }) => api.post('/ai/suggestions', data),

  executeCode: (data: {
    code: string;
    language: string;
  }) => api.post('/ai/execute', data),
};

// Learning API
export const learningAPI = {
  getModules: () => api.get('/learning/modules'),

  startModule: (moduleId: string) => api.post('/learning/start-module', { moduleId }),

  completeLesson: (data: { moduleId: string; lessonId: string }) =>
    api.post('/learning/complete-lesson', data),

  getRecommendations: () => api.get('/learning/recommendations'),

  getLearningPath: () => api.get('/learning/path'),

  getCertificates: () => api.get('/learning/certificates'),

  getCertificate: (moduleId: string) => api.get(`/learning/certificates/${moduleId}`),

  getAssessmentQuestions: () => api.get('/learning/assessment/questions'),

  submitAssessment: (answers: { questionId: string; optionIndex: number }[]) =>
    api.post('/learning/assessment', { answers }),
};

// Projects API
export const projectsAPI = {
  getProjects: () => api.get('/projects'),

  createProject: (projectData: any) => api.post('/projects', projectData),

  updateProject: (id: string, updates: any) => api.put(`/projects/${id}`, updates),

  deleteProject: (id: string) => api.delete(`/projects/${id}`),

  addCollaborator: (projectId: string, email: string) =>
    api.post(`/projects/${projectId}/collaborate`, { email }),
};

// Analytics API
export const analyticsAPI = {
  getDailyStats: () => api.get('/analytics/daily'),

  getWeeklyReport: () => api.get('/analytics/weekly'),

  getSkillProgression: () => api.get('/analytics/skills'),

  logActivity: (activityData: any) => api.post('/analytics/log-activity', activityData),
};

// Snippets API
export const snippetsAPI = {
  list: (params?: { search?: string; language?: string; tag?: string }) =>
    api.get('/snippets', { params }),
  create: (data: { title: string; code: string; language: string; tags?: string[]; ai_explanation?: string }) =>
    api.post('/snippets', data),
  get: (id: string) => api.get(`/snippets/${id}`),
  update: (id: string, data: Partial<{ title: string; code: string; language: string; tags: string[]; ai_explanation: string }>) =>
    api.put(`/snippets/${id}`, data),
  delete: (id: string) => api.delete(`/snippets/${id}`),
};

// Bookmarks API
export const bookmarksAPI = {
  list: () => api.get('/bookmarks'),
  add: (module_id: string, lesson_index?: number) => api.post('/bookmarks', { module_id, lesson_index }),
  remove: (moduleId: string) => api.delete(`/bookmarks/${moduleId}`),
};

// Notifications API
export const notificationsAPI = {
  list: (unreadOnly?: boolean) => api.get('/notifications', { params: unreadOnly ? { unread_only: 'true' } : {} }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

// Badges API
export const badgesAPI = {
  getDefinitions: () => api.get('/badges/definitions'),
  getMine: () => api.get('/badges'),
  getLeaderboard: (by?: 'streak' | 'lessons') => api.get('/badges/leaderboard', { params: by ? { by } : {} }),
};

// Share API
export const shareAPI = {
  create: (resource_type: 'project' | 'snippet', resource_id: string, expires_in_hours?: number) =>
    api.post('/share/create', { resource_type, resource_id, expires_in_hours }),
  getBySlug: (slug: string) => api.get(`/share/${slug}`),
};

// AI Files (playground)
export const aiFilesAPI = {
  list: () => api.get('/ai/files'),
  create: (fileName: string, content?: string, language?: string) =>
    api.post('/ai/files/create', { fileName, content, language }),
  update: (fileId: string, content: string) => api.put(`/ai/files/${fileId}`, { content }),
  delete: (fileId: string) => api.delete(`/ai/files/${fileId}`),
};

export default api;
