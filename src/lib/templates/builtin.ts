import type { CertificateTemplate, Orientation } from "@/types/certificate";

function make(
  slug: string,
  name: string,
  orientation: Orientation,
): CertificateTemplate {
  const landscape = orientation === "landscape";
  return {
    id: `builtin-${slug}-${orientation}`,
    name,
    src: `/templates/${slug}-${orientation}.svg`,
    width: landscape ? 1600 : 1131,
    height: landscape ? 1131 : 1600,
    orientation,
    source: "builtin",
    // Tepat di atas garis nama pada template bawaan.
    defaultNamePosition: { x: 0.5, y: landscape ? 0.5 : 0.485 },
  };
}

export const BUILTIN_TEMPLATES: CertificateTemplate[] = [
  make("classic", "Classic Navy", "landscape"),
  make("modern", "Modern Teal", "landscape"),
  make("classic", "Classic Navy", "portrait"),
  make("modern", "Modern Teal", "portrait"),
];
