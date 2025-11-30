import { ReactNode, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardWidgetProps {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  isEditMode?: boolean;
  onRemove?: () => void;
}

type SizeClass = "xs" | "sm" | "md" | "lg" | "xl";

export const DashboardWidget = ({
  id,
  title,
  icon,
  children,
  className,
  isEditMode = false,
}: DashboardWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sizeClass, setSizeClass] = useState<SizeClass>("md");

  // Use ResizeObserver to detect container size changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        
        // Determine size class based on container dimensions
        if (width < 250 || height < 150) {
          setSizeClass("xs");
        } else if (width < 350 || height < 200) {
          setSizeClass("sm");
        } else if (width < 500 || height < 300) {
          setSizeClass("md");
        } else if (width < 700 || height < 400) {
          setSizeClass("lg");
        } else {
          setSizeClass("xl");
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <Card
      ref={containerRef}
      className={cn(
        "h-full flex flex-col overflow-hidden transition-all duration-200",
        isEditMode && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
        className
      )}
      data-size={sizeClass}
      data-widget-id={id}
    >
      <CardHeader
        className={cn(
          "flex flex-row items-center gap-2 py-3 px-4 border-b border-border/50 shrink-0",
          isEditMode && "cursor-grab active:cursor-grabbing"
        )}
      >
        {isEditMode && (
          <div className="drag-handle flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <GripVertical className="h-4 w-4" />
          </div>
        )}
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <CardTitle
          className={cn(
            "font-semibold truncate transition-all",
            sizeClass === "xs" && "text-xs",
            sizeClass === "sm" && "text-sm",
            sizeClass === "md" && "text-base",
            sizeClass === "lg" && "text-lg",
            sizeClass === "xl" && "text-xl"
          )}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          "flex-1 overflow-auto p-4",
          sizeClass === "xs" && "p-2 text-xs",
          sizeClass === "sm" && "p-3 text-sm",
          sizeClass === "md" && "p-4 text-base",
          sizeClass === "lg" && "p-5",
          sizeClass === "xl" && "p-6"
        )}
      >
        <div
          className={cn(
            "widget-content h-full",
            `widget-size-${sizeClass}`
          )}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;
