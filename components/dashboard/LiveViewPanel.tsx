"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { CameraSource } from "@/types";
import { Card } from "@/components/ui/Card";

export function LiveViewPanel({ source }: { source: CameraSource | null }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);

  useEffect(() => () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVideoUrl((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      return URL.createObjectURL(file);
    });
    setVideoName(file.name);
  };

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
        <div>
          <h3 className="font-display text-[17px] text-ink">Live View</h3>
          <p className="text-sm text-ink-muted mt-0.5">
            {source ? source.displayName : "No active source"}
          </p>
        </div>
        {source && (
          <span
            className={`text-xs font-data px-2 py-0.5 rounded-[3px] ${
              source.status === "online"
                ? "text-signal-low bg-signal-low-dim"
                : "text-ink-faint bg-panel-raised"
            }`}
          >
            {source.status}
          </span>
        )}
      </div>

      <div className="relative aspect-video bg-[#050708] flex items-center justify-center">
        {videoUrl ? (
          <>
            <video src={videoUrl} controls muted playsInline className="w-full h-full object-contain" />
            <span className="absolute top-3 left-3 text-[11px] font-data tracking-wide px-2 py-1 rounded-[3px] bg-black/70 text-signal-low border border-signal-low/30">
              LOCAL VIDEO · {videoName}
            </span>
          </>
        ) : source && source.status === "online" ? (
          <>
            {/* Placeholder frame standing in for the live stream until the
                backend exposes a real video feed. This is intentionally
                inert — no detections, boxes, or telemetry are drawn here,
                since the frontend does not perform inference. */}
            <svg viewBox="0 0 640 360" className="w-full h-full opacity-70" aria-hidden="true">
              <rect width="640" height="360" fill="#0a0d12" />
              <rect x="0" y="0" width="640" height="360" fill="url(#grid)" />
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0H0V40" fill="none" stroke="#1a212b" strokeWidth="1" />
                </pattern>
              </defs>
              <rect x="230" y="120" width="70" height="150" rx="6" fill="none" stroke="#313b47" strokeWidth="1.5" />
            </svg>
            <label className="absolute bottom-3 left-3 cursor-pointer text-[11px] font-data tracking-wide px-2 py-1 rounded-[3px] bg-black/70 text-signal-medium border border-signal-medium/30">
              LOAD LOCAL VIDEO
              <input type="file" accept="video/*" onChange={handleVideoChange} className="sr-only" />
            </label>
          </>
        ) : (
          <p className="text-sm text-ink-faint font-data">
            {source ? "Source offline — no frame available" : "Select a source to view"}
          </p>
        )}
      </div>
      {videoUrl && (
        <label className="block px-5 py-3 text-xs font-data text-ink-muted border-t border-hairline cursor-pointer">
          Replace local video
          <input type="file" accept="video/*" onChange={handleVideoChange} className="sr-only" />
        </label>
      )}
    </Card>
  );
}
