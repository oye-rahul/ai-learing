/**
 * LocalStorage utility for persisting user data
 * Provides type-safe storage with automatic JSON serialization
 */

const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_DATA: 'userData',
  THEME: 'theme',
  RECENT_PROJECTS: 'recentProjects',
  LEARNING_PROGRESS: 'learningProgress',
  CODE_SNIPPETS: 'codeSnippets',
  EDITOR_PREFERENCES: 'editorPreferences',
  LAST_ACTIVITY: 'lastActivity',
} as const;

class StorageService {
  /**
   * Save data to localStorage
   */
  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  }

  /**
   * Get data from localStorage
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }

  /**
   * Clear all app data from localStorage
   */
  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Specific methods for common operations

  saveAuthToken(token: string): void {
    this.set(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  getAuthToken(): string | null {
    return this.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  removeAuthToken(): void {
    this.remove(STORAGE_KEYS.AUTH_TOKEN);
  }

  saveUserData(userData: any): void {
    this.set(STORAGE_KEYS.USER_DATA, userData);
  }

  getUserData(): any {
    return this.get(STORAGE_KEYS.USER_DATA);
  }

  saveTheme(theme: 'light' | 'dark'): void {
    this.set(STORAGE_KEYS.THEME, theme);
  }

  getTheme(): 'light' | 'dark' | null {
    return this.get<'light' | 'dark'>(STORAGE_KEYS.THEME);
  }

  saveRecentProjects(projects: any[]): void {
    // Keep only last 10 projects
    const recent = projects.slice(0, 10);
    this.set(STORAGE_KEYS.RECENT_PROJECTS, recent);
  }

  getRecentProjects(): any[] {
    return this.get<any[]>(STORAGE_KEYS.RECENT_PROJECTS) || [];
  }

  saveLearningProgress(progress: any): void {
    this.set(STORAGE_KEYS.LEARNING_PROGRESS, progress);
  }

  getLearningProgress(): any {
    return this.get(STORAGE_KEYS.LEARNING_PROGRESS);
  }

  saveCodeSnippets(snippets: any[]): void {
    this.set(STORAGE_KEYS.CODE_SNIPPETS, snippets);
  }

  getCodeSnippets(): any[] {
    return this.get<any[]>(STORAGE_KEYS.CODE_SNIPPETS) || [];
  }

  saveEditorPreferences(preferences: any): void {
    this.set(STORAGE_KEYS.EDITOR_PREFERENCES, preferences);
  }

  getEditorPreferences(): any {
    return this.get(STORAGE_KEYS.EDITOR_PREFERENCES) || {
      fontSize: 14,
      theme: 'vs-dark',
      wordWrap: 'on',
      minimap: true,
    };
  }

  updateLastActivity(): void {
    this.set(STORAGE_KEYS.LAST_ACTIVITY, new Date().toISOString());
  }

  getLastActivity(): string | null {
    return this.get<string>(STORAGE_KEYS.LAST_ACTIVITY);
  }
}

export const storage = new StorageService();
export { STORAGE_KEYS };
