import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, Check, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Subject, Topic } from '../OnboardingWizard';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedTopics?: Topic[];
  isLoading?: boolean;
}

interface TopicChatInterfaceProps {
  subjects: Subject[];
  topics: Topic[];
  setTopics: (topics: Topic[]) => void;
  onApprove?: () => void;
}

export function TopicChatInterface({ subjects, topics, setTopics, onApprove }: TopicChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTopics, setPendingTopics] = useState<Topic[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send initial greeting based on subjects
  useEffect(() => {
    if (messages.length === 0 && subjects.length > 0) {
      const subjectNames = subjects.map(s => s.name).join(', ');
      const greeting: ChatMessage = {
        id: 'greeting',
        role: 'assistant',
        content: `Hi! I'll help you create a topic structure for your subjects: **${subjectNames}**.\n\nYou can:\n- Ask me to generate topics (e.g., "Generate topics for all my subjects")\n- Be specific (e.g., "Add topics for Cell Biology")\n- Upload a syllabus or specification document above\n\nWhat would you like to do?`
      };
      setMessages([greeting]);
    }
  }, [subjects, messages.length]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue.trim()
    };

    const loadingMessage: ChatMessage = {
      id: 'loading',
      role: 'assistant',
      content: '',
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('topic-chat', {
        body: {
          message: inputValue.trim(),
          subjects: subjects.map(s => ({
            id: s.id || s.name,
            name: s.name,
            examBoard: s.exam_board,
            examType: s.mode
          })),
          existingTopics: topics,
          conversationHistory: messages.filter(m => !m.isLoading).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      // Convert AI-suggested topics to use subject_id
      const convertedTopics = (data.suggestedTopics || []).map((t: any) => ({
        id: t.id || crypto.randomUUID(),
        name: t.name,
        subject_id: t.subjectId || t.subject_id,
        confidence: t.confidence || 50
      }));

      const aiResponse: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        suggestedTopics: convertedTopics
      };

      setMessages(prev => prev.filter(m => m.id !== 'loading').concat(aiResponse));
      
      if (convertedTopics.length > 0) {
        setPendingTopics(convertedTopics);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response');
      setMessages(prev => prev.filter(m => m.id !== 'loading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTopics = () => {
    if (pendingTopics.length > 0) {
      // Merge pending topics with existing, avoiding duplicates
      const existingNames = new Set(topics.map(t => `${t.subject_id}-${t.name.toLowerCase()}`));
      const newTopics = pendingTopics.filter(
        t => !existingNames.has(`${t.subject_id}-${t.name.toLowerCase()}`)
      );
      
      setTopics([...topics, ...newTopics]);
      setPendingTopics([]);
      
      toast.success(`Added ${newTopics.length} topics!`);
      
      const confirmMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `✅ Great! I've added ${newTopics.length} topics to your list. You can:\n- Ask me to add more topics\n- Request changes to specific topics\n- Drag and drop to reorder them below\n- Or proceed to the next step when you're ready!`
      };
      setMessages(prev => [...prev, confirmMessage]);
    }
  };

  const handleRegenerateTopics = async () => {
    setInputValue('Please generate a different set of topics');
    // Wait a tick then trigger send
    setTimeout(() => {
      const input = inputRef.current;
      if (input) {
        input.form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => (s.id || s.name) === subjectId)?.name || 'Unknown';
  };

  const groupedPendingTopics = pendingTopics.reduce((acc, topic) => {
    if (!acc[topic.subject_id]) {
      acc[topic.subject_id] = [];
    }
    acc[topic.subject_id].push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

  return (
    <div className="flex flex-col h-[400px] border rounded-lg bg-background">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                ) : (
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content.split('**').map((part, i) => 
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Pending Topics Preview */}
          {pendingTopics.length > 0 && (
            <Card className="p-4 border-primary/50 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Suggested Topics ({pendingTopics.length})</span>
              </div>
              
              <div className="space-y-3 mb-4">
                {Object.entries(groupedPendingTopics).map(([subjectId, subjectTopics]) => (
                  <div key={subjectId}>
                    <Badge variant="outline" className="mb-2">{getSubjectName(subjectId)}</Badge>
                    <div className="flex flex-wrap gap-1.5 ml-2">
                      {subjectTopics.slice(0, 8).map((topic) => (
                        <Badge key={topic.id} variant="secondary" className="text-xs">
                          {topic.name}
                        </Badge>
                      ))}
                      {subjectTopics.length > 8 && (
                        <Badge variant="secondary" className="text-xs">
                          +{subjectTopics.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleApproveTopics} size="sm" className="flex-1">
                  <Check className="w-4 h-4 mr-1" />
                  Add These Topics
                </Button>
                <Button onClick={handleRegenerateTopics} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Different
                </Button>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t bg-muted/30"
      >
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me to generate topics..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Try: "Generate topics for Biology" or "Add advanced calculus topics"
        </p>
      </form>
    </div>
  );
}
