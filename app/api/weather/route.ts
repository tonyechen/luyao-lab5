import { NextResponse } from "next/server";
import { assertWeatherShape } from "@/lib/asserts";

const SEATTLE_LAT = 47.61;
const SEATTLE_LON = -122.33;

export async function GET() {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(SEATTLE_LAT));
  url.searchParams.set("longitude", String(SEATTLE_LON));
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min");
  url.searchParams.set("timezone", "America/Los_Angeles");
  url.searchParams.set("forecast_days", "3");

  try {
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Open-Meteo returned ${res.status}` },
        { status: 502 }
      );
    }
    const data = await res.json();
    assertWeatherShape(data);
    return NextResponse.json({
      latitude: data.latitude,
      longitude: data.longitude,
      days: data.daily.time.map((t: string, i: number) => ({
        date: t,
        max: data.daily.temperature_2m_max[i],
        min: data.daily.temperature_2m_min[i],
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
