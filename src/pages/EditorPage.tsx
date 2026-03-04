import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
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
  Sparkles,
} from "lucide-react";
import { BlockPreview } from "@/components/editor/BlockPreview";
import { blockMeta, defaultBlockData } from "@/components/editor/block-config";
import {
  loadEditorState,
  publishEditorState,
  saveEditorState,
  type BlockType,
  type FunnelBlock,
  type StoreProfile,
} from "@/lib/editor";
import { toast } from "sonner";

function createDefaultProfile(): StoreProfile {
  return {
    storeName: "Nueva tienda",
    productName: "Producto principal",
    headline: "Tu producto estrella para vender mas",
    subheadline: "Oferta lista para lanzar en minutos con checkout COD.",
    price: "$49.900",
    originalPrice: "$89.900",
    ctaText: "Comprar ahora",
    category: "General",
  };
}

function createBlockDataForType(type: BlockType, profile: StoreProfile) {
  if (type === "hero") {
    return {
      ...defaultBlockData.hero,
      title: profile.headline,
      subtitle: profile.subheadline,
      price: profile.price,
      originalPrice: profile.originalPrice,
      ctaText: profile.ctaText,
    };
  }

  if (type === "problem") {
    return {
      ...defaultBlockData.problem,
      title: `Lo que ${profile.productName} resuelve en segundos`,
    };
  }

  if (type === "benefits") {
    return {
      ...defaultBlockData.benefits,
      title: `Por que elegir ${profile.productName}?`,
    };
  }

  if (type === "reviews") {
    return {
      ...defaultBlockData.reviews,
      title: `Clientes que compraron ${profile.productName}`,
    };
  }

  if (type === "faq") {
    return {
      ...defaultBlockData.faq,
      title: `Preguntas sobre ${profile.productName}`,
    };
  }

  if (type === "checkout") {
    return {
      ...defaultBlockData.checkout,
      title: `Pide ${profile.productName} ahora`,
    };
  }

  if (type === "cta") {
    return {
      ...defaultBlockData.cta,
      title: `Lanza ${profile.storeName} hoy`,
      subtitle: "Tu siguiente venta puede llegar hoy mismo.",
      ctaText: profile.ctaText,
    };
  }

  return { ...defaultBlockData[type] };
}

function createDefaultBlocks(profile: StoreProfile, isNew: boolean) {
  if (isNew) {
    return [
      {
        id: "b1",
        type: "hero",
        data: createBlockDataForType("hero", profile),
      },
      {
        id: "b2",
        type: "problem",
        data: createBlockDataForType("problem", profile),
      },
      {
        id: "b3",
        type: "benefits",
        data: createBlockDataForType("benefits", profile),
      },
      {
        id: "b4",
        type: "reviews",
        data: createBlockDataForType("reviews", profile),
      },
      {
        id: "b5",
        type: "faq",
        data: createBlockDataForType("faq", profile),
      },
      {
        id: "b6",
        type: "checkout",
        data: createBlockDataForType("checkout", profile),
      },
      {
        id: "b7",
        type: "cta",
        data: createBlockDataForType("cta", profile),
      },
    ] satisfies FunnelBlock[];
  }

  return [
    {
      id: "b1",
      type: "hero",
      data: {
        ...defaultBlockData.hero,
        title: "Auriculares Bluetooth Pro",
      },
    },
    { id: "b2", type: "problem", data: { ...defaultBlockData.problem } },
    { id: "b3", type: "benefits", data: { ...defaultBlockData.benefits } },
    { id: "b4", type: "reviews", data: { ...defaultBlockData.reviews } },
    { id: "b5", type: "faq", data: { ...defaultBlockData.faq } },
    { id: "b6", type: "cta", data: { ...defaultBlockData.cta } },
    { id: "b7", type: "checkout", data: { ...defaultBlockData.checkout } },
  ] satisfies FunnelBlock[];
}

