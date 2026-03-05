import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BuilderAnyNode, BuilderNodeLookup } from "@/features/funnel-builder/types";

function readString(node: BuilderAnyNode, key: string) {
  const value = node.props[key];
  return typeof value === "string" ? value : "";
}

function readNumber(node: BuilderAnyNode, key: string, fallback: number) {
  const value = node.props[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "url";
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9"
      />
    </div>
  );
}

function Area({
  id,
  label,
  value,
  onChange,
  rows = 4,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ElementFields({
  selected,
  onPatch,
}: {
  selected: BuilderNodeLookup;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const node = selected.node;
  const isElementNode = Boolean(selected.columnId) && node.type !== "column";
  if (!isElementNode) {
    return null;
  }

  if (node.type === "text") {
    return (
      <Area
        id="prop-text-content"
        label="Content"
        value={readString(node, "content")}
        onChange={(value) => onPatch({ content: value })}
      />
    );
  }

  if (node.type === "image") {
    return (
      <Field
        id="prop-image-src"
        label="Image URL"
        type="url"
        value={readString(node, "src")}
        onChange={(value) => onPatch({ src: value })}
      />
    );
  }

  if (node.type === "button") {
    return (
      <>
        <Field
          id="prop-button-text"
          label="Button text"
          value={readString(node, "text")}
          onChange={(value) => onPatch({ text: value })}
        />
        <Field
          id="prop-button-href"
          label="Button link"
          value={readString(node, "href")}
          onChange={(value) => onPatch({ href: value })}
        />
      </>
    );
  }

  if (node.type === "section") {
    return (
      <>
        <Field
          id="prop-section-title"
          label="Title"
          value={readString(node, "title")}
          onChange={(value) => onPatch({ title: value })}
        />
        <Area
          id="prop-section-content"
          label="Content"
          value={readString(node, "content")}
          onChange={(value) => onPatch({ content: value })}
        />
      </>
    );
  }

  if (node.type === "headline" || node.type === "testimonials" || node.type === "footer") {
    return (
      <Area
        id={`prop-${node.type}-content`}
        label="Content"
        value={readString(node, "content")}
        onChange={(value) => onPatch({ content: value })}
      />
    );
  }

  if (node.type === "hero") {
    return (
      <>
        <Field
          id="prop-hero-title"
          label="Title"
          value={readString(node, "title")}
          onChange={(value) => onPatch({ title: value })}
        />
        <Area
          id="prop-hero-subtitle"
          label="Subtitle"
          value={readString(node, "subtitle")}
          onChange={(value) => onPatch({ subtitle: value })}
          rows={3}
        />
        <Field
          id="prop-hero-button-text"
          label="Button text"
          value={readString(node, "text")}
          onChange={(value) => onPatch({ text: value })}
        />
        <Field
          id="prop-hero-button-href"
          label="Button link"
          value={readString(node, "href")}
          onChange={(value) => onPatch({ href: value })}
        />
      </>
    );
  }

  if (node.type === "video") {
    return (
      <Field
        id="prop-video-src"
        label="Video embed URL"
        type="url"
        value={readString(node, "src")}
        onChange={(value) => onPatch({ src: value })}
      />
    );
  }

  if (node.type === "faq") {
    return (
      <>
        <Field
          id="prop-faq-question"
          label="Question"
          value={readString(node, "question")}
          onChange={(value) => onPatch({ question: value })}
        />
        <Area
          id="prop-faq-answer"
          label="Answer"
          value={readString(node, "answer")}
          onChange={(value) => onPatch({ answer: value })}
          rows={3}
        />
      </>
    );
  }

  if (node.type === "cod_form") {
    return (
      <>
        <Field
          id="prop-cod-title"
          label="Form title"
          value={readString(node, "title")}
          onChange={(value) => onPatch({ title: value })}
        />
        <Field
          id="prop-cod-button"
          label="Button text"
          value={readString(node, "text")}
          onChange={(value) => onPatch({ text: value })}
        />
      </>
    );
  }

  return null;
}

export function PropertiesPanel({
  selected,
  onPatchNodeProps,
}: {
  selected: BuilderNodeLookup | null;
  onPatchNodeProps: (patch: Record<string, unknown>) => void;
}) {
  const isSectionLayoutNode =
    Boolean(selected) && selected.node.type === "section" && !selected.columnId;
  const isColumnLayoutNode = Boolean(selected) && selected.node.type === "column";
  const isElementNode =
    Boolean(selected) &&
    Boolean(selected.columnId) &&
    selected.node.type !== "column";

  return (
    <div>
      <p className="text-sm font-semibold">Properties</p>
      {!selected ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Selecciona un nodo del canvas para ver y editar sus propiedades.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium">
            Tipo: {selected.node.type}
          </div>

          <div className="rounded-lg border border-border bg-card px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">Node ID</p>
            <p className="mt-1 break-all text-sm">{selected.node.id}</p>
          </div>

          {isSectionLayoutNode ? (
            <div className="rounded-lg border border-border bg-card px-3 py-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Section</p>
              <div className="space-y-2">
                <Field
                  id="prop-layout-section-label"
                  label="Label"
                  value={readString(selected.node, "label")}
                  onChange={(value) => onPatchNodeProps({ label: value })}
                />
                <Field
                  id="prop-layout-section-padding"
                  label="Padding Y"
                  type="number"
                  value={String(readNumber(selected.node, "paddingY", 24))}
                  onChange={(value) => onPatchNodeProps({ paddingY: Number(value || 0) })}
                />
              </div>
            </div>
          ) : null}

          {isColumnLayoutNode ? (
            <div className="rounded-lg border border-border bg-card px-3 py-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Columns</p>
              <Field
                id="prop-layout-column-span"
                label="Span (1-12)"
                type="number"
                value={String(readNumber(selected.node, "span", 12))}
                onChange={(value) => {
                  const span = Math.max(1, Math.min(12, Number(value || 12)));
                  onPatchNodeProps({ span });
                }}
              />
            </div>
          ) : null}

          {isElementNode ? (
            <div className="rounded-lg border border-border bg-card px-3 py-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Content</p>
              <div className="space-y-2">
                <ElementFields selected={selected} onPatch={onPatchNodeProps} />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
