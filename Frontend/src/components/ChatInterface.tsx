import { useState } from 'react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  confidence?: number;
}

interface Props {
  documentContext?: string; // made optional
}

export const ChatInterface = ({ documentContext }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    if (!documentContext) {
      // No document uploaded yet
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          content: "⚠️ Please upload a document before asking questions.",
          confidence: 0,
        },
      ]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/ask", {
        question: inputValue.trim(),
        context: documentContext.trim(),
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.data.answer || "No response from AI.",
        confidence: response.data.confidence ?? 100,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: "⚠️ Unable to connect to the backend. Please try again.",
          confidence: 0,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="card-elevated w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-xl font-bold text-foreground">
          <Bot className="h-6 w-6 text-primary" />
          <span>AI Legal Assistant</span>
        </CardTitle>
        <p className="text-muted-foreground">
          Ask questions about your uploaded document
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="min-h-[300px] max-h-[500px] overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-xl">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>{documentContext ? "Start a conversation by asking about your document" : "Upload a PDF document to start chatting."}</p>
              {documentContext && (
                <p className="text-sm mt-2">
                  Try: "What are the main risks in this contract?" or "Explain the termination clause"
                </p>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'ai' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}

                <div className={`${message.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>

                  {message.type === 'ai' && message.confidence !== undefined && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Confidence: {message.confidence}%
                        </span>
                        {message.confidence < 70 && (
                          <div className="flex items-center space-x-1 text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            <span>Consult a lawyer</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-gradient-primary h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${message.confidence}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="chat-bubble-ai">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this document..."
            className="flex-1"
            disabled={isLoading || !documentContext} // disable input if no document
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading || !documentContext} // disable send if no document
            className="btn-hero px-6"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
