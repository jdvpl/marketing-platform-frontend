import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/api/client';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface ChatbotState {
  conversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
}

const initialState: ChatbotState = {
  conversationId: null,
  messages: [],
  isLoading: false,
  error: null,
  isOpen: false,
};

interface ChatResponse {
  response: string;
  message: string;
  conversationId: string;
}

export const sendMessage = createAsyncThunk<ChatResponse, { message: string; userId: string; conversationId?: string }>(
  'chatbot/sendMessage',
  async ({ message, userId, conversationId }) => {
    const data = await apiClient.post<ChatResponse>('/api/chatbot/chat', {
      message,
      userId,
      conversationId,
    });
    return data;
  }
);

export const getHistory = createAsyncThunk<ChatMessage[], string>(
  'chatbot/getHistory',
  async (conversationId: string) => {
    const data = await apiClient.get<ChatMessage[]>(`/api/chatbot/history/${conversationId}`);
    return data;
  }
);

export const clearConversation = createAsyncThunk(
  'chatbot/clearConversation',
  async (conversationId: string) => {
    await apiClient.post(`/api/chatbot/clear/${conversationId}`);
    return conversationId;
  }
);

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    toggleChatbot: (state) => {
      state.isOpen = !state.isOpen;
    },
    closeChatbot: (state) => {
      state.isOpen = false;
    },
    openChatbot: (state) => {
      state.isOpen = true;
    },
    addUserMessage: (state, action) => {
      state.messages.push({
        role: 'user',
        content: action.payload,
        timestamp: Date.now(),
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversationId = action.payload.conversationId;
        state.messages.push({
          role: 'assistant',
          content: action.payload.message,
          timestamp: Date.now(),
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error sending message';
      })
      .addCase(getHistory.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(clearConversation.fulfilled, (state) => {
        state.conversationId = null;
        state.messages = [];
        state.error = null;
      });
  },
});

export const { toggleChatbot, closeChatbot, openChatbot, addUserMessage } = chatbotSlice.actions;
export default chatbotSlice.reducer;
