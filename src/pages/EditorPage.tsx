import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Eye,
  GripVertical,
  Plus,
  Trash2,
  Zap,
  Smartphone,
  Monitor,
  Save,
} from "lucide-react";
import { BlockPreview, blockMeta, defaultBlockData } from "@/components/editor/BlockPreview";

export type BlockType = "hero" | "problem" | "benefits" | "reviews" | "faq" | "checkout" | "cta";

export interface FunnelBlock {
  id: string;
  type: BlockType;
  data: Record<string, string>;
}

// ─── SORTABLE BLOCK ───
function SortableBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
}: {
  block: FunnelBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-xl border-2 transition-all cursor-pointer group ${
        isSelected ? "border-primary shadow-gold" : "border-border hover:border-primary/30"
      }`}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1 rounded bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-2 right-2 p-1 rounded bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/40 z-10"
      >
        <Trash2 className="w-3.5 h-3.5 text-destructive" />
      </button>

      {/* Block type label */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        {blockMeta[block.type].emoji} {blockMeta[block.type].label}
      </div>

      <div className="p-5 pt-8">
        <BlockPreview type={block.type} data={block.data} />
      </div>
    </div>
  );
}

// ─── PROPERTIES PANEL ───
function PropertiesPanel({
  block,
  onChange,
}: {
  block: FunnelBlock | null;
  onChange: (id: string, field: string, value: string) => void;
}) {
  if (!block) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm text-center p-4">
        Selecciona un bloque para editar sus propiedades
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{blockMeta[block.type].emoji}</span>
        <h3 className="font-bold">{blockMeta[block.type].label}</h3>
      </div>
      {Object.entries(block.data).map(([key, value]) => (
        <div key={key} className="space-y-1.5">
          <Label className="text-xs capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}</Label>
          <Input
            value={value}
            onChange={(e) => onChange(block.id, key, e.target.value)}
            className="bg-secondary border-border h-9 text-sm"
          />
        </div>
      ))}
    </div>
  );
}

// ─── EDITOR PAGE ───
export default function EditorPage() {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const isNew = storeId === "new";

  const [blocks, setBlocks] = useState<FunnelBlock[]>(
    isNew
      ? [
          { id: "b1", type: "hero", data: { ...defaultBlockData.hero } },
          { id: "b2", type: "benefits", data: { ...defaultBlockData.benefits } },
          { id: "b3", type: "reviews", data: { ...defaultBlockData.reviews } },
          { id: "b4", type: "checkout", data: { ...defaultBlockData.checkout } },
        ]
      : [
          { id: "b1", type: "hero", data: { ...defaultBlockData.hero, title: "Auriculares Bluetooth Pro" } },
          { id: "b2", type: "problem", data: { ...defaultBlockData.problem } },
          { id: "b3", type: "benefits", data: { ...defaultBlockData.benefits } },
          { id: "b4", type: "reviews", data: { ...defaultBlockData.reviews } },
          { id: "b5", type: "faq", data: { ...defaultBlockData.faq } },
          { id: "b6", type: "cta", data: { ...defaultBlockData.cta } },
          { id: "b7", type: "checkout", data: { ...defaultBlockData.checkout } },
        ]
  );

  const [selectedId, setSelectedId] = useState<string | null>(blocks[0]?.id || null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const selectedBlock = blocks.find((b) => b.id === selectedId) || null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlock: FunnelBlock = {
      id: `b${Date.now()}`,
      type,
      data: { ...defaultBlockData[type] },
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedId(newBlock.id);
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateBlockData = useCallback((id: string, field: string, value: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, data: { ...b.data, [field]: value } } : b))
    );
  }, []);

  const activeBlock = blocks.find((b) => b.id === activeId);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top toolbar */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-display font-bold text-sm">{isNew ? "Nueva Tienda" : "Gadget Pro X"}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
          <button
            onClick={() => setPreviewMode("desktop")}
            className={`p-1.5 rounded-md transition-colors ${previewMode === "desktop" ? "bg-card text-foreground" : "text-muted-foreground"}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewMode("mobile")}
            className={`p-1.5 rounded-md transition-colors ${previewMode === "mobile" ? "bg-card text-foreground" : "text-muted-foreground"}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/preview/${storeId}`)}>
            <Eye className="w-4 h-4" /> Preview
          </Button>
          <Button variant="cta" size="sm">
            <Save className="w-4 h-4" /> Guardar
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Block sidebar */}
        <aside className="w-52 border-r border-border bg-card p-3 overflow-y-auto flex-shrink-0 hidden md:block">
          <p className="text-xs font-semibold text-muted-foreground mb-3 px-1">AGREGAR BLOQUE</p>
          <div className="space-y-1.5">
            {(Object.keys(blockMeta) as BlockType[]).map((type) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground rounded-lg border border-border hover:bg-secondary hover:text-foreground transition-all group"
              >
                <span>{blockMeta[type].emoji}</span>
                <span className="flex-1 text-left">{blockMeta[type].label}</span>
                <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-background">
          <div className={`mx-auto transition-all duration-300 ${previewMode === "mobile" ? "max-w-sm" : "max-w-2xl"}`}>
            {/* Mobile add block */}
            <div className="md:hidden mb-4 flex gap-2 overflow-x-auto pb-2">
              {(Object.keys(blockMeta) as BlockType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary border border-border rounded-lg text-muted-foreground"
                >
                  {blockMeta[type].emoji} {blockMeta[type].label}
                </button>
              ))}
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {blocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      isSelected={selectedId === block.id}
                      onSelect={() => setSelectedId(block.id)}
                      onDelete={() => deleteBlock(block.id)}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeBlock ? (
                  <div className="rounded-xl border-2 border-primary bg-card p-5 shadow-gold-lg opacity-90">
                    <BlockPreview type={activeBlock.type} data={activeBlock.data} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {blocks.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg font-semibold mb-2">Tu funnel está vacío</p>
                <p className="text-sm mb-4">Agrega bloques desde la barra lateral para comenzar</p>
                <Button variant="cta" onClick={() => addBlock("hero")}>
                  <Plus className="w-4 h-4" /> Agregar Hero
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Properties panel */}
        <aside className="w-64 border-l border-border bg-card overflow-y-auto flex-shrink-0 hidden lg:block">
          <div className="p-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground">PROPIEDADES</p>
          </div>
          <PropertiesPanel block={selectedBlock} onChange={updateBlockData} />
        </aside>
      </div>
    </div>
  );
}
