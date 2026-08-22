"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const CATEGORY_STYLES: Record<string, { color: string; bg: string }> = {
  Jobs: { color: "var(--cat-jobs)", bg: "var(--cat-jobs-bg)" },
  Internships: { color: "var(--cat-internships)", bg: "var(--cat-internships-bg)" },
  Scholarships: { color: "var(--cat-scholarships)", bg: "var(--cat-scholarships-bg)" },
};

function catStyle(name: string) {
  return CATEGORY_STYLES[name] || { color: "var(--primary)", bg: "var(--surface-alt)" };
}

export default function WorldMapClient({ initialCountry }: { initialCountry?: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState<{ name: string; count: number; x: number; y: number } | null>(null);

  useEffect(() => {
    fetch("/api/map/countries")
      .then((res) => res.json())
      .then(setCounts);
  }, []);

  useEffect(() => {
    if (initialCountry) {
      handleCountryClick(decodeURIComponent(initialCountry));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCountry]);

  function getCountryCount(name: string) {
    const match = Object.keys(counts).find(
      (key) =>
        key.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(key.toLowerCase())
    );
    return match ? counts[match] : 0;
  }

  function getColor(count: number) {
    // Every country gets a base "land" tint, intensity increases with opportunity count
    if (count === 0) return "color-mix(in srgb, var(--teal) 12%, var(--surface-alt))";
    if (count <= 5) return "color-mix(in srgb, var(--primary) 35%, var(--surface-alt))";
    if (count <= 15) return "color-mix(in srgb, var(--primary) 65%, var(--surface-alt))";
    return "var(--primary)";
  }

  async function handleCountryClick(countryName: string) {
    setSelectedCountry(countryName);
    setLoading(true);
    const res = await fetch(`/api/map/country/${encodeURIComponent(countryName)}`);
    const data = await res.json();
    setOpportunities(data.opportunities || []);
    setBreakdown(data.breakdown || {});
    setLoading(false);
  }

  return (
    <div className="mt-6">
      <div className="gor-mesh rounded-2xl p-6">
        <div className="gor-glass relative rounded-xl p-4">
          {tooltip && (
            <div
              className="pointer-events-none absolute z-20 rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg"
              style={{
                left: tooltip.x + 12,
                top: tooltip.y,
                background: "var(--surface)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="font-semibold">{tooltip.name}</div>
              <div style={{ color: "var(--muted)" }}>{tooltip.count} opportunities</div>
            </div>
          )}

          <ComposableMap projectionConfig={{ scale: 140 }} height={400}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const count = getCountryCount(geo.properties.name);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleCountryClick(geo.properties.name)}
                      onMouseEnter={(evt) => {
                        setTooltip({
                          name: geo.properties.name,
                          count,
                          x: evt.clientX,
                          y: evt.clientY,
                        });
                      }}
                      onMouseMove={(evt) => {
                        setTooltip((prev) =>
                          prev ? { ...prev, x: evt.clientX, y: evt.clientY } : prev
                        );
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        default: {
                          fill: getColor(count),
                          stroke: "var(--surface)",
                          strokeWidth: 0.6,
                          outline: "none",
                          transition: "fill 0.2s",
                        },
                        hover: {
                          fill: "var(--teal)",
                          stroke: "var(--surface)",
                          strokeWidth: 0.6,
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "var(--primary-hover)",
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          <div className="mt-3 flex items-center justify-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full" style={{ background: "color-mix(in srgb, var(--teal) 12%, var(--surface-alt))" }} /> None
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 35%, var(--surface-alt))" }} /> Low
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 65%, var(--surface-alt))" }} /> Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full" style={{ background: "var(--primary)" }} /> High
            </span>
          </div>
        </div>
      </div>

      {selectedCountry && (
        <div
          className="mt-6 rounded-2xl border p-6"
          style={{ borderColor: "var(--primary)", background: "var(--surface)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{selectedCountry}</h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{opportunities.length} opportunities found</p>
            </div>
            <button
              onClick={() => {
                setSelectedCountry(null);
                setOpportunities([]);
                setBreakdown({});
              }}
              className="rounded-full border px-4 py-1.5 text-sm font-medium transition hover:shadow-sm"
              style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--surface)" }}
            >
              ← Explore World
            </button>
          </div>

          {Object.keys(breakdown).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(breakdown).map(([cat, count]) => {
                const style = catStyle(cat);
                return (
                  <span
                    key={cat}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {cat}: {count}
                  </span>
                );
              })}
            </div>
          )}

          {loading ? (
            <p className="mt-6 text-sm" style={{ color: "var(--muted)" }}>Loading opportunities...</p>
          ) : opportunities.length === 0 ? (
            <p className="mt-6 text-sm" style={{ color: "var(--muted)" }}>
              No opportunities found for this country yet.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opp) => {
                const style = catStyle(opp.category.name);
                return (
                  <Link
                    key={opp.id}
                    href={`/opportunity/${opp.id}`}
                    className="rounded-xl border-l-4 border-y border-r p-4 transition hover:shadow-sm"
                    style={{ borderColor: "var(--border)", borderLeftColor: style.color, background: "var(--surface)" }}
                  >
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {opp.category.name}
                    </span>
                    <h3 className="mt-2 text-sm font-semibold line-clamp-2" style={{ color: "var(--foreground)" }}>
                      {opp.title}
                    </h3>
                    {opp.provider && <p className="text-xs" style={{ color: "var(--muted)" }}>{opp.provider.name}</p>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}