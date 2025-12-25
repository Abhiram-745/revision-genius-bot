import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Plus, X, Upload, Loader2, Image, ClipboardList, BookOpen, Check, FileText, File, Trash2, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Subject, Topic } from "../OnboardingWizard";
import { TopicChatInterface } from "./TopicChatInterface";
import { DraggableTopicList } from "./DraggableTopicList";
import { processFiles, ProcessedFile, batchItems } from "@/utils/fileExtractor";

interface SmartTopicsStepProps {
  subjects: Subject[];
  topics: Topic[];
  setTopics: (topics: Topic[]) => void;
}

type ExtractionMode = "exact" | "general";

interface QueuedNote {
  id: string;
  content: string;
}

const SmartTopicsStep = ({ subjects, topics, setTopics }: SmartTopicsStepProps) => {
  const [activeTab, setActiveTab] = useState("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [manualTopic, setManualTopic] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || subjects[0]?.name || "");
  const [isDragging, setIsDragging] = useState(false);
  const [extractionMode, setExtractionMode] = useState<ExtractionMode>("exact");
  
  // Multi-file and notes state
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [queuedNotes, setQueuedNotes] = useState<QueuedNote[]>([]);
  const [newNote, setNewNote] = useState("");

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    addFilesToQueue(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      addFilesToQueue(Array.from(files));
    }
    // Reset input
    e.target.value = '';
  };

  const addFilesToQueue = (files: File[]) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif'
    ];
    
    const validFiles = files.filter(f => {
      const isValid = validTypes.some(t => f.type === t) || 
                      f.name.endsWith('.md') || 
                      f.name.endsWith('.txt') ||
                      f.name.endsWith('.pdf') ||
                      f.name.endsWith('.docx');
      if (!isValid) {
        toast.error(`${f.name} is not a supported file type`);
      }
      if (f.size > 20 * 1024 * 1024) {
        toast.error(`${f.name} is too large. Maximum size is 20MB.`);
        return false;
      }
      return isValid;
    });

    setQueuedFiles(prev => [...prev, ...validFiles]);
    if (validFiles.length > 0) {
      toast.success(`Added ${validFiles.length} file(s) to queue`);
    }
  };

  const removeFileFromQueue = (index: number) => {
    setQueuedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: QueuedNote = {
      id: `note-${Date.now()}`,
      content: newNote.trim()
    };
    setQueuedNotes(prev => [...prev, note]);
    setNewNote("");
    toast.success("Note added to queue");
  };

  const removeNote = (id: string) => {
    setQueuedNotes(prev => prev.filter(n => n.id !== id));
  };

  const processQueue = async () => {
    if (queuedFiles.length === 0 && queuedNotes.length === 0) {
      toast.error("Please add files or notes to process");
      return;
    }

    if (!selectedSubject) {
      toast.error("Please select a subject first");
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Preparing files...");

    try {
      // Process files to extract content
      let processedFiles: ProcessedFile[] = [];
      if (queuedFiles.length > 0) {
        setProcessingStatus(`Processing ${queuedFiles.length} file(s)...`);
        processedFiles = await processFiles(queuedFiles);
      }

      // Separate images and text documents
      const images = processedFiles.filter(f => f.type === 'image').map(f => f.dataUrl);
      const documentTexts = processedFiles
        .filter(f => f.type === 'document' && f.text)
        .map(f => ({ name: f.name, text: f.text! }));
      
      // Add notes to document texts
      const noteTexts = queuedNotes.map((n, i) => ({ 
        name: `Note ${i + 1}`, 
        text: n.content 
      }));
      
      const allTexts = [...documentTexts, ...noteTexts];
      
      // Calculate total items for batching
      const totalItems = images.length + allTexts.length;
      const BATCH_SIZE = 10;
      
      let extractedCount = 0;
      const subjectName = subjects.find(s => (s.id || s.name) === selectedSubject)?.name || selectedSubject;

      if (totalItems > BATCH_SIZE) {
        // Batch processing
        const imageBatches = batchItems(images, BATCH_SIZE);
        const textBatches = batchItems(allTexts, BATCH_SIZE);
        const totalBatches = imageBatches.length + textBatches.length;
        let currentBatch = 0;

        // Process image batches
        for (const imageBatch of imageBatches) {
          currentBatch++;
          setProcessingStatus(`Processing batch ${currentBatch}/${totalBatches}...`);
          
          const count = await callParseTopics({
            images: imageBatch,
            subjectName,
            extractionMode
          });
          extractedCount += count;
        }

        // Process text batches
        for (const textBatch of textBatches) {
          currentBatch++;
          setProcessingStatus(`Processing batch ${currentBatch}/${totalBatches}...`);
          
          const combinedText = textBatch.map(t => `--- ${t.name} ---\n${t.text}`).join('\n\n');
          const count = await callParseTopics({
            text: combinedText,
            subjectName,
            extractionMode
          });
          extractedCount += count;
        }
      } else {
        // Single batch processing
        setProcessingStatus("Extracting topics...");
        
        const combinedText = allTexts.length > 0 
          ? allTexts.map(t => `--- ${t.name} ---\n${t.text}`).join('\n\n')
          : undefined;

        extractedCount = await callParseTopics({
          images: images.length > 0 ? images : undefined,
          text: combinedText,
          subjectName,
          extractionMode
        });
      }

      if (extractedCount > 0) {
        toast.success(`Extracted ${extractedCount} topics!`);
        // Clear queue on success
        setQueuedFiles([]);
        setQueuedNotes([]);
      } else {
        toast.warning("No topics found. Try clearer documents or different content.");
      }
    } catch (error) {
      console.error("Error processing queue:", error);
      toast.error("Failed to extract topics. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const callParseTopics = async (params: {
    images?: string[];
    text?: string;
    notes?: string[];
    subjectName: string;
    extractionMode: ExtractionMode;
  }): Promise<number> => {
    const { images, text, notes, subjectName, extractionMode } = params;

    const { data, error } = await supabase.functions.invoke("parse-topics", {
      body: { 
        text,
        subjectName,
        images,
        notes,
        extractionMode,
      },
    });

    if (error) {
      console.error("Parse error:", error);
      throw error;
    }

    if (data?.topics && Array.isArray(data.topics) && data.topics.length > 0) {
      const newTopics: Topic[] = data.topics.map((t: any) => ({
        id: `topic-${Date.now()}-${Math.random()}`,
        subject_id: selectedSubject,
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
        return uniqueNewTopics.length;
      }
    }

    return 0;
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type === 'application/pdf') return <FileText className="w-4 h-4 text-red-500" />;
    if (file.type.includes('document') || file.name.endsWith('.docx')) return <FileText className="w-4 h-4 text-blue-500" />;
    return <File className="w-4 h-4" />;
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
              {/* Subject Selection */}
              <div className="space-y-2">
                <Label>Select Subject for Extraction</Label>
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
                    <div className="p-4 rounded-full bg-muted">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">Drag & drop files</p>
                      <p className="text-xs text-muted-foreground">
                        or click to select multiple files
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="gap-1">
                        <FileText className="w-3 h-3" /> PDF
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <FileText className="w-3 h-3" /> DOCX
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <File className="w-3 h-3" /> TXT, MD
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Image className="w-3 h-3" /> Images
                      </Badge>
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.webp,.gif"
                        onChange={handleFileSelect}
                        className="hidden"
                        multiple
                      />
                      <Button variant="outline" className="pointer-events-none">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Queued Files */}
              {queuedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Files to process ({queuedFiles.length})</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {queuedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {getFileIcon(file)}
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(0)}KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => removeFileFromQueue(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <StickyNote className="w-4 h-4" />
                  Add Notes (optional)
                </Label>
                <div className="flex gap-2">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Paste or type notes here..."
                    className="min-h-[80px]"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addNote}
                  disabled={!newNote.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Note
                </Button>
              </div>

              {/* Queued Notes */}
              {queuedNotes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Notes to process ({queuedNotes.length})</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {queuedNotes.map((note) => (
                      <div key={note.id} className="flex items-start justify-between p-2 bg-muted rounded-lg">
                        <p className="text-sm line-clamp-2 flex-1">{note.content}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 ml-2"
                          onClick={() => removeNote(note.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Process Button */}
              <Button
                onClick={processQueue}
                disabled={isProcessing || (queuedFiles.length === 0 && queuedNotes.length === 0)}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {processingStatus || "Processing..."}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Extract Topics ({queuedFiles.length + queuedNotes.length} items)
                  </>
                )}
              </Button>
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
              <Trash2 className="w-4 h-4 mr-1" />
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
