"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { CameraSource } from "@/types";
import { getApiClient } from "@/lib/api";
import { Card } from "@/components/ui/Card";

export function LiveViewPanel({ source }: { source: CameraSource | null }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedSourceId, setUploadedSourceId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setMessage("Choose a valid video file.");
      return;
    }
    setVideoUrl((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      return URL.createObjectURL(file);
    });
    setVideoName(file.name);
    setSelectedFile(file);
    setUploadedSourceId(null);
    setIsRunning(false);
    setMessage(null);
  };

  const uploadVideo = async () => {
    if (!selectedFile) return;
    setBusy(true);
    setMessage(null);
    const result = await getApiClient().uploadVideo(selectedFile);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setUploadedSourceId(result.data.sourceId);
    setMessage(`Uploaded ${result.data.filename}. You can now start monitoring.`);
  };

  const startMonitoring = async () => {
    if (!uploadedSourceId) return;
    setBusy(true);
    setMessage(null);
    const result = await getApiClient().startMonitoring(uploadedSourceId);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setIsRunning(result.data.isRunning);
    setMessage("Monitoring started. Detection runs on the backend; this preview is the original uploaded video.");
  };

  const stopMonitoring = async () => {
    setBusy(true);
    setMessage(null);
    const result = await getApiClient().stopMonitoring();
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setIsRunning(false);
    setMessage("Monitoring stopped.");
  };

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
        <div>
          <h3 className="font-display text-[17px] text-ink">Live View</h3>
          <p className="text-sm text-ink-muted mt-0.5">
            {videoName ?? (source ? source.displayName : "No active source")}
          </p>
        </div>
        <span className={`text-xs font-data px-2 py-0.5 rounded-[3px] ${isRunning ? "text-signal-low bg-signal-low-dim" : "text-ink-faint bg-panel-raised"}`}>
          {isRunning ? "monitoring" : source?.status ?? "no source"}
        </span>
      </div>

      <div className="relative aspect-video bg-[#050708] flex items-center justify-center">
        {videoUrl ? (
          <>
            <video key={videoUrl} src={videoUrl} controls muted playsInline className="w-full h-full object-contain" />
            <span className="absolute top-3 left-3 max-w-[90%] truncate text-[11px] font-data tracking-wide px-2 py-1 rounded-[3px] bg-black/70 text-signal-low border border-signal-low/30">
              LOCAL PREVIEW · {videoName}
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 px-5 text-center">
            <p className="text-sm text-ink-faint font-data">Select a video file to preview and submit for detection.</p>
            <label className="cursor-pointer text-[11px] font-data tracking-wide px-3 py-2 rounded-[3px] bg-panel-raised text-ink border border-hairline hover:border-hairline-strong">
              SELECT VIDEO
              <input type="file" accept="video/*,.mp4,.avi,.mov,.mkv" onChange={handleVideoChange} className="sr-only" />
            </label>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-t border-hairline">
        <label className="cursor-pointer text-xs px-3 py-2 rounded-[3px] border border-hairline text-ink-muted hover:text-ink">
          {selectedFile ? "Replace video" : "Choose video"}
          <input type="file" accept="video/*,.mp4,.avi,.mov,.mkv" onChange={handleVideoChange} className="sr-only" />
        </label>
        <button type="button" disabled={!selectedFile || busy || isRunning} onClick={uploadVideo} className="text-xs px-3 py-2 rounded-[3px] bg-panel-raised border border-hairline text-ink disabled:opacity-40">
          {busy ? "Please wait…" : uploadedSourceId ? "Uploaded" : "Upload video"}
        </button>
        {!isRunning ? (
          <button type="button" disabled={!uploadedSourceId || busy} onClick={startMonitoring} className="text-xs px-3 py-2 rounded-[3px] bg-signal-low text-black font-medium disabled:opacity-40">
            Start monitoring
          </button>
        ) : (
          <button type="button" disabled={busy} onClick={stopMonitoring} className="text-xs px-3 py-2 rounded-[3px] border border-signal-high/40 text-signal-high disabled:opacity-40">
            Stop monitoring
          </button>
        )}
      </div>
      {message && <p role="status" className="px-5 pb-4 text-xs text-ink-muted">{message}</p>}
    </Card>
  );
}
