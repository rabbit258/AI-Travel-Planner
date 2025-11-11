import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

type PlanInput = {
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
			"You are a travel planning assistant. Create practical, family-friendly itineraries with transport, lodging, attractions, food, and estimated costs. Return concise JSON.";

		const userPrompt = `
Destination: ${body.destination}
Start date: ${body.startDate ?? "unknown"}
Duration days: ${body.days ?? "unknown"}
Budget: ${body.budget ?? "unknown"}
Travelers: ${body.travelers ?? "unknown"}
Preferences: ${(body.preferences ?? []).join(", ") || "none"}
With children: ${body.withChildren ? "yes" : "no"}
Language: ${body.language ?? "zh"}

Return JSON with keys: itineraryByDay[], transport, lodging, restaurants, totalEstimatedCost, tips.
Each day should have: title, date, activities[], mapPOIs[] with {name, lat, lng}.
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


