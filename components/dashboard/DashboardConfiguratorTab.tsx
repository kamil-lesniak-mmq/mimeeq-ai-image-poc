"use client";

import { useState } from "react";
import Script from "next/script";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    mimeeqApp?: any;
  }
}

export default function DashboardConfiguratorTab() {
  const [shortcode, setShortcode] = useState("XSNY51");
  const [template, setTemplate] = useState("default");
  const [loading, setLoading] = useState(false);

  // ✅ Utility: wait until mimeeq is actually ready
  async function waitForMimeeq(timeoutMs = 10000) {
    const start = Date.now();

    return new Promise<void>((resolve, reject) => {
      const interval = setInterval(() => {
        if (window.mimeeqApp?.utils?.takeScreenshot) {
          clearInterval(interval);
          resolve();
        }

        if (Date.now() - start > timeoutMs) {
          clearInterval(interval);
          reject(new Error("Mimeeq app did not load in time"));
        }
      }, 200);
    });
  }

  // ✅ FINAL SAFE SCREENSHOT FLOW
  async function handleSaveScreenshot() {
    try {
      setLoading(true);

      // 1️⃣ Wait until configurator API exists
      await waitForMimeeq();

      // 2️⃣ Take screenshot from Mimeeq
      const base64 = await window.mimeeqApp.utils.takeScreenshot(
        "png",
        1200,
        "#ffffff"
      );

      // 3️⃣ Upload to Supabase storage
      const uploadRes = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64,
          filename: `mmq-${shortcode}-${Date.now()}.png`,
        }),
      });

      const uploadJson = await uploadRes.json();
      if (!uploadJson?.publicUrl) {
        throw new Error("Upload failed");
      }

      // 4️⃣ Save into user image collection
      await fetch("/api/images/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: uploadJson.publicUrl,
          source: "mimeeq-configurator",
          source_ref: shortcode,
        }),
      });

      alert("✅ Screenshot saved to collection!");
    } catch (err: any) {
      console.error("Screenshot error:", err);
      alert("❌ Failed to save screenshot");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Safe modular product collector
  async function handleSaveModular() {
    try {
      setLoading(true);
      await waitForMimeeq();

      const unsubscribe =
        window.mimeeqApp.observers.modular.activeAddProductData.subscribe(
          async ({ newValue }: any) => {
            if (newValue) {
              console.log("Modular product:", newValue);
              // 🔜 You can upload product images here the same way as screenshots
            }
          }
        );

      // Auto-unsubscribe after 5 seconds
      setTimeout(() => unsubscribe.unsubscribe(), 5000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Script
        src="https://cdn.mimeeq.com/read_models/embed/app-embed.js"
        strategy="afterInteractive"
      />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Shortcode</div>
          <Input
            className="h-8 w-40 bg-slate-950 border-slate-800"
            value={shortcode}
            onChange={(e) => setShortcode(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs text-slate-400">Template</div>
          <Input
            className="h-8 w-40 bg-slate-950 border-slate-800"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          />
        </div>

        <div className="flex-1" />

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={handleSaveScreenshot}
          >
            {loading ? "Saving..." : "Save screenshot"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={handleSaveModular}
          >
            Save all modular products
          </Button>
        </div>
      </div>

      <div className="border border-slate-800 bg-slate-900/70 rounded-xl p-3">
        <div className="text-xs text-slate-400 mb-2">
          Configurator preview (embedded):
        </div>
        <div className="bg-slate-950 rounded-lg border border-slate-800 p-2 min-h-[320px] w-full">
          {/* @ts-expect-error custom element */}
          <mmq-embed
            short-code={shortcode}
            template={template || "default"}
          />
        </div>
      </div>
    </div>
  );
}
