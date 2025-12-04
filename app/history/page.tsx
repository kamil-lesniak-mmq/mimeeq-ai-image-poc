"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Result = {
  id: string;
  output_type: string;
  result_url: string;
  created_at: string;
};

type Run = {
  id: string;
  name: string | null;
  created_at: string;
  generation_results: Result[];
};

export default function HistoryPage() {
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    fetch("/api/results/list")
      .then((r) => r.json())
      .then(setRuns);
  }, []);

  return (
    <div className="space-y-4">
      <Card className="border-slate-800 bg-slate-950/60">
        <CardHeader>
          <CardTitle className="text-lg">Results history</CardTitle>
        </CardHeader>
      </Card>

      {runs.length === 0 ? (
        <p className="text-sm text-slate-500">No runs yet.</p>
      ) : (
        <div className="space-y-4">
          {runs.map((run) => (
            <Card
              key={run.id}
              className="border-slate-800 bg-slate-950/70"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm">
                    {run.name || "Untitled run"}
                  </CardTitle>
                  <div className="text-[11px] text-slate-500">
                    {new Date(run.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400">
                  {run.generation_results?.length || 0} outputs
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                  {run.generation_results?.map((r) => (
                    <div
                      key={r.id}
                      className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950"
                    >
                      {r.output_type === "image" ? (
                        <img
                          src={r.result_url}
                          className="w-full h-24 object-cover"
                          alt=""
                        />
                      ) : (
                        <video
                          src={r.result_url}
                          className="w-full h-24 object-cover"
                          controls
                        />
                      )}
                      <div className="p-1 text-[10px] text-slate-500">
                        {new Date(r.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
