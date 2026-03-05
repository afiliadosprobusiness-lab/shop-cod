import {
  ChevronLeft,
  Eye,
  Monitor,
  Rocket,
  RotateCcw,
  RotateCw,
  Save,
  Smartphone,
  Tablet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type PageBuilderDevice } from "../blocks/schema";

interface PageBuilderTopbarProps {
  device: PageBuilderDevice;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDeviceChange: (device: PageBuilderDevice) => void;
  onSave: () => void;
  onPreview: () => void;
  onPublish: () => void;
}

export function PageBuilderTopbar({
  device,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onDeviceChange,
  onSave,
  onPreview,
  onPublish,
}: PageBuilderTopbarProps) {
  const devices: Array<{ value: PageBuilderDevice; icon: typeof Monitor; label: string }> = [
    { value: "desktop", icon: Monitor, label: "Desktop" },
    { value: "tablet", icon: Tablet, label: "Tablet" },
    { value: "mobile", icon: Smartphone, label: "Mobile" },
  ];

  return (
    <header className="rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-slate-50 text-slate-700"
          aria-label="Volver"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="inline-flex h-8 items-center rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-800">
          Product Page
        </div>

        <div className="inline-flex items-center rounded-lg border border-slate-300 bg-slate-50 p-1">
          {devices.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onDeviceChange(item.value)}
                aria-label={`Vista ${item.label.toLowerCase()}`}
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-600 transition-colors",
                  device === item.value ? "bg-white text-blue-600 shadow-sm" : "hover:bg-white/80",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-slate-600 hover:bg-slate-50"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="h-8 rounded-lg border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSave}
            className="h-8 rounded-lg border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onPublish}
            className="h-8 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
          >
            <Rocket className="h-3.5 w-3.5" />
            Publish
          </Button>
        </div>
      </div>
    </header>
  );
}
