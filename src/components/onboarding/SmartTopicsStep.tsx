import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Plus, X, Upload, Loader2, Brain, ChevronDown, ChevronUp, FileText, Image, File } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Subject, Topic } from "../OnboardingWizard";

interface SmartTopicsStepProps {
  subjects: Subject[];
  topics: Topic[];
  setTopics: (topics: Topic[]) => void;
}

const SmartTopicsStep = ({ subjects, topics, setTopics }: SmartTopicsStepProps) => {
  const [activeTab, setActiveTab] = useState("ai");
  const [pasteContent, setPasteContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualTopic, setManualTopic] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || "");
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>(subjects.map(s => s.id || ""));
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string } | null>(null);

  const handleAIParse = async () => {
    if (!pasteContent.trim()) {
      toast.error("Please paste your specification or topic list");
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-topics", {
        body: { 
          content: pasteContent,
          subjects: subjects.map(s => ({ id: s.id, name: s.name, exam_board: s.exam_board }))
        },
      });

      if (error) throw error;

      if (data?.topics && Array.isArray(data.topics)) {
        const newTopics = data.topics.map((t: any) => ({
          id: `topic-${Date.now()}-${Math.random()}`,
          subject_id: t.subject_id || subjects[0]?.id,
          name: t.name,
          confidence: 50,
        }));
        setTopics([...topics, ...newTopics]);
        setPasteContent("");
        toast.success(`Added ${newTopics.length} topics`);
      }
    } catch (error) {
      console.error("Error parsing topics:", error);
      toast.error("Failed to parse topics. Try adding them manually.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddManualTopic = () => {
    if (!manualTopic.trim() || !selectedSubject) return;

    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      subject_id: selectedSubject,
      name: manualTopic.trim(),
      confidence: 50,
    };
    setTopics([...topics, newTopic]);
    setManualTopic("");
  };

  const handleRemoveTopic = (topicId: string) => {
    setTopics(topics.filter(t => t.id !== topicId));
  };

  const handleConfidenceChange = (topicId: string, confidence: number) => {
    setTopics(topics.map(t => 
      t.id === topicId ? { ...t, confidence } : t
    ));
  };

  const toggleSubjectExpanded = (subjectId: string) => {
    setExpandedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const getSubjectTopics = (subjectId: string) => 
    topics.filter(t => t.subject_id === subjectId);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return "text-green-500";
    if (confidence >= 40) return "text-amber-500";
    return "text-red-500";
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
      
      const { data, error } = await supabase.functions.invoke("parse-topics", {
        body: { 
          content: isImage ? `Extract topics from this ${file.type} image file named "${file.name}"` : `Extract topics from this document: ${file.name}`,
          subjects: subjects.map(s => ({ id: s.id, name: s.name, exam_board: s.exam_board })),
          images: isImage ? [{ data: base64, mimeType: file.type }] : undefined,
          documentBase64: !isImage ? base64 : undefined,
          documentType: file.type,
          documentName: file.name,
        },
      });

      if (error) throw error;

      if (data?.topics && Array.isArray(data.topics)) {
        const newTopics = data.topics.map((t: any) => ({
          id: `topic-${Date.now()}-${Math.random()}`,
          subject_id: t.subject_id || subjects[0]?.id,
          name: t.name,
          confidence: 50,
        }));
        setTopics([...topics, ...newTopics]);
        toast.success(`Extracted ${newTopics.length} topics from ${file.name}`);
      } else {
        toast.error("No topics found in the document");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to extract topics from document. Try the text input instead.");
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

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
    if (type === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-primary" />;
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="w-4 h-4" />
            AI Import
          </TabsTrigger>
          <TabsTrigger value="document" className="gap-2">
            <Upload className="w-4 h-4" />
            Document
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <Plus className="w-4 h-4" />
            Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4 mt-4">
          <Card className="border-secondary/30 bg-secondary/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-secondary" />
                <Label className="font-medium">Paste your specification or topic list</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste your exam specification, checklist, or just type topics. Our AI will extract and organize them automatically.
              </p>
              <Textarea
                placeholder="Paste your topics here... e.g., 'Quadratic equations, Photosynthesis, The Cold War, Romeo and Juliet themes...'"
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                className="min-h-[120px] text-sm"
              />
              <Button
                onClick={handleAIParse}
                disabled={isProcessing || !pasteContent.trim()}
                className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:opacity-90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Extract Topics with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="document" className="space-y-4 mt-4">
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

        <TabsContent value="manual" className="space-y-4 mt-4">
          <Card className="border-dashed">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Topic name (e.g., Quadratic Equations)"
                    value={manualTopic}
                    onChange={(e) => setManualTopic(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddManualTopic()}
                  />
                </div>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleAddManualTopic}
                disabled={!manualTopic.trim() || !selectedSubject}
                className="w-full"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Topic
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Topics by Subject with Confidence */}
      {topics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Your Topics ({topics.length})</Label>
            <p className="text-xs text-muted-foreground">Adjust confidence for each topic</p>
          </div>
          
          <ScrollArea className="h-[280px]">
            <div className="space-y-3 pr-4">
              {subjects.map((subject) => {
                const subjectTopics = getSubjectTopics(subject.id || "");
                if (subjectTopics.length === 0) return null;

                const isExpanded = expandedSubjects.includes(subject.id || "");

                return (
                  <Card key={subject.id} className="border-border/50">
                    <button
                      type="button"
                      onClick={() => toggleSubjectExpanded(subject.id || "")}
                      className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{subject.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {subjectTopics.length} topics
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <CardContent className="p-3 pt-0 space-y-2">
                        {subjectTopics.map((topic) => (
                          <div
                            key={topic.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{topic.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Slider
                                  value={[topic.confidence || 50]}
                                  onValueChange={([val]) => handleConfidenceChange(topic.id!, val)}
                                  max={100}
                                  step={10}
                                  className="flex-1"
                                />
                                <span className={`text-xs font-medium w-8 ${getConfidenceColor(topic.confidence || 50)}`}>
                                  {topic.confidence || 50}%
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                              onClick={() => handleRemoveTopic(topic.id!)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default SmartTopicsStep;
