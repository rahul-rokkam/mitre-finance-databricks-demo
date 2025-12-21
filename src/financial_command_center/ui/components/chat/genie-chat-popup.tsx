import { useState, useRef, useEffect } from "react";
import { useChat, getSchemaDisplayName, type SchemaType } from "./chat-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  MessageCircle,
  Send,
  Loader2,
  Sparkles,
  X,
  RotateCcw,
  Database,
  Code,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface GenieMessageResponse {
  conversation_id: string;
  message_id: string;
  response: string;
  status: "pending" | "completed" | "failed";
  query_result?: {
    columns: string[];
    rows: unknown[][];
    sql?: string;
  };
  error?: string;
}

function ChatMessage({
  role,
  content,
  sql,
  queryResult,
  status,
  error,
}: {
  role: "user" | "assistant";
  content: string;
  sql?: string;
  queryResult?: { columns: string[]; rows: unknown[][] };
  status?: "pending" | "completed" | "failed";
  error?: string;
}) {
  const [showSql, setShowSql] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const isUser = role === "user";
  const isPending = status === "pending";

  return (
    <div
      className={cn(
        "flex w-full gap-3 p-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/50 border border-border/50"
        )}
      >
        {isPending ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </div>
        ) : error ? (
          <div className="text-destructive text-sm">{error}</div>
        ) : (
          <>
            <p className="text-sm whitespace-pre-wrap">{content}</p>
            
            {sql && (
              <div className="mt-3 border-t border-border/30 pt-3">
                <button
                  onClick={() => setShowSql(!showSql)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Code className="h-3 w-3" />
                  <span>SQL Query</span>
                  {showSql ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                {showSql && (
                  <pre className="mt-2 p-3 bg-background/80 rounded-lg text-xs overflow-x-auto border border-border/30">
                    <code>{sql}</code>
                  </pre>
                )}
              </div>
            )}
            
            {queryResult && queryResult.columns.length > 0 && (
              <div className="mt-3 border-t border-border/30 pt-3">
                <button
                  onClick={() => setShowResults(!showResults)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Database className="h-3 w-3" />
                  <span>Results ({queryResult.rows.length} rows)</span>
                  {showResults ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                {showResults && (
                  <div className="mt-2 overflow-x-auto rounded-lg border border-border/30">
                    <table className="w-full text-xs">
                      <thead className="bg-background/80">
                        <tr>
                          {queryResult.columns.map((col, i) => (
                            <th
                              key={i}
                              className="px-3 py-2 text-left font-medium text-muted-foreground border-b border-border/30"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.rows.slice(0, 10).map((row, i) => (
                          <tr key={i} className="border-b border-border/20 last:border-0">
                            {row.map((cell, j) => (
                              <td key={j} className="px-3 py-2 text-foreground">
                                {String(cell ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {queryResult.rows.length > 10 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground bg-background/50 border-t border-border/30">
                        Showing 10 of {queryResult.rows.length} rows
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
          <span className="text-xs font-medium text-white">You</span>
        </div>
      )}
    </div>
  );
}

function EmptyState({ schema }: { schema: SchemaType }) {
  const displayName = getSchemaDisplayName(schema);
  
  const suggestions: Record<SchemaType, string[]> = {
    "financial-health": [
      "What is our current revenue vs budget?",
      "Show me the top 5 programs by margin",
      "What's our cash position trend?",
    ],
    "program-portfolio": [
      "Which programs have the highest allocation?",
      "Show sponsor distribution across FFRDCs",
      "What's the program health by category?",
    ],
    "sponsor-funding": [
      "What's our funding efficiency by sponsor?",
      "Show stewardship metrics trend",
      "Which sponsors have the best experience scores?",
    ],
    "risk-compliance": [
      "What are the open audit findings?",
      "Show concentration risk by category",
      "List control exceptions by severity",
    ],
    "government-relations": [
      "What's our market share by agency?",
      "Show win/loss ratio trend",
      "What capability gaps need attention?",
    ],
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 mb-4">
        <Sparkles className="h-8 w-8 text-violet-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Ask about {displayName}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        I can help you explore and analyze your {displayName.toLowerCase()} data using natural language.
      </p>
      <div className="w-full space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Try asking:</p>
        {suggestions[schema].map((suggestion, i) => (
          <button
            key={i}
            className="w-full p-3 text-left text-sm rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            "{suggestion}"
          </button>
        ))}
      </div>
    </div>
  );
}

export function GenieChatPopup() {
  const {
    isOpen,
    setIsOpen,
    currentSchema,
    conversations,
    addMessage,
    updateMessage,
    setConversationId,
    clearConversation,
  } = useChat();

  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversation = currentSchema ? conversations[currentSchema] : null;
  const messages = conversation?.messages ?? [];
  const conversationId = conversation?.conversationId ?? null;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ schema, message }: { schema: SchemaType; message: string }) => {
      const response = await axios.post<GenieMessageResponse>("/api/genie/message", {
        schema_name: schema,
        message,
        conversation_id: conversationId,
      });
      return response.data;
    },
    onMutate: ({ schema, message }) => {
      const userMessageId = `user-${Date.now()}`;
      const assistantMessageId = `assistant-${Date.now()}`;

      addMessage(schema, {
        id: userMessageId,
        role: "user",
        content: message,
      });

      addMessage(schema, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        status: "pending",
      });

      return { assistantMessageId };
    },
    onSuccess: (data, { schema }, context) => {
      if (!context) return;

      if (!conversationId && data.conversation_id) {
        setConversationId(schema, data.conversation_id);
      }

      updateMessage(schema, context.assistantMessageId, {
        content: data.response || "I found the results for your query.",
        status: data.status,
        sql: data.query_result?.sql,
        queryResult: data.query_result
          ? { columns: data.query_result.columns, rows: data.query_result.rows }
          : undefined,
        error: data.error,
      });
    },
    onError: (error, { schema }, context) => {
      if (!context) return;

      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.detail || error.message
        : "An unexpected error occurred";

      updateMessage(schema, context.assistantMessageId, {
        content: "",
        status: "failed",
        error: errorMessage,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentSchema || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({ schema: currentSchema, message: input.trim() });
    setInput("");
  };

  const handleClearConversation = () => {
    if (currentSchema) {
      clearConversation(currentSchema);
    }
  };

  if (!currentSchema) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="w-[450px] sm:max-w-[450px] p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-4 py-4 border-b bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <SheetTitle className="text-base">Genie Assistant</SheetTitle>
                <SheetDescription className="text-xs">
                  {getSchemaDisplayName(currentSchema)}
                </SheetDescription>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearConversation}
                className="h-8 w-8"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
          <div ref={scrollAreaRef} className="min-h-full">
            {messages.length === 0 ? (
              <EmptyState schema={currentSchema} />
            ) : (
              <div className="flex flex-col">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    sql={message.sql}
                    queryResult={message.queryResult}
                    status={message.status}
                    error={message.error}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <form
          onSubmit={handleSubmit}
          className="p-4 border-t bg-background/95 backdrop-blur"
        >
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your data..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || sendMessageMutation.isPending}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function GenieChatButton({ schema }: { schema: SchemaType }) {
  const { setIsOpen, setCurrentSchema, isOpen, currentSchema } = useChat();

  const handleClick = () => {
    if (isOpen && currentSchema === schema) {
      setIsOpen(false);
    } else {
      setCurrentSchema(schema);
      setIsOpen(true);
    }
  };

  const isActive = isOpen && currentSchema === schema;

  return (
    <Button
      onClick={handleClick}
      size="icon"
      variant={isActive ? "default" : "outline"}
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 transition-all duration-300",
        isActive
          ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 border-0"
          : "bg-background hover:bg-accent border-2 border-border"
      )}
    >
      {isActive ? (
        <X className="h-6 w-6 text-white" />
      ) : (
        <MessageCircle className="h-6 w-6" />
      )}
    </Button>
  );
}

