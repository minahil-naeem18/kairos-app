"use client";

import { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function WorldMapClient() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/map/countries")
      .then((res) => res.json())
      .then(setCounts);
  }, []);

  function getCountryCount(name: string) {
    const match = Object.keys(counts).find(
      (key) =>
        key.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(key.toLowerCase())
    );
    return match ? counts[match] : 0;
  }

  function getColor(count: number) {
    if (count === 0) return "#E5E7EB";
    if (count <= 5) return "#C7D2FE";
    if (count <= 15) return "#818CF8";
    return "#4F46E5";
  }

  async function handleCountryClick(countryName: string) {
    console.log("Clicked country name from map:", countryName);
    setSelectedCountry(countryName);
    setLoading(true);
    const res = await fetch(`/api/map/country/${encodeURIComponent(countryName)}`);
    const data = await res.json();
    setOpportunities(data);
    setLoading(false);
  }

  return (
    <div className="mt-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
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
                    style={{
                      default: {
                        fill: getColor(count),
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        outline: "none",
                        transition: "fill 0.2s",
                      },
                      hover: {
                        fill: "#3730A3",
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#312E81",
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full" style={{ background: "#E5E7EB" }} />
            None
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full" style={{ background: "#C7D2FE" }} />
            Low
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full" style={{ background: "#818CF8" }} />
            Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full" style={{ background: "#4F46E5" }} />
            High
          </span>
        </div>
      </div>

      {selectedCountry && (
        <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedCountry}</h2>
              <p className="text-sm text-gray-600">
                {opportunities.length} opportunities found
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCountry(null);
                setOpportunities([]);
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-gray-900"
            >
              ← Explore World
            </button>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-gray-500">Loading opportunities...</p>
          ) : opportunities.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No opportunities found for this country yet.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {opp.category.name}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    {opp.title}
                  </h3>
                  {opp.provider && (
                    <p className="text-xs text-gray-500">{opp.provider.name}</p>
                  )}
                  <a
                    href={opp.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block rounded-md bg-gray-900 py-1.5 text-center text-xs font-medium text-white hover:bg-gray-800"
                  >
                    View & Apply
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}