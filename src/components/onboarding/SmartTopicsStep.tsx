import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Plus, X, Upload, Loader2, Image, ClipboardList, BookOpen, Check } from "lucide-react";
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

type ExtractionMode = "exact" | "general";

const SmartTopicsStep = ({ subjects, topics, setTopics }: SmartTopicsStepProps) => {
  const [activeTab, setActiveTab] = useState("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualTopic, setManualTopic] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || subjects[0]?.name || "");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string } | null>(null);
  const [extractionMode, setExtractionMode] = useState<ExtractionMode>("exact");

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
    const isImage = file.type.startsWith('image/');
    
    // Currently only support images for topic extraction
    if (!isImage) {
      toast.error("Topic extraction currently supports images only (PNG, JPG). Please take a screenshot of your document.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    setIsProcessing(true);
    setUploadedFile({ name: file.name, type: file.type });

    try {
      // Convert file to full data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          console.log('Image data URL created:', result.substring(0, 100));
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const images = [dataUrl];
      let extractedCount = 0;
      
      // Process for each subject
      for (const subject of subjects) {
        const subjectId = subject.id || subject.name;
        
        console.log('Sending to parse-topics:', { 
          subjectName: subject.name, 
          imagesCount: images.length,
          imagePreview: images[0].substring(0, 80),
          extractionMode
        });
        
        const { data, error } = await supabase.functions.invoke("parse-topics", {
          body: { 
            text: extractionMode === "exact" 
              ? `Extract all topics EXACTLY as written in this image for ${subject.name}. Copy every topic word-for-word.`
              : `Identify the main concepts and learning topics from this educational material for ${subject.name}.`,
            subjectName: subject.name,
            images: images,
            extractionMode: extractionMode,
          },
        });

        console.log('parse-topics response:', { data, error });

        if (error) {
          console.error("Parse error for", subject.name, error);
          continue;
        }

        if (data?.topics && Array.isArray(data.topics) && data.topics.length > 0) {
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
            extractedCount += uniqueNewTopics.length;
          }
        }
      }

      if (extractedCount > 0) {
        toast.success(`Extracted ${extractedCount} topics from ${file.name}!`);
      } else {
        toast.warning("No topics found in the image. Try a clearer screenshot.");
      }
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
  }, [subjects, topics, extractionMode]);

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
              {/* Extraction Mode Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">How should we extract topics?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Exact Topics Mode */}
                  <button
                    type="button"
                    onClick={() => setExtractionMode("exact")}
                    className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                      extractionMode === "exact"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                  >
                    {extractionMode === "exact" && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardList className="w-5 h-5 text-primary" />
                      <span className="font-medium">Exact Topics</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Best for:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      <li>• Exam specifications</li>
                      <li>• Topic checklists</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Extracts exactly as written
                    </p>
                  </button>

                  {/* General Topics Mode */}
                  <button
                    type="button"
                    onClick={() => setExtractionMode("general")}
                    className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                      extractionMode === "general"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                  >
                    {extractionMode === "general" && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span className="font-medium">General Topics</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Best for:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      <li>• Lesson presentations</li>
                      <li>• Study notes</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Extracts concepts from content
                    </p>
                  </button>
                </div>
              </div>

              {/* File Upload Area */}
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
                          <p className="text-xs text-muted-foreground">
                            Extracting topics ({extractionMode === "exact" ? "exact mode" : "general mode"})
                          </p>
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
                            {extractionMode === "exact" 
                              ? "Upload an exam spec or checklist image"
                              : "Upload lesson slides or notes image"}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="gap-1">
                            <Image className="w-3 h-3" /> PNG, JPG
                          </Badge>
                        </div>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,.webp"
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