// Asserts cover Component D (external API contract) and Component E (events/Supabase pipeline).
// They throw on failure so a caller's try/catch can surface a graceful error to the user.

export type WeatherResponse = {
  latitude: number;
  longitude: number;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

export function assertWeatherShape(data: unknown): asserts data is WeatherResponse {
  if (!data || typeof data !== "object") {
    throw new Error("Open-Meteo: response is not an object");
  }
  const d = data as Record<string, unknown>;
  if (typeof d.latitude !== "number" || typeof d.longitude !== "number") {
    throw new Error("Open-Meteo: missing numeric latitude/longitude");
  }
  if (!d.daily || typeof d.daily !== "object") {
    throw new Error("Open-Meteo: missing 'daily' object");
  }
  const daily = d.daily as Record<string, unknown>;
  if (!Array.isArray(daily.time) || !Array.isArray(daily.temperature_2m_max)) {
    throw new Error("Open-Meteo: 'daily.time' or 'daily.temperature_2m_max' is not an array");
  }
  if (daily.time.length !== daily.temperature_2m_max.length) {
    throw new Error("Open-Meteo: 'daily.time' length does not match 'temperature_2m_max'");
  }
  if (!daily.temperature_2m_max.every((n) => typeof n === "number")) {
    throw new Error("Open-Meteo: 'temperature_2m_max' contains non-numeric entries");
  }
}

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  category: "lecture" | "workshop" | "career" | "social";
  starts_at: string;
  location: string | null;
};

// Component E assert #1: query result is an array.
export function assertEventsArray(data: unknown): asserts data is unknown[] {
  if (!Array.isArray(data)) {
    throw new Error("Supabase events: expected an array");
  }
}

// Component E assert #2: each row has the required fields with correct types.
export function assertEventShape(row: unknown): asserts row is EventRow {
  if (!row || typeof row !== "object") {
    throw new Error("Supabase events: row is not an object");
  }
  const r = row as Record<string, unknown>;
  const required = ["id", "title", "category", "starts_at"] as const;
  for (const key of required) {
    if (typeof r[key] !== "string") {
      throw new Error(`Supabase events: row missing required string field '${key}'`);
    }
  }
  const allowed = ["lecture", "workshop", "career", "social"];
  if (!allowed.includes(r.category as string)) {
    throw new Error(`Supabase events: invalid category '${String(r.category)}'`);
  }
}