function applyProfileToBlocks(blocks: FunnelBlock[], profile: StoreProfile) {
  return blocks.map((block) => {
    if (block.type === "hero") {
      return {
        ...block,
        data: {
          ...block.data,
          title: profile.headline,
          subtitle: profile.subheadline,
          price: profile.price,
          originalPrice: profile.originalPrice,
          ctaText: profile.ctaText,
        },
      };
    }

    if (block.type === "benefits") {
      return {
        ...block,
        data: {
          ...block.data,
          title: `Por que elegir ${profile.productName}?`,
        },
      };
    }

    if (block.type === "problem") {
      return {
        ...block,
        data: {
          ...block.data,
          title: `Lo que ${profile.productName} resuelve en segundos`,
        },
      };
    }

    if (block.type === "reviews") {
      return {
        ...block,
        data: {
          ...block.data,
          title: `Clientes que compraron ${profile.productName}`,
        },
      };
    }

    if (block.type === "faq") {
      return {
        ...block,
        data: {
          ...block.data,
          title: `Preguntas sobre ${profile.productName}`,
        },
      };
    }

    if (block.type === "checkout") {
      return {
        ...block,
        data: {
          ...block.data,
          title: `Pide ${profile.productName} ahora`,
        },
      };
    }

    if (block.type === "cta") {
      return {
        ...block,
        data: {
          ...block.data,
          title: `Lanza ${profile.storeName} hoy`,
          subtitle: "Tu siguiente venta puede llegar hoy mismo.",
          ctaText: profile.ctaText,
        },
      };
    }

    return block;
  });
}

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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
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
      className={`group relative cursor-pointer rounded-xl border-2 transition-all ${
        isSelected ? "border-primary shadow-gold" : "border-border hover:border-primary/30"
      }`}
      onClick={onSelect}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 z-10 rounded bg-secondary/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        className="absolute right-2 top-2 z-10 rounded bg-destructive/20 p-1 opacity-0 transition-opacity hover:bg-destructive/40 group-hover:opacity-100"
        aria-label={`Eliminar bloque ${blockMeta[block.type].label}`}
      >
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </button>

      <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        {blockMeta[block.type].emoji} {blockMeta[block.type].label}
      </div>

      <div className="p-5 pt-8">
        <BlockPreview type={block.type} data={block.data} />
      </div>
    </div>
  );
}

function PropertiesPanel({
  block,
  onChange,
}: {
  block: FunnelBlock | null;
  onChange: (id: string, field: string, value: string) => void;
}) {
  if (!block) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
        Selecciona un bloque para editar sus propiedades.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">{blockMeta[block.type].emoji}</span>
        <h3 className="font-bold">{blockMeta[block.type].label}</h3>
      </div>

      {Object.entries(block.data).map(([key, value]) => (
        <div key={key} className="space-y-1.5">
          <Label className="text-xs capitalize text-muted-foreground">
            {key.replace(/([A-Z])/g, " $1")}
          </Label>
          <Input
            value={value}
            onChange={(event) => onChange(block.id, key, event.target.value)}
            className="h-9 border-border bg-secondary text-sm"
          />
        </div>
      ))}
    </div>
  );
}

