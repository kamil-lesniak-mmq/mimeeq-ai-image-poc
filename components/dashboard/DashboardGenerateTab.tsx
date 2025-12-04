"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

type Result = {
  id: string;
  output_type: "image" | "video";
  result_url: string;
  created_at: string;
};

export default function DashboardGenerateTab() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);

  const [activePrompts, setActivePrompts] = useState<string[]>([]);
  const [promptAssignments, setPromptAssignments] = useState<
    Record<string, string[]>
  >({});
  const [adjustedPrompts, setAdjustedPrompts] = useState<
    Record<string, string>
  >({});

  const [runName, setRunName] = useState("");
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [lastRunId, setLastRunId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const [pickerPromptId, setPickerPromptId] = useState<string | null>(null);
  const [pickerSelection, setPickerSelection] = useState<string[]>([]);

  async function loadData() {
    const [pRes, iRes] = await Promise.all([
      fetch("/api/prompts/list", { cache: "no-store" }),
      fetch("/api/images/list", { cache: "no-store" }),
    ]);
    setPrompts(await pRes.json());
    setImages(await iRes.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  function togglePrompt(id: string) {
    setActivePrompts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function getAdjustedPrompt(id: string) {
    return (
      adjustedPrompts[id] ?? prompts.find((p) => p.id === id)?.prompt ?? ""
    );
  }

  function openImagePicker(promptId: string) {
    setPickerPromptId(promptId);
    setPickerSelection(promptAssignments[promptId] ?? []);
  }

  function togglePickerImage(imageId: string) {
    setPickerSelection((prev) =>
      prev.includes(imageId)
        ? prev.filter((x) => x !== imageId)
        : [...prev, imageId]
    );
  }

  function savePickerAssignment() {
    if (!pickerPromptId) return;

    setPromptAssignments((prev) => ({
      ...prev,
      [pickerPromptId]: pickerSelection,
    }));

    setPickerPromptId(null);
    setPickerSelection([]);
  }

  function unassignImage(promptId: string, imageId: string) {
    setPromptAssignments((prev) => ({
      ...prev,
      [promptId]: (prev[promptId] || []).filter((id) => id !== imageId),
    }));
  }

  function getPromptImages(promptId: string) {
    const ids = promptAssignments[promptId] || [];
    return images.filter((img) => ids.includes(img.id));
  }

  // ✅ FINAL MULTI-REFERENCE GENERATION
  async function runGeneration() {
    if (!activePrompts.length) return;

    setRunning(true);

    const runRes = await fetch("/api/runs/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: runName || "Untitled batch" }),
    });

    const run = await runRes.json();
    setLastRunId(run.id);

    const promptsMap = Object.fromEntries(prompts.map((p) => [p.id, p]));
    const imagesMap = Object.fromEntries(images.map((i) => [i.id, i]));

    const items = [];

    for (const pid of activePrompts) {
      const p = promptsMap[pid];
      const assignedImages = promptAssignments[pid] ?? [];

      const reference_images = assignedImages
        .map((iid) => imagesMap[iid]?.image_url)
        .filter(Boolean);

      if (!p || reference_images.length === 0) continue;

      items.push({
        prompt_id: p.id,
        prompt: getAdjustedPrompt(p.id),
        aspect_ratio: p.aspect_ratio,
        output_type: p.output_type,
        reference_images,
      });
    }

    if (!items.length) {
      alert("Each active prompt must have at least one image assigned.");
      setRunning(false);
      return;
    }

    const nanoRes = await fetch("/api/runs/run-nanobanana", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        run_id: run.id,
        items,
      }),
    });

    const nanoJson = await nanoRes.json();

    setResults(nanoJson.results ?? []);
    setResultsModalOpen(true);
    setRunning(false);
  }

  async function saveRunName() {
    if (!lastRunId) return;

    await fetch("/api/runs/update-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ run_id: lastRunId, name: runName }),
    });
  }

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div>
          <div className="text-sm font-medium text-slate-200">
            Generation run
          </div>
          <div className="text-xs text-slate-400">
            Each prompt has its own image assignment.
          </div>
        </div>

        <div className="flex-1" />

        <Input
          className="h-8 w-64 bg-slate-950 border-slate-800"
          value={runName}
          onChange={(e) => setRunName(e.target.value)}
          placeholder="Collection name"
        />
      </div>

      {/* ✅ PROMPT LIST + ASSIGNED THUMBNAILS */}
      <div className="space-y-2">
        {prompts.map((p) => {
          const assignedCount = promptAssignments[p.id]?.length ?? 0;

          return (
            <div
              key={p.id}
              className="border border-slate-800 rounded-lg p-3 bg-slate-900/70 space-y-2"
            >
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={activePrompts.includes(p.id)}
                  onCheckedChange={() => togglePrompt(p.id)}
                />

                <div className="flex-1 space-y-1">
                  <Textarea
                    value={getAdjustedPrompt(p.id)}
                    onChange={(e) =>
                      setAdjustedPrompts((prev) => ({
                        ...prev,
                        [p.id]: e.target.value,
                      }))
                    }
                    className="h-16 bg-slate-950 border-slate-800 text-xs"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      AR: {p.aspect_ratio} · {p.output_type}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openImagePicker(p.id)}
                    >
                      Assign images ({assignedCount})
                    </Button>
                  </div>

                  {/* ✅ ASSIGNED IMAGE THUMBNAILS */}
                  {assignedCount > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {getPromptImages(p.id).map((img) => (
                        <div
                          key={img.id}
                          className="relative w-16 h-16 rounded overflow-hidden border border-slate-800"
                        >
                          <img
                            src={img.image_url}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                          <button
                            onClick={() => unassignImage(p.id, img.id)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center hover:bg-red-600"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        className="mt-4"
        onClick={runGeneration}
        disabled={running || !activePrompts.length}
      >
        {running ? "Running..." : "Run generation"}
      </Button>

      {/* ✅ IMAGE PICKER MODAL */}
      <Dialog
        open={!!pickerPromptId}
        onOpenChange={(v) => !v && setPickerPromptId(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assign images to prompt</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-[60vh] overflow-auto">
            {images.map((img) => {
              const selected = pickerSelection.includes(img.id);

              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => togglePickerImage(img.id)}
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPickerPromptId(null)}>
              Cancel
            </Button>
            <Button onClick={savePickerAssignment}>
              Save assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ RESULTS MODAL */}
      <Dialog open={resultsModalOpen} onOpenChange={setResultsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Generation results</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto space-y-3">
            {results.map((r) => (
              <div key={r.id} className="border border-slate-800 rounded-lg">
                {r.output_type === "image" ? (
                  <img
                    src={r.result_url}
                    className="w-full h-40 object-cover"
                    alt=""
                  />
                ) : (
                  <video
                    src={r.result_url}
                    className="w-full h-40 object-cover"
                    controls
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResultsModalOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={async () => {
                await saveRunName();
                setResultsModalOpen(false);
              }}
            >
              Save name & close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
