import { NextResponse } from "next/server";

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not set in .env.local" },
      { status: 500 }
    );
  }

  try {
    const { imageBase64, cameraAngle, selectedType } = await request.json();

    const angleNote =
      cameraAngle === "behind"
        ? "Camera is positioned BEHIND HOME PLATE at catcher level, looking out toward the pitcher."
        : "Camera is positioned on the SIDE (first or third base line), perpendicular to the pitch.";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: `You are an expert softball pitching analyst. ${angleNote}

Analyze this frame to determine if a pitch was just delivered. Return ONLY valid JSON, no markdown.

JSON structure:
{
  "pitch_detected": true/false,
  "result": "called-strike" | "swinging-strike" | "ball" | "foul" | "in-play" | null,
  "zone": 1-9 or "high" | "low" | "inside" | "outside" | "way-out" | null,
  "pitch_type": "Fastball" | "Changeup" | "Dropball" | "Curveball" | "Riseball" | "Other" | null,
  "mechanic_note": "One short observation about mechanics, or null",
  "confidence": "high" | "medium" | "low"
}

Zone grid (catcher's view):
1=top-inside  2=top-middle  3=top-outside
4=mid-inside  5=center      6=mid-outside
7=bot-inside  8=bot-middle  9=bot-outside

If no pitch is visible or it is between pitches, set pitch_detected to false.`,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
              },
              {
                type: "text",
                text: `Analyze this softball pitching frame. Pitcher is throwing a ${selectedType}.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Anthropic API error" },
        { status: response.status }
      );
    }

    return NextResponse.json({ content: data.content, usage: data.usage });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
