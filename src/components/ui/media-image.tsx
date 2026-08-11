"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";
import { FALLBACK_TRIP_IMAGE, shouldUnoptimizeMedia } from "@/lib/api/media";

type MediaImageProps = Omit<ImageProps, "src"> & {
  src?: ImageProps["src"] | null;
  fallback?: string;
};

function srcKey(src: ImageProps["src"]): string {
  return typeof src === "string" ? src : "src" in src ? src.src : "";
}

export function MediaImage({
  src,
  alt,
  fallback = FALLBACK_TRIP_IMAGE,
  unoptimized,
  onError,
  className,
  sizes,
  fill,
  ...rest
}: MediaImageProps) {
  const incoming = src && srcKey(src) ? src : fallback;
  const incomingKey = srcKey(incoming);
  const [brokenKey, setBrokenKey] = useState<string | null>(null);
  const failed = brokenKey === incomingKey;
  const resolved = failed ? fallback : incoming;
  const skipOptimize = unoptimized ?? shouldUnoptimizeMedia(srcKey(resolved));

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (incomingKey !== fallback) setBrokenKey(incomingKey);
      onError?.(event);
    },
    [fallback, incomingKey, onError],
  );

  return (
    <Image
      {...rest}
      src={resolved}
      alt={alt}
      fill={fill}
      sizes={sizes ?? (fill ? "100vw" : undefined)}
      unoptimized={skipOptimize}
      onError={handleError}
      className={className}
    />
  );
}
