import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Plus, X, Upload, Loader2, FileText, Image, File } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Subject, Topic } from "../OnboardingWizard";
import { TopicChatInterface } from "./TopicChatInterface";
import { DraggableTopicList } from "./DraggableTopicList";

interface SmartTopicsStepProps {
  subjects: Subject[];
  topics: Topic[];
  setTopics: (topics: Topic[]) => void;
}

const SmartTopicsStep = ({ subjects, topics, setTopics }: SmartTopicsStepProps) => {
  const [activeTab, setActiveTab] = useState("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualTopic, setManualTopic] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || subjects[0]?.name || "");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string } | null>(null);

  const handleAddManualTopic = () => {
    if (!manualTopic.trim() || !selectedSubject) return;

    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      subject_id: selectedSubject,
      name: manualTopic.trim(),
      confidence: 50,
    };

    // Check for duplicates
    const exists = topics.some(
      t => t.subject_id === selectedSubject && t.name.toLowerCase() === manualTopic.trim().toLowerCase()
    );

    if (exists) {
      toast.error("This topic already exists for this subject");
      return;
    }

    setTopics([...topics, newTopic]);
    setManualTopic("");
    toast.success("Topic added!");
  };

  // Document upload handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    const validTypes = [
      'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Unsupported file type. Please upload PNG, JPG, PDF, or DOCX files.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    setIsProcessing(true);
    setUploadedFile({ name: file.name, type: file.type });

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const isImage = file.type.startsWith('image/');
      
      // Process for each subject
      for (const subject of subjects) {
        const subjectId = subject.id || subject.name;
        
        const { data, error } = await supabase.functions.invoke("parse-topics", {
          body: { 
            subjectName: subject.name,
            images: isImage ? [{ data: base64, type: file.type }] : undefined,
          },
        });

        if (error) {
          console.error("Parse error for", subject.name, error);
          continue;
        }

        if (data?.topics && Array.isArray(data.topics)) {
          const newTopics: Topic[] = data.topics.map((t: any) => ({
            id: `topic-${Date.now()}-${Math.random()}`,
            subject_id: subjectId,
            name: typeof t === 'string' ? t : t.name,
            confidence: typeof t === 'object' && t.confidence ? t.confidence : 50,
          }));

          // Avoid duplicates
          const existingNames = new Set(topics.map(t => `${t.subject_id}-${t.name.toLowerCase()}`));
          const uniqueNewTopics = newTopics.filter(
            t => !existingNames.has(`${t.subject_id}-${t.name.toLowerCase()}`)
          );

          if (uniqueNewTopics.length > 0) {
            setTopics([...topics, ...uniqueNewTopics]);
          }
        }
      }

      toast.success(`Topics extracted from ${file.name}!`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to extract topics from document");
    } finally {
      setIsProcessing(false);
      setUploadedFile(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [subjects, topics]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Input Section */}
      <Card>
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Manual
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <Card className={`border-2 border-dashed transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}>
                <CardContent className="p-6">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="flex flex-col items-center justify-center text-center space-y-4"
                  >
                    {isProcessing ? (
                      <>
                        <div className="p-4 rounded-full bg-primary/10">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">Processing {uploadedFile?.name}...</p>
                          <p className="text-xs text-muted-foreground">Extracting topics with AI</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 rounded-full bg-muted">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">Drag & drop your document</p>
                          <p className="text-xs text-muted-foreground">
                            Upload an exam spec, checklist, or screenshot
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="gap-1">
                            <Image className="w-3 h-3" /> PNG, JPG
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <FileText className="w-3 h-3" /> PDF
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <File className="w-3 h-3" /> DOCX
                          </Badge>
                        </div>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.webp,.docx"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <Button variant="outline" className="pointer-events-none">
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </Button>
                        </label>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Chat Tab */}
            <TabsContent value="chat">
              <TopicChatInterface
                subjects={subjects}
                topics={topics}
                setTopics={setTopics}
              />
            </TabsContent>

            {/* Manual Add Tab */}
            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id || subject.name} value={subject.id || subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Topic Name</Label>
                  <div className="flex gap-2">
                    <Input
                      value={manualTopic}
                      onChange={(e) => setManualTopic(e.target.value)}
                      placeholder="Enter topic name..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddManualTopic();
                        }
                      }}
                    />
                    <Button onClick={handleAddManualTopic} disabled={!manualTopic.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Topics List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Your Topics ({topics.length})</h3>
          {topics.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTopics([])}
              className="text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        
        <DraggableTopicList
          subjects={subjects}
          topics={topics}
          setTopics={setTopics}
        />
      </div>
    </div>
  );
};

export default SmartTopicsStep;
