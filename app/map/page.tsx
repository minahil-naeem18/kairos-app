import WorldMapClient from "./world-map-client";

export default function MapPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">
        Explore Opportunities by Country
      </h1>
      <p className="mt-2 text-gray-600">
        Click on a country to see opportunities located there.
      </p>
      <WorldMapClient />
    </div>
  );
}