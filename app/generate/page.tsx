"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

type Prompt = {
  id: string;
  prompt: string;
  aspect_ratio: string;
  output_type: "image" | "video";
};

type ImageItem = {
  id: string;
  image_url: string;
  source_ref: string | null;
  created_at: string;
};

export default function GeneratePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  async function loadData() {
    const [pRes, iRes] = await Promise.all([
      fetch("/api/prompts/list"),
      fetch("/api/images/list"),
    ]);
    setPrompts(await pRes.json());
    setImages(await iRes.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  function togglePrompt(id: string) {
    setSelectedPromptIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleImage(id: string) {
    setSelectedImageIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function runGeneration() {
    if (!selectedPromptIds.length || !selectedImageIds.length) return;

    setRunning(true);

    // 1) create run
    const runRes = await fetch("/api/runs/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Batch run" }),
    });
    const run = await runRes.json();

    // 2) attach all prompt-image pairs
    for (const pid of selectedPromptIds) {
      for (const iid of selectedImageIds) {
        await fetch("/api/runs/attach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            run_id: run.id,
            prompt_id: pid,
            image_id: iid,
          }),
        });
      }
    }

    // 3) fetch details for nanobanana payload
    const promptsMap = Object.fromEntries(prompts.map((p) => [p.id, p]));
    const imagesMap = Object.fromEntries(images.map((i) => [i.id, i]));

    const pairs = [];
    for (const pid of selectedPromptIds) {
      for (const iid of selectedImageIds) {
        const p = promptsMap[pid];
        const img = imagesMap[iid];
        if (!p || !img) continue;
        pairs.push({
          prompt_id: p.id,
          prompt: p.prompt,
          aspect_ratio: p.aspect_ratio,
          output_type: p.output_type,
          image_id: img.id,
          image_url: img.image_url,
        });
      }
    }

    // 4) call nanobanana proxy route
    await fetch("/api/runs/run-nanobanana", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ run_id: run.id, pairs }),
    });

    setRunning(false);
    setSelectedPromptIds([]);
    setSelectedImageIds([]);
    alert("Generation started / saved (mock). Check history.");
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Run generation</h1>
      <p className="text-sm text-slate-400">
        1) Select prompts · 2) Assign images from configurator collection · 3) Run nanobanana.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-slate-800 bg-slate-900 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Select prompts</h2>
            <span className="text-xs text-slate-400">
              {selectedPromptIds.length} selected
            </span>
          </div>
          <div className="space-y-1 max-h-64 overflow-auto text-xs">
            {prompts.map((p) => (
              <label
                key={p.id}
                className="flex items-start gap-2 p-2 rounded hover:bg-slate-800 cursor-pointer"
              >
                <Checkbox
                  checked={selectedPromptIds.includes(p.id)}
                  onCheckedChange={() => togglePrompt(p.id)}
                />
                <div>
                  <div className="font-medium text-slate-100">{p.prompt}</div>
                  <div className="text-[11px] text-slate-400">
                    {p.aspect_ratio} · {p.output_type}
                  </div>
                </div>
              </label>
            ))}
            {prompts.length === 0 && (
              <div className="text-[11px] text-slate-500">
                No prompts yet. Add some in the Prompts tab.
              </div>
            )}
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-900 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Select images</h2>
            <span className="text-xs text-slate-400">
              {selectedImageIds.length} selected
            </span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-auto">
            {images.map((img) => {
              const selected = selectedImageIds.includes(img.id);
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => toggleImage(img.id)}
                  className={`relative border rounded-md overflow-hidden ${
                    selected ? "border-emerald-400" : "border-slate-800"
                  }`}
                >
                  <img
                    src={img.image_url}
                    className="w-full h-20 object-cover"
                    alt=""
                  />
                  {selected && (
                    <div className="absolute inset-0 bg-emerald-500/20" />
                  )}
                </button>
              );
            })}
            {images.length === 0 && (
              <div className="text-[11px] text-slate-500 col-span-3">
                No images yet. Fill from configurator via your integration.
              </div>
            )}
          </div>
        </div>
      </div>

      <Button
        onClick={runGeneration}
        disabled={
          running ||
          !selectedPromptIds.length ||
          !selectedImageIds.length
        }
      >
        {running ? "Running..." : "Run generation"}
      </Button>
    </div>
  );
}
