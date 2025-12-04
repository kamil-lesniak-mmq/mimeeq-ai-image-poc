"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ImageItem = {
  id: string;
  image_url: string;
  source_ref: string | null;
  source: string;
  created_at: string;
};

export default function DashboardImagesTab() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [manualUrl, setManualUrl] = useState("");

  async function load() {
    const res = await fetch("/api/images/list");
    const json = await res.json();
    setImages(json);
  }

  useEffect(() => {
    load();
  }, []);

  async function deleteImage(id: string) {
    await fetch("/api/images/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  // Optional manual add via URL (handy for testing before configurator is wired)
  async function addManual() {
    if (!manualUrl.trim()) return;
    await fetch("/api/images/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: manualUrl,
        source: "manual",
        source_ref: "manual-debug",
      }),
    });
    setManualUrl("");
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="text-sm text-slate-300">
          This collection is filled by the Mimeeq configurator (save screenshot / save modular
          products). Latest images appear first.
        </div>
        <div className="flex-1" />
        <div className="flex gap-2 text-xs">
          <Input
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="Paste image URL (for debugging)"
            className="h-8 bg-slate-900 border-slate-700"
          />
          <Button size="sm" onClick={addManual} variant="outline">
            Add
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-slate-500">No images yet – connect the configurator flow.</p>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          {images.map((img) => (
            <div
              key={img.id}
              className="group border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80 flex flex-col"
            >
              <div className="relative">
                <img
                  src={img.image_url}
                  className="w-full h-32 object-cover"
                  alt=""
                />
                <button
                  onClick={() => deleteImage(img.id)}
                  className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 bg-slate-950/80 border border-slate-700 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  Delete
                </button>
              </div>
              <div className="p-2 text-[11px] text-slate-400 space-y-1">
                <div className="truncate">
                  {img.source_ref || img.source}
                </div>
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
