import { useState, useCallback, ReactNode } from "react";
import GridLayout, { Layout } from "react-grid-layout";
import { DashboardWidget } from "./DashboardWidget";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import "react-grid-layout/css/styles.css";

export interface WidgetConfig {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  icon?: ReactNode;
}

interface DashboardGridProps {
  widgets: WidgetConfig[];
  onLayoutChange: (widgets: WidgetConfig[]) => void;
  renderWidget: (widgetId: string, sizeClass: string) => ReactNode;
  containerWidth: number;
}

const COLS = 12;
const ROW_HEIGHT = 80;
const MARGIN: [number, number] = [16, 16];

export const DashboardGrid = ({
  widgets,
  onLayoutChange,
  renderWidget,
  containerWidth,
}: DashboardGridProps) => {
  const [isEditMode, setIsEditMode] = useState(false);

  // Convert widget configs to react-grid-layout format
  const layout: Layout[] = widgets
    .filter((w) => w.enabled)
    .map((widget) => ({
      i: widget.id,
      x: widget.x,
      y: widget.y,
      w: widget.w,
      h: widget.h,
      minW: widget.minW || 2,
      minH: widget.minH || 2,
      static: !isEditMode,
    }));

  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      if (!isEditMode) return;

      const updatedWidgets = widgets.map((widget) => {
        const layoutItem = newLayout.find((l) => l.i === widget.id);
        if (layoutItem) {
          return {
            ...widget,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          };
        }
        return widget;
      });

      onLayoutChange(updatedWidgets);
    },
    [widgets, onLayoutChange, isEditMode]
  );

  const handleResetLayout = () => {
    const defaultLayout: WidgetConfig[] = [
      { id: "progress", label: "Progress Tracking", description: "Study streak, leaderboards, and goals", enabled: true, x: 0, y: 0, w: 12, h: 5, minW: 4, minH: 3 },
      { id: "events", label: "Events & Commitments", description: "Your schedule at a glance", enabled: true, x: 0, y: 5, w: 6, h: 4, minW: 3, minH: 2 },
      { id: "analytics", label: "AI Analytics", description: "Insights and performance analysis", enabled: true, x: 6, y: 5, w: 6, h: 4, minW: 3, minH: 2 },
      { id: "timetables", label: "Timetables", description: "Your study plans", enabled: true, x: 0, y: 9, w: 8, h: 4, minW: 4, minH: 3 },
      { id: "homework", label: "Active Homework", description: "Homework tracker", enabled: true, x: 8, y: 9, w: 4, h: 4, minW: 3, minH: 2 },
    ];
    onLayoutChange(defaultLayout);
    toast.success("Layout reset to default");
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      toast.success("Layout locked");
    } else {
      toast.info("Edit mode enabled - drag and resize widgets");
    }
  };

  const enabledWidgets = widgets.filter((w) => w.enabled);

  return (
    <div className="dashboard-grid-container relative">
      {/* Edit Mode Controls */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetLayout}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Layout
        </Button>
        <Button
          variant={isEditMode ? "default" : "outline"}
          size="sm"
          onClick={toggleEditMode}
          className="gap-2"
        >
          {isEditMode ? (
            <>
              <Lock className="h-4 w-4" />
              Lock Layout
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              Edit Layout
            </>
          )}
        </Button>
      </div>

      {/* Edit Mode Indicator */}
      {isEditMode && (
        <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
          <strong>Edit Mode:</strong> Drag widgets by their headers to reposition. Drag corners to resize.
        </div>
      )}

      {/* Grid Layout */}
      <div
        className={cn(
          "dashboard-grid transition-all duration-300",
          isEditMode && "dashboard-grid-edit-mode"
        )}
      >
        <GridLayout
          className="layout"
          layout={layout}
          cols={COLS}
          rowHeight={ROW_HEIGHT}
          width={containerWidth}
          margin={MARGIN}
          containerPadding={[0, 0]}
          onLayoutChange={handleLayoutChange}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          draggableHandle=".drag-handle"
          resizeHandles={["se", "sw", "ne", "nw", "e", "w", "n", "s"]}
          compactType="vertical"
          preventCollision={false}
        >
          {enabledWidgets.map((widget) => (
            <div key={widget.id} className="grid-item">
              <DashboardWidget
                id={widget.id}
                title={widget.label}
                icon={widget.icon}
                isEditMode={isEditMode}
              >
                {renderWidget(widget.id, "md")}
              </DashboardWidget>
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
};

export default DashboardGrid;
