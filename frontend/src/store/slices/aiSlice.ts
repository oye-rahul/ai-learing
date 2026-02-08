import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { aiAPI } from '../../services/api';

interface AIInteraction {
  id: string;
  prompt_type: 'explain' | 'optimize' | 'debug' | 'convert' | 'generate' | 'chat' | 'suggestions';
  input_code: string;
  output: string;
  language?: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  code?: string;
  language?: string;
}

interface AIState {
  interactions: AIInteraction[];
  chatMessages: ChatMessage[];
  currentResponse: string | null;
  loading: boolean;
  error: string | null;
  isTyping: boolean;
  isChatOpen: boolean;
  contextCode: string;
  contextLanguage: string;
}

const initialState: AIState = {
  interactions: [],
  chatMessages: [],
  currentResponse: null,
  loading: false,
  error: null,
  isTyping: false,
  isChatOpen: false,
  contextCode: '',
  contextLanguage: 'javascript',
};

// Async thunks
export const explainCode = createAsyncThunk(
  'ai/explainCode',
  async (data: { code: string; language: string }, { rejectWithValue }) => {
    try {
      const response = await aiAPI.explainCode(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to explain code');
    }
  }
);

export const optimizeCode = createAsyncThunk(
  'ai/optimizeCode',
  async (data: { code: string; language: string }, { rejectWithValue }) => {
    try {
      const response = await aiAPI.optimizeCode(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to optimize code');
    }
  }
);

export const debugCode = createAsyncThunk(
  'ai/debugCode',
  async (data: { code: string; language: string; error?: string }, { rejectWithValue }) => {
    try {
      const response = await aiAPI.debugCode(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to debug code');
    }
  }
);

export const convertCode = createAsyncThunk(
  'ai/convertCode',
  async (data: { code: string; fromLanguage: string; toLanguage: string }, { rejectWithValue }) => {
    try {
      const response = await aiAPI.convertCode(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to convert code');
    }
  }
);

export const chatWithAI = createAsyncThunk(
  'ai/chatWithAI',
  async (data: {
    message: string;
    code?: string;
    language?: string;
    conversationHistory?: ChatMessage[]
  }, { rejectWithValue }) => {
    try {
      const response = await aiAPI.chatWithAI(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to chat with AI');
    }
  }
);

export const generateCode = createAsyncThunk(
  'ai/generateCode',
  async (data: { description: string; language: string }, { rejectWithValue }) => {
    try {
      const response = await aiAPI.generateCode(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate code');
    }
  }
);

export const getCodeSuggestions = createAsyncThunk(
  'ai/getCodeSuggestions',
  async (data: { partialCode: string; language: string; cursorPosition?: number }, { rejectWithValue }) => {
    try {
      const response = await aiAPI.getCodeSuggestions(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get code suggestions');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentResponse: (state) => {
      state.currentResponse = null;
    },
    addInteraction: (state, action: PayloadAction<AIInteraction>) => {
      state.interactions.unshift(action.payload);
    },
    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chatMessages.push(action.payload);
    },
    clearChatMessages: (state) => {
      state.chatMessages = [];
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    toggleChat: (state) => {
      state.isChatOpen = !state.isChatOpen;
    },
    setChatOpen: (state, action: PayloadAction<boolean>) => {
      state.isChatOpen = action.payload;
    },
    setChatContext: (state, action: PayloadAction<{ code: string; language: string }>) => {
      state.contextCode = action.payload.code;
      state.contextLanguage = action.payload.language;
    },
  },
  extraReducers: (builder) => {
    builder
      // Explain Code
      .addCase(explainCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(explainCode.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResponse = action.payload.explanation;
        state.interactions.unshift({
          id: action.payload.id,
          prompt_type: 'explain',
          input_code: action.payload.input_code,
          output: action.payload.explanation,
          language: action.payload.language,
          created_at: new Date().toISOString(),
        });
        state.error = null;
      })
      .addCase(explainCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Optimize Code
      .addCase(optimizeCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(optimizeCode.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResponse = action.payload.optimized_code;
        state.interactions.unshift({
          id: action.payload.id,
          prompt_type: 'optimize',
          input_code: action.payload.input_code,
          output: action.payload.optimized_code,
          language: action.payload.language,
          created_at: new Date().toISOString(),
        });
        state.error = null;
      })
      .addCase(optimizeCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Debug Code
      .addCase(debugCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(debugCode.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResponse = action.payload.debug_suggestions;
        state.interactions.unshift({
          id: action.payload.id,
          prompt_type: 'debug',
          input_code: action.payload.input_code,
          output: action.payload.debug_suggestions,
          language: action.payload.language,
          created_at: new Date().toISOString(),
        });
        state.error = null;
      })
      .addCase(debugCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Convert Code
      .addCase(convertCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(convertCode.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResponse = action.payload.converted_code;
        state.interactions.unshift({
          id: action.payload.id,
          prompt_type: 'convert',
          input_code: action.payload.input_code,
          output: action.payload.converted_code,
          language: action.payload.to_language,
          created_at: new Date().toISOString(),
        });
        state.error = null;
      })
      .addCase(convertCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Generate Code
      .addCase(generateCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateCode.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResponse = action.payload.generated_code;
        state.interactions.unshift({
          id: action.payload.id,
          prompt_type: 'generate',
          input_code: action.payload.description,
          output: action.payload.generated_code,
          language: action.payload.language,
          created_at: new Date().toISOString(),
        });
        state.error = null;
      })
      .addCase(generateCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Chat with AI
      .addCase(chatWithAI.pending, (state) => {
        state.loading = true;
        state.isTyping = true;
        state.error = null;
      })
      .addCase(chatWithAI.fulfilled, (state, action) => {
        state.loading = false;
        state.isTyping = false;
        state.currentResponse = action.payload.response;

        // Add assistant message to chat
        const assistantMessage: ChatMessage = {
          id: action.payload.id,
          role: 'assistant',
          content: action.payload.response,
          timestamp: action.payload.timestamp,
          code: action.payload.code,
          language: action.payload.language,
        };
        state.chatMessages.push(assistantMessage);

        state.interactions.unshift({
          id: action.payload.id,
          prompt_type: 'chat',
          input_code: action.payload.message,
          output: action.payload.response,
          language: action.payload.language,
          created_at: action.payload.timestamp,
        });
        state.error = null;
      })
      .addCase(chatWithAI.rejected, (state, action) => {
        state.loading = false;
        state.isTyping = false;
        state.error = action.payload as string;
      })
      // Get Code Suggestions
      .addCase(getCodeSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCodeSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResponse = action.payload.suggestions;
        state.interactions.unshift({
          id: action.payload.id,
          prompt_type: 'suggestions',
          input_code: action.payload.partial_code,
          output: action.payload.suggestions,
          language: action.payload.language,
          created_at: new Date().toISOString(),
        });
        state.error = null;
      })
      .addCase(getCodeSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentResponse,
  addInteraction,
  addChatMessage,
  clearChatMessages,
  setTyping,
  toggleChat,
  setChatOpen,
  setChatContext
} = aiSlice.actions;
export default aiSlice.reducer;
