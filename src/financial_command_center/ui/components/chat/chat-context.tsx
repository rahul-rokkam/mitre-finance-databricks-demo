import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type SchemaType =
  | "financial-health"
  | "program-portfolio"
  | "sponsor-funding"
  | "risk-compliance"
  | "government-relations";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sql?: string;
  queryResult?: {
    columns: string[];
    rows: unknown[][];
  };
  status?: "pending" | "completed" | "failed";
  error?: string;
}

interface ConversationState {
  messages: ChatMessage[];
  conversationId: string | null;
}

interface ChatContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentSchema: SchemaType | null;
  setCurrentSchema: (schema: SchemaType | null) => void;
  conversations: Record<SchemaType, ConversationState>;
  addMessage: (schema: SchemaType, message: ChatMessage) => void;
  updateMessage: (schema: SchemaType, messageId: string, updates: Partial<ChatMessage>) => void;
  setConversationId: (schema: SchemaType, conversationId: string) => void;
  clearConversation: (schema: SchemaType) => void;
}

const defaultConversation: ConversationState = {
  messages: [],
  conversationId: null,
};

const ChatContext = createContext<ChatContextValue | null>(null);

const schemaDisplayNames: Record<SchemaType, string> = {
  "financial-health": "Financial Health",
  "program-portfolio": "Program Portfolio",
  "sponsor-funding": "Sponsor Funding",
  "risk-compliance": "Risk & Compliance",
  "government-relations": "Government Relations",
};

export function getSchemaDisplayName(schema: SchemaType): string {
  return schemaDisplayNames[schema];
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSchema, setCurrentSchema] = useState<SchemaType | null>(null);
  const [conversations, setConversations] = useState<Record<SchemaType, ConversationState>>({
    "financial-health": { ...defaultConversation },
    "program-portfolio": { ...defaultConversation },
    "sponsor-funding": { ...defaultConversation },
    "risk-compliance": { ...defaultConversation },
    "government-relations": { ...defaultConversation },
  });

  const addMessage = useCallback((schema: SchemaType, message: ChatMessage) => {
    setConversations((prev) => ({
      ...prev,
      [schema]: {
        ...prev[schema],
        messages: [...prev[schema].messages, message],
      },
    }));
  }, []);

  const updateMessage = useCallback(
    (schema: SchemaType, messageId: string, updates: Partial<ChatMessage>) => {
      setConversations((prev) => ({
        ...prev,
        [schema]: {
          ...prev[schema],
          messages: prev[schema].messages.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
        },
      }));
    },
    []
  );

  const setConversationId = useCallback((schema: SchemaType, conversationId: string) => {
    setConversations((prev) => ({
      ...prev,
      [schema]: {
        ...prev[schema],
        conversationId,
      },
    }));
  }, []);

  const clearConversation = useCallback((schema: SchemaType) => {
    setConversations((prev) => ({
      ...prev,
      [schema]: { ...defaultConversation },
    }));
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        currentSchema,
        setCurrentSchema,
        conversations,
        addMessage,
        updateMessage,
        setConversationId,
        clearConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

