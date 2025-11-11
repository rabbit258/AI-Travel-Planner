import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { data, error } = await supabase
			.from("travel_plans")
			.select("*")
			.eq("user_id", user.id)
			.eq("is_active", true)
			.order("updated_at", { ascending: false });

		if (error) throw error;

		return NextResponse.json({ plans: data || [] });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { title, destination, startDate, days, budget, travelers, preferences, withChildren, language, planData } =
			body;

		const { data, error } = await supabase.from("travel_plans").insert({
			user_id: user.id,
			title: title || destination || "未命名行程",
			destination,
			start_date: startDate || null,
			days: days || null,
			budget: budget || null,
			travelers: travelers || null,
			preferences: Array.isArray(preferences) ? preferences : [],
			with_children: withChildren || false,
			language: language || "zh",
			plan_data: planData || {},
		}).select().single();

		if (error) throw error;

		return NextResponse.json({ plan: data });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const planId = searchParams.get("id");

		if (!planId) {
			return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
		}

		const { error } = await supabase
			.from("travel_plans")
			.update({ is_active: false })
			.eq("id", planId)
			.eq("user_id", user.id);

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

