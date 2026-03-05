import {
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
    <header className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0a1020] p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_40%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_35%)]" />
      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Editor controls</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-50">Undo, preview, publish y responsive sin salir del canvas</h2>
          <p className="mt-1 text-xs text-slate-400">Actualizacion en tiempo real del JSON por nodo.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-950/70 p-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 rounded-lg px-2.5 text-slate-200 hover:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 rounded-lg px-2.5 text-slate-200 hover:bg-slate-800"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-950/70 p-1">
            {devices.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onDeviceChange(item.value)}
                  aria-label={`Vista ${item.label.toLowerCase()}`}
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors",
                    device === item.value ? "bg-cyan-400 text-slate-950" : "hover:bg-slate-800",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSave}
            className="h-8 rounded-xl border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
          >
            <Save className="h-4 w-4" />
            Guardar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="h-8 rounded-xl border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onPublish}
            className="h-8 rounded-xl bg-cyan-400 px-3 text-slate-950 hover:bg-cyan-300"
          >
            <Rocket className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>
    </header>
  );
}
