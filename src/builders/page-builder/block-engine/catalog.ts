import type { PageBuilderBlockType } from "./schema";

export interface PageBuilderElementCatalogItem {
  type: PageBuilderBlockType;
  label: string;
  description: string;
  group: "Layout" | "Content" | "Commerce";
}

export const pageBuilderElementCatalog: PageBuilderElementCatalogItem[] = [
  {
    type: "section",
    label: "Section",
    description: "Estructura principal para abrir y separar grandes zonas de la pagina.",
    group: "Layout",
  },
  {
    type: "container",
    label: "Container",
    description: "Agrupa bloques y habilita nesting dentro de una seccion.",
    group: "Layout",
  },
  {
    type: "columns",
    label: "Columns",
    description: "Distribuye contenido en columnas reordenables y redimensionables.",
    group: "Layout",
  },
  {
    type: "divider",
    label: "Divider",
    description: "Separa visualmente bloques o micro-secciones.",
    group: "Layout",
  },
  {
    type: "text",
    label: "Text",
    description: "Titulos, subtitulos y copy editable en linea.",
    group: "Content",
  },
  {
    type: "image",
    label: "Image",
    description: "Banners, producto o creativos de soporte.",
    group: "Content",
  },
  {
    type: "video",
    label: "Video",
    description: "Demo, UGC o prueba en formato video.",
    group: "Content",
  },
  {
    type: "testimonial",
    label: "Testimonial",
    description: "Prueba social con cita y autor.",
    group: "Content",
  },
  {
    type: "button",
    label: "Button",
    description: "CTA principal o secundarios con enlace.",
    group: "Commerce",
  },
  {
    type: "product",
    label: "Product",
    description: "Card de producto con precio, badge y beneficios.",
    group: "Commerce",
  },
  {
    type: "form",
    label: "Form",
    description: "Formulario de pedido o lead con CTA final.",
    group: "Commerce",
  },
  {
    type: "countdown",
    label: "Countdown",
    description: "Urgencia visual para impulsar conversion.",
    group: "Commerce",
  },
];
