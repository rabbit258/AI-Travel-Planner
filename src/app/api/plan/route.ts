import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

type PlanInput = {
	origin?: string;
	destination: string;
	startDate?: string;
	days?: number;
	budget?: number;
	travelers?: number;
	preferences?: string[];
	withChildren?: boolean;
	language?: string;
};

export async function POST(req: NextRequest) {
	try {
		const body = (await req.json()) as Partial<PlanInput>;
		if (!body.destination) {
			return NextResponse.json({ error: "destination is required" }, { status: 400 });
		}

		const client = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
			baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
		});

		const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

		const systemPrompt =
			"You are a travel planning assistant. Create practical, family-friendly itineraries with transport, lodging, attractions, food, and estimated costs. Return concise JSON. Always return transport, lodging, and restaurants as arrays of strings (not objects). When origin (departure location) is provided, consider transportation from origin to destination in your planning.";

		const userPrompt = `
Travel Planning Request:
- Origin (Departure Location): ${body.origin ?? "not specified"}
- Destination: ${body.destination}
- Start date: ${body.startDate ?? "unknown"}
- Duration days: ${body.days ?? "unknown"}
- Budget: ${body.budget ?? "unknown"}
- Travelers: ${body.travelers ?? "unknown"}
- Preferences: ${(body.preferences ?? []).join(", ") || "none"}
- With children: ${body.withChildren ? "yes" : "no"}
- Language: ${body.language ?? "zh"}

${body.origin ? `IMPORTANT: The user is traveling FROM "${body.origin}" TO "${body.destination}". Please consider transportation options from the origin to the destination in your recommendations.` : ""}

Return JSON with the following structure:
{
  "itineraryByDay": [
    {
      "title": "Day 1 title",
      "date": "2025-11-15",
      "activities": [
        {"time": "09:00", "title": "Activity name", "desc": "Description", "costCNY": 100}
      ],
      "mapPOIs": [{"name": "Location name", "lat": 35.6762, "lng": 139.6503}]
    }
  ],
  "transport": ["Transport option 1", "Transport option 2"],
  "lodging": ["Hotel name 1", "Hotel name 2"],
  "restaurants": ["Restaurant name 1", "Restaurant name 2"],
  "totalEstimatedCost": 5000,
  "tips": ["Tip 1", "Tip 2"],
  "budgetBreakdown": [{"category": "交通", "amount": 1000}, {"category": "住宿", "amount": 2000}]
}

IMPORTANT: transport, lodging, restaurants, and tips must be arrays of strings (plain text), NOT objects.
Costs in CNY with reasonable estimates.
`;

		const completion = await client.chat.completions.create({
			model,
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			response_format: { type: "json_object" },
			temperature: 0.4,
		});

		const content = completion.choices[0]?.message?.content || "{}";
		return new NextResponse(content, {
			headers: { "content-type": "application/json; charset=utf-8" },
		});
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: "failed_to_generate_plan" }, { status: 500 });
	}
}


