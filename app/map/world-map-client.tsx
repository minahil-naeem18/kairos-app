"use client";

import { useRouter } from "next/navigation";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function WorldMapClient() {
  const router = useRouter();

  function handleCountryClick(countryName: string) {
    router.push(`/?q=${encodeURIComponent(countryName)}`);
  }

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
      <ComposableMap projectionConfig={{ scale: 140 }} height={400}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => handleCountryClick(geo.properties.name)}
                style={{
                  default: {
                    fill: "#E5E7EB",
                    stroke: "#FFFFFF",
                    strokeWidth: 0.5,
                    outline: "none",
                  },
                  hover: {
                    fill: "#4F46E5",
                    stroke: "#FFFFFF",
                    strokeWidth: 0.5,
                    outline: "none",
                    cursor: "pointer",
                  },
                  pressed: {
                    fill: "#3730A3",
                    outline: "none",
                  },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
      <p className="mt-3 text-center text-xs text-gray-400">
        Click any country to search opportunities there
      </p>
    </div>
  );
}