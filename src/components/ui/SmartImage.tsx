import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * next/image wrapper for CMS-managed images:
 * - SVG mockups are served unoptimized (the optimizer refuses SVG by design)
 * - obsolete /uploads/ URLs and empty values show a safe placeholder
 */
export function SmartImage({ src, alt, className, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  const usable = src && (src.startsWith("/images/") || src.startsWith("/api/uploads/"));
  if (!usable) {
    return (
      <div
        role="img"
        aria-label={alt || "Image coming soon"}
        className={cn("flex items-center justify-center bg-charcoal text-steel", props.fill && "absolute inset-0", className)}
      >
        <ImageOff className="size-10" aria-hidden="true" />
      </div>
    );
  }
  return <Image src={src} alt={alt} className={className} unoptimized={src.endsWith(".svg")} {...props} />;
}
