"use client";

import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type Prompt = {
  id: string;
  prompt: string;
  aspect_ratio: string;
  output_type: "image" | "video";
};

export default function DashboardPromptsTab() {
  const [items, setItems] = useState<Prompt[]>([]);
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
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
    <div className="space-y-5">
      <div className="border border-slate-800 bg-slate-900/70 rounded-xl p-4 space-y-3">
        <div className="text-sm font-medium text-slate-200">Create prompt</div>
        <Textarea
          placeholder="Describe how to arrange chairs, tables, lighting, background etc..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="bg-slate-950 border-slate-800 text-sm"
        />
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Aspect ratio</span>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger className="h-8 w-28 bg-slate-950 border-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">1:1</SelectItem>
                <SelectItem value="4:5">4:5</SelectItem>
                <SelectItem value="16:9">16:9</SelectItem>
                <SelectItem value="9:16">9:16</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Output</span>
            <Select
              value={outputType}
              onValueChange={(v) => setOutputType(v as "image" | "video")}
            >
              <SelectTrigger className="h-8 w-28 bg-slate-950 border-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1" />
          <Button
            size="sm"
            onClick={create}
            disabled={!prompt.trim()}
          >
            Save prompt
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-slate-200">Saved prompts</div>
        {items.length === 0 ? (
          <p className="text-xs text-slate-500">No prompts yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map((p) => (
              <div
                key={p.id}
                className="border border-slate-800 bg-slate-950/70 rounded-xl p-3 text-xs flex gap-3"
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
