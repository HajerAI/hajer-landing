"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { ChangeDiff } from "@/components/motion/change-diff";
import { changeExplorer } from "@/content/copy";
import type { ChangePatternName } from "@/content/copy";

export function ChangeExplorer() {
  const [activeName, setActiveName] = useState<ChangePatternName>(
    changeExplorer.patterns[0].name,
  );
  const active =
    changeExplorer.patterns.find((pattern) => pattern.name === activeName) ??
    changeExplorer.patterns[0];

  function selectPattern(name: ChangePatternName, inputMethod: "menu" | "button") {
    setActiveName(name);
    posthog.capture("change_pattern_selected", {
      pattern_name: name,
      input_method: inputMethod,
    });
  }

  return (
    <section
      id="changes"
      data-change-explorer
      className="section-anchor border-b border-hairline bg-carbon py-20 md:py-28"
    >
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(360px,0.55fr)] lg:gap-20">
          <h2 className="max-w-3xl text-balance text-3xl font-medium tracking-[-0.03em] text-white md:text-5xl">
            {changeExplorer.headline}
          </h2>
          <p className="max-w-xl text-base leading-7 text-muted lg:pt-2">
            {changeExplorer.intro}
          </p>
        </div>

        <div className="mt-12 border border-hairline-strong bg-void">
          <div className="border-b border-hairline p-4 lg:hidden">
            <label htmlFor="change-pattern" className="mb-2 block text-sm text-muted">
              Choose a change pattern
            </label>
            <select
              id="change-pattern"
              value={activeName}
              onChange={(event) =>
                selectPattern(event.target.value as ChangePatternName, "menu")
              }
              className="h-12 w-full border border-hairline-strong bg-carbon px-3 text-white"
            >
              {changeExplorer.patterns.map((pattern) => (
                <option key={pattern.name} value={pattern.name}>
                  {pattern.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.35fr)]">
            <div className="hidden border-r border-hairline lg:block">
              {changeExplorer.patterns.map((pattern, index) => {
                const selected = pattern.name === active.name;
                return (
                  <button
                    key={pattern.name}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectPattern(pattern.name, "button")}
                    className={`grid w-full grid-cols-[2rem_1fr] gap-3 border-b border-hairline px-5 py-4 text-left transition-colors last:border-b-0 ${
                      selected
                        ? "bg-carbon text-white"
                        : "text-muted hover:bg-carbon/60 hover:text-white"
                    }`}
                  >
                    <span
                      className={`font-mono text-[11px] ${
                        selected ? "text-vermilion" : "text-graphite"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <strong className="block text-sm font-medium">{pattern.name}</strong>
                      <span className="mt-1 block text-xs leading-5 text-graphite">
                        {pattern.summary}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-5 sm:p-7 md:p-10" aria-live="polite">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,0.72fr)_minmax(320px,1fr)] xl:items-start">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-vermilion">
                    Illustrative change
                  </p>
                  <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-white">
                    {active.name}
                  </h3>
                  <p className="mt-5 text-base leading-7 text-muted">{active.what}</p>
                  <p className="mt-5 border-t border-hairline pt-5 text-sm leading-6 text-graphite">
                    {active.why}
                  </p>
                </div>
                <ChangeDiff name={active.name} />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 max-w-4xl text-base leading-7 text-muted">
          {changeExplorer.closing}
        </p>
      </div>
    </section>
  );
}
