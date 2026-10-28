"use client";

import { useState } from "react";
import type { OwnerFeedback, ReviewStatus } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ReviewBadge } from "@/components/ui/Badge";
import { formatTimestamp } from "@/lib/utils/format";

export function FeedbackControls({
  feedback,
  onSubmit,
}: {
  feedback: OwnerFeedback;
  onSubmit: (feedback: OwnerFeedback) => Promise<void>;
}) {
  const [note, setNote] = useState(feedback.note ?? "");
  const [submitting, setSubmitting] = useState<ReviewStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (status: ReviewStatus) => {
    setSubmitting(status);
    setError(null);
    try {
      await onSubmit({ status, note: note.trim() ? note.trim() : null, reviewedAt: null });
    } catch {
      setError("Couldn't save your review. Try again.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Owner Review"
        description="Confirming or dismissing helps NightGuard AI's records — this does not report anything externally."
        action={<ReviewBadge status={feedback.status} />}
      />

      <div className="flex flex-col gap-3">
        <label htmlFor="feedback-note" className="text-xs font-data text-ink-muted uppercase tracking-wide">
          Note (optional)
        </label>
        <textarea
          id="feedback-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Add context for this review, e.g. who this was"
          className="w-full bg-panel-raised border border-hairline-strong rounded-[3px] px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-signal-info resize-none"
        />

        {error && (
          <p role="alert" className="text-sm text-signal-high">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={() => handleSubmit("confirmed")}
            disabled={submitting !== null}
          >
            {submitting === "confirmed" ? "Saving…" : "Confirm"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit("false_alarm")}
            disabled={submitting !== null}
          >
            {submitting === "false_alarm" ? "Saving…" : "Mark False Alarm"}
          </Button>
        </div>

        {feedback.status !== "unreviewed" && feedback.reviewedAt && (
          <p className="text-xs text-ink-faint font-data">
            Last reviewed {formatTimestamp(feedback.reviewedAt)}
          </p>
        )}
      </div>
    </Card>
  );
}
