"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Prompt = {
  id: string;
  prompt: string;
  aspect_ratio: string;
  output_type: string;
};

export default function PromptsPage() {
  const [items, setItems] = useState<Prompt[]>([]);
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [outputType, setOutputType] = useState<"image" | "video">("image");

  async function load() {
    const res = await fetch("/api/prompts/list");
    setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    await fetch("/api/prompts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        aspect_ratio: aspectRatio,
        output_type: outputType,
      }),
    });
    setPrompt("");
    await load();
  }

  async function remove(id: string) {
    await fetch("/api/prompts/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Prompts</h1>

      <div className="border border-slate-800 bg-slate-900 rounded-xl p-4 space-y-3">
        <Textarea
          placeholder="Describe the scene to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-slate-400">Aspect ratio</div>
          <Select value={aspectRatio} onValueChange={setAspectRatio}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1:1">1:1</SelectItem>
              <SelectItem value="16:9">16:9</SelectItem>
              <SelectItem value="9:16">9:16</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-xs text-slate-400">Type</div>
          <Select
            value={outputType}
            onValueChange={(v) => setOutputType(v as "image" | "video")}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>

          <Button
            size="sm"
            onClick={create}
            disabled={!prompt.trim()}
            className="ml-auto"
          >
            Save prompt
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium">Your prompts</h2>
        {items.length === 0 ? (
          <p className="text-xs text-slate-500">No prompts yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map((p) => (
              <div
                key={p.id}
                className="border border-slate-800 bg-slate-900 rounded-xl p-3 text-xs flex gap-3"
              >
                <div className="flex-1">
                  <div className="font-medium text-slate-100 mb-1">
                    {p.prompt}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    AR: {p.aspect_ratio} · Type: {p.output_type}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="border-slate-700"
                  onClick={() => remove(p.id)}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
