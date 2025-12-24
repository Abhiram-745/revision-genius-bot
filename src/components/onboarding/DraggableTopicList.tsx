import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { GripVertical, Trash2, ChevronDown, ChevronRight, Pencil, Check, X, Sparkles } from 'lucide-react';
import { Subject, Topic } from '../OnboardingWizard';

interface DraggableTopicListProps {
  subjects: Subject[];
  topics: Topic[];
  setTopics: (topics: Topic[]) => void;
}

interface SortableTopicProps {
  topic: Topic;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string) => void;
  onConfidenceChange: (id: string, confidence: number) => void;
}

function SortableTopic({ topic, onRemove, onEdit, onConfidenceChange }: SortableTopicProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(topic.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id || topic.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onEdit(topic.id || topic.name, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(topic.name);
    setIsEditing(false);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600';
    if (confidence >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 70) return 'Strong';
    if (confidence >= 40) return 'Medium';
    return 'Weak';
  };

  const confidenceValue = topic.confidence ?? 50;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 p-2 rounded-md bg-background border ${
        isDragging ? 'shadow-lg ring-2 ring-primary' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="h-8 text-sm"
            autoFocus
          />
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave}>
            <Check className="w-3 h-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancel}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm break-words whitespace-normal leading-tight min-w-0">{topic.name}</span>
          
          <div className="flex items-center gap-2 min-w-[120px] flex-shrink-0">
            <Slider
              value={[confidenceValue]}
              onValueChange={([value]) => onConfidenceChange(topic.id || topic.name, value)}
              max={100}
              step={10}
              className="w-14"
            />
            <span className={`text-xs w-10 flex-shrink-0 ${getConfidenceColor(confidenceValue)}`}>
              {getConfidenceLabel(confidenceValue)}
            </span>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="w-3 h-3" />
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onRemove(topic.id || topic.name)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </>
      )}
    </div>
  );
}

export function DraggableTopicList({ subjects, topics, setTopics }: DraggableTopicListProps) {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set(subjects.map(s => s.id || s.name))
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, subjectId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const subjectTopics = topics.filter(t => t.subject_id === subjectId);
      const otherTopics = topics.filter(t => t.subject_id !== subjectId);
      
      const oldIndex = subjectTopics.findIndex(t => (t.id || t.name) === active.id);
      const newIndex = subjectTopics.findIndex(t => (t.id || t.name) === over.id);
      
      const reorderedSubjectTopics = arrayMove(subjectTopics, oldIndex, newIndex);
      setTopics([...otherTopics, ...reorderedSubjectTopics]);
    }
  };

  const handleRemoveTopic = (id: string) => {
    setTopics(topics.filter(t => (t.id || t.name) !== id));
  };

  const handleEditTopic = (id: string, name: string) => {
    setTopics(topics.map(t => (t.id || t.name) === id ? { ...t, name } : t));
  };

  const handleConfidenceChange = (id: string, confidence: number) => {
    setTopics(topics.map(t => (t.id || t.name) === id ? { ...t, confidence } : t));
  };

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  };

  const getSubjectTopics = (subjectId: string) => {
    return topics.filter(t => t.subject_id === subjectId);
  };

  if (topics.length === 0) {
    return (
      <Card className="p-6 text-center border-dashed">
        <Sparkles className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">No topics yet</p>
        <p className="text-sm text-muted-foreground">
          Upload a document or chat with AI to add topics
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {subjects.map((subject) => {
        const subjectId = subject.id || subject.name;
        const subjectTopics = getSubjectTopics(subjectId);
        const isExpanded = expandedSubjects.has(subjectId);

        if (subjectTopics.length === 0) return null;

        return (
          <Collapsible
            key={subjectId}
            open={isExpanded}
            onOpenChange={() => toggleSubject(subjectId)}
          >
            <Card className="overflow-hidden">
              <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="font-medium">{subject.name}</span>
                  <Badge variant="secondary">{subjectTopics.length} topics</Badge>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="p-3 pt-0 space-y-1">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, subjectId)}
                  >
                    <SortableContext
                      items={subjectTopics.map(t => t.id || t.name)}
                      strategy={verticalListSortingStrategy}
                    >
                      {subjectTopics.map((topic) => (
                        <SortableTopic
                          key={topic.id || topic.name}
                          topic={topic}
                          onRemove={handleRemoveTopic}
                          onEdit={handleEditTopic}
                          onConfidenceChange={handleConfidenceChange}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}

      <div className="text-center text-xs text-muted-foreground pt-2">
        Drag topics to reorder • Click pencil to edit • Adjust confidence with slider
      </div>
    </div>
  );
}
