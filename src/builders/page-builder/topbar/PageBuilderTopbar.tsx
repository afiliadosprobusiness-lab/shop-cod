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
import { BuilderToolbar } from "@/builders/shared";
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
  const devices: Array<{ value: PageBuilderDevice; icon: typeof Monitor; label: string }> =
    [
      { value: "desktop", icon: Monitor, label: "Desktop" },
      { value: "tablet", icon: Tablet, label: "Tablet" },
      { value: "mobile", icon: Smartphone, label: "Mobile" },
    ];

  return (
    <BuilderToolbar
      eyebrow="Top bar"
      title="Undo, redo, preview, save y publish sin salir del editor"
      description="El layout y el JSON se actualizan en caliente, sin recargar toda la pagina."
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
          >
            <RotateCcw className="h-4 w-4" />
            Undo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
          >
            <RotateCw className="h-4 w-4" />
            Redo
          </Button>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Responsive
            </span>
            {devices.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onDeviceChange(item.value)}
                  aria-label={`Vista ${item.label.toLowerCase()}`}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition-colors",
                    device === item.value ? "bg-sky-500 text-slate-950" : "hover:bg-white/[0.06]",
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
            className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
          >
            <Save className="h-4 w-4" />
            Guardar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button type="button" variant="cta" size="sm" onClick={onPublish}>
            <Rocket className="h-4 w-4" />
            Publish
          </Button>
        </>
      }
    />
  );
}
