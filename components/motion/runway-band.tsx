import { HajerMark } from "@/components/brand/HajerMark";
import { runway } from "@/content/copy";

/**
 * Left-to-right illustrative replay. Packets that remain consistent continue
 * into the candidate lane; concerning changes turn orange and disappear at
 * Hajer's assessment boundary. This is not a runtime enforcement diagram.
 */
export function RunwayBand() {
  return (
    <div className="relative h-full w-full" role="img" aria-label={runway.caption}>
      <div className="relative flex h-full w-full overflow-hidden bg-void" aria-hidden="true">
        <div className="relative h-full w-[35%] overflow-hidden bg-white text-void [--rw-blocked-bg:#090b0d] [--rw-blocked-text:#ffffff] [--rw-border:rgba(10,12,14,0.15)] [--rw-grid:rgba(10,12,14,0.04)] [--rw-packet-bg:#090b0d] [--rw-packet-text:#ffffff]">
          <TrackContent offset="0vw" />
        </div>

        <div className="relative h-full w-[30%] overflow-hidden border-x border-white/20 bg-void text-white [--rw-blocked-bg:#ff5a36] [--rw-blocked-text:#090b0d] [--rw-border:rgba(255,255,255,0.2)] [--rw-grid:rgba(255,255,255,0.04)] [--rw-packet-bg:#ffffff] [--rw-packet-text:#090b0d]">
          <TrackContent offset="-35vw" />
        </div>

        <div className="relative h-full w-[35%] overflow-hidden border-2 border-vermilion bg-vermilion text-void [--rw-blocked-bg:#090b0d] [--rw-blocked-text:#ffffff] [--rw-border:rgba(9,11,13,0.34)] [--rw-grid:rgba(9,11,13,0.14)] [--rw-packet-bg:#090b0d] [--rw-packet-text:#ffffff]">
          <TrackContent offset="-65vw" />
        </div>
      </div>
    </div>
  );
}

function TrackContent({ offset }: { offset: string }) {
  return (
    <div className="absolute top-0 flex h-full w-[100vw] flex-col" style={{ left: offset }}>
      <div className="runway-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute bottom-0 left-[50vw] top-0 w-px border-l border-dashed border-[var(--rw-border)]" />

      <div className="relative z-10 flex h-12 w-full items-center border-b border-[var(--rw-border)] font-mono text-[9px] font-bold uppercase tracking-widest opacity-90 sm:text-xs">
        <div className="absolute left-[3vw] flex items-center gap-1.5 sm:gap-2.5">
          <OpenAIMark />
          <span>{runway.zones.current}</span>
        </div>
        <div className="absolute left-[37vw] flex items-center gap-2 text-white">
          <HajerMark tone="inverse" decorative style={{ height: "16px", width: "20px" }} />
          <span className="font-sans text-[14px] font-bold tracking-[-0.03em]">{runway.zones.gate}</span>
        </div>
        <div className="absolute left-[67vw] flex items-center gap-1.5 sm:gap-2.5">
          <AnthropicMark />
          <span>{runway.zones.candidate}</span>
        </div>
      </div>

      <div className="runway-lane relative flex flex-1 items-center overflow-hidden border-b border-[var(--rw-border)]">
        {runway.packets.lane1.map((packet) => <Packet key={packet.label} {...packet} />)}
      </div>
      <div className="runway-lane relative flex flex-1 items-center overflow-hidden border-b border-[var(--rw-border)]">
        {runway.packets.lane2.map((packet) => <Packet key={packet.label} {...packet} />)}
      </div>
      <div className="runway-lane relative flex flex-1 items-center overflow-hidden">
        {runway.packets.lane3.map((packet) => <Packet key={packet.label} {...packet} />)}
      </div>
    </div>
  );
}

function Packet({
  label,
  delay,
  status,
}: {
  label: string;
  delay: string;
  status: "success" | "blocked";
}) {
  const tone = status === "blocked"
    ? "bg-[var(--rw-blocked-bg)] text-[var(--rw-blocked-text)]"
    : "bg-[var(--rw-packet-bg)] text-[var(--rw-packet-text)]";

  return (
    <div
      className={`absolute flex h-8 items-center px-4 font-mono text-[11px] font-bold uppercase tracking-wider shadow-sm ${tone} ${
        status === "blocked" ? "rw-packet-blocked" : "rw-packet-success"
      }`}
      style={{ animationDelay: delay }}
    >
      {label}
    </div>
  );
}

function OpenAIMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

function AnthropicMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor">
      <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
    </svg>
  );
}