function CreatorSetupPanel({
  profile,
  onProfileChange,
  onApply,
  onSave,
  isNewStore,
}: {
  profile: StoreProfile;
  onProfileChange: (field: keyof StoreProfile, value: string) => void;
  onApply: () => void;
  onSave: () => void;
  isNewStore: boolean;
}) {
  return (
    <section className="mb-6 rounded-3xl border border-primary/20 bg-gradient-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {isNewStore ? "Creador guiado" : "Datos base de la tienda"}
          </div>
          <h2 className="text-xl font-bold">
            {isNewStore
              ? "Configura tu tienda antes de editar"
              : "Ajusta el posicionamiento de tu oferta"}
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Estos datos alimentan el hero, el CTA final y el checkout para que el
            funnel tenga una base coherente desde el inicio.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={onApply}>
            Aplicar al funnel
          </Button>
          <Button variant="cta" onClick={onSave}>
            Guardar base comercial
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="profile-store-name">Tienda</Label>
          <Input
            id="profile-store-name"
            value={profile.storeName}
            onChange={(event) => onProfileChange("storeName", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-product-name">Producto</Label>
          <Input
            id="profile-product-name"
            value={profile.productName}
            onChange={(event) => onProfileChange("productName", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-category">Categoria</Label>
          <Input
            id="profile-category"
            value={profile.category}
            onChange={(event) => onProfileChange("category", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-cta">CTA</Label>
          <Input
            id="profile-cta"
            value={profile.ctaText}
            onChange={(event) => onProfileChange("ctaText", event.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2 xl:col-span-2">
          <Label htmlFor="profile-headline">Headline</Label>
          <Input
            id="profile-headline"
            value={profile.headline}
            onChange={(event) => onProfileChange("headline", event.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2 xl:col-span-2">
          <Label htmlFor="profile-subheadline">Subheadline</Label>
          <Input
            id="profile-subheadline"
            value={profile.subheadline}
            onChange={(event) => onProfileChange("subheadline", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-price">Precio</Label>
          <Input
            id="profile-price"
            value={profile.price}
            onChange={(event) => onProfileChange("price", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-original-price">Precio anterior</Label>
          <Input
            id="profile-original-price"
            value={profile.originalPrice}
            onChange={(event) => onProfileChange("originalPrice", event.target.value)}
          />
        </div>
      </div>
    </section>
  );
}

export default function EditorPage() {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const resolvedStoreId = storeId || "new";
  const isNew = resolvedStoreId === "new";

  const [storeProfile, setStoreProfile] = useState<StoreProfile>(createDefaultProfile);
  const [blocks, setBlocks] = useState<FunnelBlock[]>(() =>
    createDefaultBlocks(createDefaultProfile(), isNew),
  );
  const [selectedId, setSelectedId] = useState<string | null>(blocks[0]?.id || null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    const storedState = loadEditorState(resolvedStoreId);

    if (storedState?.profile) {
      setStoreProfile(storedState.profile);
    }

    if (!storedState?.blocks.length) {
      if (isNew) {
        const baseProfile = storedState?.profile || createDefaultProfile();
        const nextBlocks = createDefaultBlocks(baseProfile, true);
        setBlocks(nextBlocks);
        setSelectedId(nextBlocks[0]?.id || null);
      }
      return;
    }

    setBlocks(storedState.blocks);
    setSelectedId(storedState.blocks[0]?.id || null);
  }, [resolvedStoreId, isNew]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const selectedBlock = blocks.find((block) => block.id === selectedId) || null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setBlocks((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const addBlock = (type: BlockType) => {
    const newBlock: FunnelBlock = {
      id: `b${Date.now()}`,
      type,
      data: createBlockDataForType(type, storeProfile),
    };

    setBlocks((previous) => [...previous, newBlock]);
    setSelectedId(newBlock.id);
  };

  const deleteBlock = (id: string) => {
    setBlocks((previous) => {
      const nextBlocks = previous.filter((block) => block.id !== id);

      if (selectedId === id) {
        setSelectedId(nextBlocks[0]?.id || null);
      }

      return nextBlocks;
    });
  };

  const updateBlockData = useCallback((id: string, field: string, value: string) => {
    setBlocks((previous) =>
      previous.map((block) =>
        block.id === id ? { ...block, data: { ...block.data, [field]: value } } : block,
      ),
    );
  }, []);

  const updateProfileField = (field: keyof StoreProfile, value: string) => {
    setStoreProfile((previous) => ({ ...previous, [field]: value }));
  };

  const applyProfile = () => {
    setBlocks((previous) => applyProfileToBlocks(previous, storeProfile));
    toast.success("Base comercial aplicada al funnel.");
  };

  const persistDraft = () => {
    const nextBlocks = applyProfileToBlocks(blocks, storeProfile);
    setBlocks(nextBlocks);

    const storedState = saveEditorState(resolvedStoreId, nextBlocks, storeProfile);

    toast.success("Cambios guardados.", {
      description: `Ultima actualizacion: ${new Date(storedState.updatedAt).toLocaleString()}`,
    });
  };

  const openPreview = () => {
    const nextBlocks = applyProfileToBlocks(blocks, storeProfile);
    saveEditorState(resolvedStoreId, nextBlocks, storeProfile);
    setBlocks(nextBlocks);
    navigate(`/preview/${resolvedStoreId}`);
  };

  const handlePublish = () => {
    const nextBlocks = applyProfileToBlocks(blocks, storeProfile);
    setBlocks(nextBlocks);

    const publishedState = publishEditorState(resolvedStoreId, nextBlocks, storeProfile);

    if (!publishedState) {
      toast.error("No hay contenido para publicar.");
      return;
    }

    toast.success("Version publicada.", {
      description: `Publicada: ${new Date(publishedState.publishedAt || "").toLocaleString()}`,
    });
  };

  const activeBlock = useMemo(
    () => blocks.find((block) => block.id === activeId),
    [activeId, blocks],
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-bold">
              {storeProfile.storeName || (isNew ? "Nueva Tienda" : "Tienda en edicion")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-secondary p-0.5">
          <button
            type="button"
            onClick={() => setPreviewMode("desktop")}
            className={`rounded-md p-1.5 transition-colors ${
              previewMode === "desktop" ? "bg-card text-foreground" : "text-muted-foreground"
            }`}
            aria-label="Vista desktop"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode("mobile")}
            className={`rounded-md p-1.5 transition-colors ${
              previewMode === "mobile" ? "bg-card text-foreground" : "text-muted-foreground"
            }`}
            aria-label="Vista mobile"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openPreview}>
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button variant="cta" size="sm" onClick={persistDraft}>
            <Save className="h-4 w-4" /> Guardar
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePublish}>
            Publicar
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-52 shrink-0 overflow-y-auto border-r border-border bg-card p-3 md:block">
          <p className="mb-3 px-1 text-xs font-semibold text-muted-foreground">
            AGREGAR BLOQUE
          </p>
          <div className="space-y-1.5">
            {(Object.keys(blockMeta) as BlockType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                className="group flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              >
                <span>{blockMeta[type].emoji}</span>
                <span className="flex-1 text-left">{blockMeta[type].label}</span>
                <Plus className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto bg-background p-4 lg:p-8">
          <div
            className={`mx-auto transition-all duration-300 ${
              previewMode === "mobile" ? "max-w-sm" : "max-w-4xl"
            }`}
          >
            <CreatorSetupPanel
              profile={storeProfile}
              onProfileChange={updateProfileField}
              onApply={applyProfile}
              onSave={persistDraft}
              isNewStore={isNew}
            />

            <div className="mb-4 flex gap-2 overflow-x-auto pb-2 md:hidden">
              {(Object.keys(blockMeta) as BlockType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addBlock(type)}
                  className="shrink-0 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground"
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
              <SortableContext
                items={blocks.map((block) => block.id)}
                strategy={verticalListSortingStrategy}
              >
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
                  <div className="rounded-xl border-2 border-primary bg-card p-5 opacity-90 shadow-gold-lg">
                    <BlockPreview type={activeBlock.type} data={activeBlock.data} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {blocks.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                <p className="mb-2 text-lg font-semibold">Tu funnel esta vacio</p>
                <p className="mb-4 text-sm">
                  Agrega bloques desde la barra lateral para comenzar.
                </p>
                <Button variant="cta" onClick={() => addBlock("hero")}>
                  <Plus className="h-4 w-4" /> Agregar Hero
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="hidden w-64 shrink-0 overflow-y-auto border-l border-border bg-card lg:block">
          <div className="border-b border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground">PROPIEDADES</p>
          </div>
          <PropertiesPanel block={selectedBlock} onChange={updateBlockData} />
        </aside>
      </div>
    </div>
  );
}
