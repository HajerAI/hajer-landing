import { changeDiffLabels, changeDiffs } from "@/content/copy";
import type { ChangePatternName, DiffLine } from "@/content/copy";

export function ChangeDiff({ name }: { name: ChangePatternName }) {
  const diff = changeDiffs[name];

  return (
    <div
      data-change-diff={name}
      className="flex w-full flex-col border border-hairline bg-void font-mono text-sm leading-[1.5] md:text-base"
    >
      <div className="border-b border-hairline p-5 md:p-6">
        <div className="mb-2 font-sans text-[10px] font-medium uppercase tracking-widest text-graphite">
          {changeDiffLabels.example}
        </div>
        <div className="text-white">
          <span className="mr-2 text-vermilion">›</span>
          {diff.example}
        </div>
      </div>
      <DiffHalf label={changeDiffLabels.current} lines={diff.current} divider />
      <DiffHalf label={changeDiffLabels.candidate} lines={diff.candidate} />
    </div>
  );
}

function DiffHalf({
  label,
  lines,
  divider = false,
}: {
  label: string;
  lines: readonly DiffLine[];
  divider?: boolean;
}) {
  return (
    <div
      className={`flex flex-1 flex-col justify-center p-5 md:p-6 ${
        divider ? "border-b border-hairline" : ""
      }`}
    >
      <div className="mb-2.5 font-sans text-[10px] font-medium uppercase tracking-widest text-graphite">
        {label}
      </div>
      <div className="space-y-1 whitespace-pre-wrap text-muted">
        {lines.map((line, lineIndex) => (
          <div
            key={lineIndex}
            className={[
              line.dim ? "text-graphite" : "",
              line.lit ? "text-white" : "",
              line.ind ? "pl-4" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {line.segments.map((segment, segmentIndex) => (
              <span
                key={segmentIndex}
                className={segment.changed ? "font-bold text-vermilion" : undefined}
              >
                {segment.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
