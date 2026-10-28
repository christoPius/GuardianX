"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { NormalizedPoint } from "@/types";
import { Button } from "@/components/ui/Button";

interface Props {
  mode: "polygon" | "line";
  points: NormalizedPoint[];
  onChange: (points: NormalizedPoint[]) => void;
  minPoints: number;
  accentColor: string;
  accentDim: string;
}

// Interactive drawing surface: the user clicks to place normalized points
// on top of a (mock) camera frame. This component only produces and edits
// coordinates — it performs no detection and knows nothing about zone or
// wall-climbing logic, which live entirely in the backend.
export function PointEditor({ mode, points, onChange, minPoints, accentColor, accentDim }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverPoint, setHoverPoint] = useState<NormalizedPoint | null>(null);
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

  const toNormalized = (clientX: number, clientY: number): NormalizedPoint | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const p = toNormalized(e.clientX, e.clientY);
    if (!p) return;
    onChange([...points, p]);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    setHoverPoint(toNormalized(e.clientX, e.clientY));
  };

  const removeLastPoint = () => onChange(points.slice(0, -1));
  const clearAll = () => onChange([]);

  const W = 640;
  const H = 360;
  const px = (p: NormalizedPoint) => p.x * W;
  const py = (p: NormalizedPoint) => p.y * H;

  const pathPoints = [...points, ...(hoverPoint && mode === "line" ? [] : [])];
  const polylineStr = pathPoints.map((p) => `${px(p)},${py(p)}`).join(" ");
  const closedPolygonStr =
    mode === "polygon" && points.length >= 3
      ? `${points.map((p) => `${px(p)},${py(p)}`).join(" ")}`
      : null;

  const isValid = points.length >= minPoints;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video rounded-[4px] border border-hairline bg-[#050708] overflow-hidden">
        {videoUrl && (
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 z-0 w-full h-full object-cover bg-[#050708]"
          />
        )}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 z-10 w-full h-full cursor-crosshair touch-none"
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPoint(null)}
          role="img"
          aria-label={`${mode === "polygon" ? "Restricted zone" : "Wall boundary"} editor. Click on the frame to add points.`}
        >
          {!videoUrl && (
            <>
              <rect width={W} height={H} fill="#0a0d12" />
              <rect width={W} height={H} fill="url(#editor-grid)" />
            </>
          )}
          <defs>
            <pattern id="editor-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="#1a212b" strokeWidth="1" />
            </pattern>
          </defs>

          {closedPolygonStr && (
            <polygon points={closedPolygonStr} fill={accentDim} stroke={accentColor} strokeWidth={2} opacity={0.85} />
          )}
          {!closedPolygonStr && polylineStr && (
            <polyline points={polylineStr} fill="none" stroke={accentColor} strokeWidth={2.5} />
          )}

          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={px(p)} cy={py(p)} r={6} fill={accentColor} stroke="#0a0d12" strokeWidth={1.5} />
              <text x={px(p) + 9} y={py(p) - 9} fontSize="11" fill="var(--color-ink-muted)" fontFamily="var(--font-data)">
                {idx + 1}
              </text>
            </g>
          ))}

          {points.length === 0 && (
            <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="13" fill="var(--color-ink-faint)" fontFamily="var(--font-data)">
              Click on the frame to place {mode === "polygon" ? "zone" : "boundary"} points
            </text>
          )}
        </svg>
      </div>

      <label className="self-start cursor-pointer text-xs font-data text-ink-muted border border-hairline-strong rounded-[3px] px-3 py-2 hover:text-ink">
        {videoUrl ? `Replace local video · ${videoName}` : "Load local video"}
        <input type="file" accept="video/*" onChange={handleVideoChange} className="sr-only" />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-data text-ink-muted">
          {points.length} point{points.length === 1 ? "" : "s"} placed
          {!isValid && points.length > 0 && ` · needs at least ${minPoints}`}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={removeLastPoint} disabled={points.length === 0}>
            Undo last point
          </Button>
          <Button variant="ghost" onClick={clearAll} disabled={points.length === 0}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
