import type { PageBuilderBlockType } from "./schema";

export const pageBuilderElementCatalog: Array<{
  type: PageBuilderBlockType;
  label: string;
  description: string;
}> = [
  {
    type: "text",
    label: "Text",
    description: "Titulos, subtitulos y copy editable en linea.",
  },
  {
    type: "image",
    label: "Image",
    description: "Banners, producto o creativos de soporte.",
  },
  {
    type: "button",
    label: "Button",
    description: "CTA principal o secundarios con enlace.",
  },
  {
    type: "container",
    label: "Container",
    description: "Agrupa bloques y permite nesting.",
  },
  {
    type: "columns",
    label: "Columns",
    description: "Distribuye contenido en varias columnas.",
  },
  {
    type: "video",
    label: "Video",
    description: "Demo, UGC o prueba en formato video.",
  },
  {
    type: "product",
    label: "Product",
    description: "Card de producto con precio y badge.",
  },
  {
    type: "form",
    label: "Form",
    description: "Formulario simple de pedido o lead.",
  },
  {
    type: "countdown",
    label: "Countdown",
    description: "Urgencia visual para impulsar conversion.",
  },
  {
    type: "testimonial",
    label: "Testimonial",
    description: "Prueba social con cita y autor.",
  },
];
