export const COUNTRY_KEYWORDS: Record<string, string[]> = {
  Germany: ["germany", "deutschland", "berlin", "münchen", "munich", "hamburg", "frankfurt", "cologne", "köln", "stuttgart", "düsseldorf", "dusseldorf", "leipzig", "dresden", "essen", "hannover", "mainz", "bonn", "freiburg", "augsburg", "wildau", "bielefeld", "offenburg", "riedlingen", "kirchberg", "bauerbach", "geiselbach", "zeitz", "morsbach", "vellberg", "breitenbrunn", "niederlangen"],
  "United Kingdom": ["united kingdom", "uk", "london", "bristol", "england", "paris; prague"],
  "United States of America": ["united states", "us,", ", us", "county", "new york", "chicago", "texas", "california", "colorado", "orlando", "dallas", "houston", "denver", "austin", "philadelphia", "nashville", "boston"],
  Turkey: ["turkey", "türkiye"],
  Canada: ["canada"],
  Hungary: ["hungary"],
  Australia: ["australia"],
  Japan: ["japan"],
  India: ["india"],
  France: ["france"],
  "New Zealand": ["new zealand"],
  "South Africa": ["south africa"],
  Poland: ["poland"],
  Netherlands: ["netherlands"],
  Italy: ["italy"],
  Spain: ["spain"],
  Austria: ["austria"],
  Belgium: ["belgium"],
  Brazil: ["brazil"],
  Mexico: ["mexico"],
  Singapore: ["singapore"],
  Switzerland: ["switzerland"],
  China: ["china"],
  "South Korea": ["south korea", "korea"],
  Malaysia: ["malaysia"],
  Indonesia: ["indonesia"],
  Taiwan: ["taiwan"],
  "Saudi Arabia": ["saudi arabia"],
};

export function mapToCountry(location: string): string | null {
  const lower = location.toLowerCase();
  for (const [country, keywords] of Object.entries(COUNTRY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return country;
    }
  }
  return null;
}