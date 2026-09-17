import Image from "next/image";

/**
 * next/image where it is allowed, a plain `<img>` everywhere else.
 *
 * Post bodies may point at any https host, and next/image throws at request
 * time for a host that is not in `images.remotePatterns`. Rather than either
 * allow-listing the whole internet (which would turn the optimiser into an open
 * proxy) or refusing outside images, this picks per URL: local files and the
 * project's own storage bucket get optimised, the rest are served as authored.
 */

function isOptimisable(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const host = new URL(src).hostname;
    const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(supabase) && host === new URL(supabase!).hostname;
  } catch {
    return false;
  }
}

export type AutoImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  /** Intrinsic size. Only next/image needs it; the fallback ignores it. */
  width?: number;
  height?: number;
  priority?: boolean;
  style?: React.CSSProperties;
};

export function AutoImage({
  src,
  alt,
  className,
  sizes = "(max-width: 1049px) 85vw, 550px",
  width = 1200,
  height = 750,
  priority,
  style,
}: AutoImageProps) {
  if (isOptimisable(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={className}
        style={style}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
      style={style}
    />
  );
}
