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

    // Tailored system prompts per camera angle
    const systemPrompt = cameraAngle === "behind"
      ? `You are an expert softball pitching analyst. The camera is mounted HIGH on the backstop fence directly behind home plate, looking out toward the pitcher. You can see the full pitching lane, the pitcher's release, and the ball traveling toward the camera.

Analyze this frame and return ONLY valid JSON, no markdown.

JSON structure:
{
  "pitch_detected": true/false,
  "result": "called-strike" | "swinging-strike" | "ball" | "foul" | "in-play" | null,
  "zone": 1-9 or "high" | "low" | "inside" | "outside" | "way-out" | null,
  "pitch_type": "Fastball" | "Changeup" | "Dropball" | "Curveball" | "Riseball" | "Other" | null,
  "mechanic_note": "One short observation about mechanics or null",
  "confidence": "high" | "medium" | "low"
}

Zone grid (catcher's view, looking at pitcher):
1=top-inside  2=top-middle  3=top-outside
4=mid-inside  5=center      6=mid-outside
7=bot-inside  8=bot-middle  9=bot-outside

Focus on: ball location crossing the plate, batter reaction, catcher position.
If no pitch is in progress or frame is unclear, set pitch_detected to false.`

      : `You are an expert softball pitching analyst. The camera is on a tripod along the THIRD BASE LINE (or first base line), 10-15 feet back from home plate, giving a side-on perpendicular view of the pitching lane. You can see the full pitcher's body, the ball traveling horizontally across the frame, home plate, and the catcher.

This is the best angle for mechanics analysis. Analyze this frame and return ONLY valid JSON, no markdown.

JSON structure:
{
  "pitch_detected": true/false,
  "result": "called-strike" | "swinging-strike" | "ball" | "foul" | "in-play" | null,
  "zone": 1-9 or "high" | "low" | "inside" | "outside" | "way-out" | null,
  "pitch_type": "Fastball" | "Changeup" | "Dropball" | "Curveball" | "Riseball" | "Other" | null,
  "mechanic_note": "One focused observation from this list: stride length, drive leg push-off, hip rotation timing, arm circle speed, wrist snap, release point height, follow-through, or balance at finish. Be specific — e.g. 'Short stride — less than shoulder width' or 'Good hip rotation ahead of arm'. Return null if unclear.",
  "confidence": "high" | "medium" | "low"
}

Zone height guide from side view:
- Ball above the batter's letters = high
- Ball at letters to belt = top zone (1-2-3)
- Ball at belt to mid-thigh = middle zone (4-5-6)  
- Ball at mid-thigh to knees = bottom zone (7-8-9)
- Ball below knees = low

Zone depth (inside/outside) is harder from side view — use "inside" or "outside" if clearly off the plate, otherwise estimate zone 2/5/8 (middle column).

Focus especially on: pitcher's full body mechanics from windup through release and follow-through, ball height at the plate, catcher's catch location.
If no pitch is in progress or frame is unclear, set pitch_detected to false.`;

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
        system: systemPrompt,
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
                text: `Analyze this softball pitching frame. Camera angle: ${cameraAngle === "behind" ? "behind home plate" : "side view (third base line)"}. Expected pitch type: ${selectedType}.`,
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
