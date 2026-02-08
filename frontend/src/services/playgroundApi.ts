import api from './api';

export interface CodeExecutionRequest {
  code: string;
  language: string;
  input?: string;
}

export interface CodeExecutionResponse {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
  executionTime: string;
  language: string;
  timestamp: string;
}

export interface Language {
  name: string;
  extension: string;
  timeout: number;
  memoryLimit: string;
}

export interface LanguagesResponse {
  success: boolean;
  languages: Language[];
  count: number;
}

export interface Template {
  [key: string]: string;
}

export interface TemplatesResponse {
  success: boolean;
  language: string;
  templates: Template;
}

class PlaygroundAPI {
  // Execute code
  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResponse> {
    try {
      const response = await api.post('/playground/execute', request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to execute code');
    }
  }

  // Get supported languages
  async getSupportedLanguages(): Promise<LanguagesResponse> {
    try {
      const response = await api.get('/playground/languages');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch supported languages');
    }
  }

  // Get code templates for a language
  async getTemplates(language: string): Promise<TemplatesResponse> {
    try {
      const response = await api.get(`/playground/templates/${language}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch templates');
    }
  }

  // Health check
  async healthCheck(): Promise<{ success: boolean; status: string; timestamp: string }> {
    try {
      const response = await api.get('/playground/health');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Playground service unavailable');
    }
  }
}

const playgroundApi = new PlaygroundAPI();
export default playgroundApi;