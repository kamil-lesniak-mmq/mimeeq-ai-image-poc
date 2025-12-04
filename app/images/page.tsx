"use client";

import { useEffect, useState } from "react";

export default function ImagesPage() {
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/images/list")
      .then((r) => r.json())
      .then(setImages);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Image collection</h1>
      <p className="text-sm text-slate-400">
        Filled via Mimeeq configurator (save screenshot / save modular
        products).
      </p>

      {images.length === 0 ? (
        <p className="text-sm text-slate-500">No images yet.</p>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          {images.map((img) => (
            <div
              key={img.id}
              className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900"
            >
              <img
                src={img.image_url}
                className="w-full h-32 object-cover"
                alt=""
              />
              <div className="p-2 text-[11px] text-slate-400">
                {img.source_ref || img.source}
                <div className="text-[10px] opacity-60">
                  {new Date(img.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
