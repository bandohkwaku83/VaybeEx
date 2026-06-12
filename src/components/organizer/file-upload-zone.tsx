"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  label: string;
  description?: string;
  accept?: string;
  variant?: "image" | "document";
  aspectRatio?: "video" | "square" | "portrait";
  value?: string | null;
  onChange: (preview: string | null, file?: File) => void;
  className?: string;
}

export function FileUploadZone({
  label,
  description,
  accept = "image/*",
  variant = "image",
  aspectRatio = "video",
  value,
  onChange,
  className,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    onChange(url, file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const aspectClass = {
    video: "aspect-[16/9]",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
  }[aspectRatio];

  if (value && variant === "image") {
    return (
      <div className={cn("space-y-2", className)}>
        <p className="text-sm font-medium text-stone-700">{label}</p>
        <div className={cn("relative overflow-hidden rounded-xl border border-stone-200", aspectClass)}>
          <Image src={value} alt={label} fill unoptimized className="object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
              Replace
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={() => onChange(null)}>
              <X className="h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
    );
  }

  if (value && variant === "document") {
    return (
      <div className={cn("space-y-2", className)}>
        <p className="text-sm font-medium text-stone-700">{label}</p>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">File uploaded</p>
              <p className="text-xs text-stone-500">{description}</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-stone-700">{label}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "w-full rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 p-6 text-center",
          aspectClass,
          dragging
            ? "border-teal-500 bg-teal-50"
            : "border-stone-200 bg-stone-50 hover:border-teal-300 hover:bg-teal-50/50"
        )}
      >
        {variant === "image" ? (
          <ImageIcon className="h-8 w-8 text-stone-400" />
        ) : (
          <FileText className="h-8 w-8 text-stone-400" />
        )}
        <div>
          <p className="text-sm font-medium text-stone-700">
            <Upload className="inline h-4 w-4 mr-1 -mt-0.5" />
            Click to upload or drag & drop
          </p>
          {description && <p className="text-xs text-stone-500 mt-1">{description}</p>}
        </div>
      </button>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}

interface GalleryUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export function GalleryUpload({ images, onChange, max = 6 }: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addImages = (files: FileList) => {
    const remaining = max - images.length;
    const newUrls = Array.from(files).slice(0, remaining).map((f) => URL.createObjectURL(f));
    onChange([...images, ...newUrls]);
  };

  const remove = (index: number) => onChange(images.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-700">Gallery Photos</p>
        <span className="text-xs text-stone-400">{images.length}/{max}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {images.map((img, i) => (
          <div key={img} className="relative aspect-square overflow-hidden rounded-lg border border-stone-200 group">
            <Image src={img} alt="" fill unoptimized className="object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-1 hover:border-teal-300 hover:bg-teal-50/50 transition-colors"
          >
            <Upload className="h-5 w-5 text-stone-400" />
            <span className="text-xs text-stone-500">Add photo</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && addImages(e.target.files)} />
      <p className="text-xs text-stone-400">Up to {max} photos. JPG or PNG, max 5 MB each.</p>
    </div>
  );
}
