import WorldMapClient from "./world-map-client";

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
            <h1 className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>
        Explore Opportunities by Country
      </h1>
      <p className="mt-2" style={{ color: "var(--muted)" }}>
        Click on a country to see opportunities located there.
      </p>
      <WorldMapClient initialCountry={country} />
    </div>
  );
}