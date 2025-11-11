import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const planId = searchParams.get("plan_id");

		if (!planId) {
			return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
		}

		const { data, error } = await supabase
			.from("expenses")
			.select("*")
			.eq("plan_id", planId)
			.eq("user_id", user.id)
			.order("expense_date", { ascending: true });

		if (error) throw error;

		return NextResponse.json({ expenses: data || [] });
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
		const { planId, category, amountCNY, notes, expenseDate } = body;

		const { data, error } = await supabase
			.from("expenses")
			.insert({
				plan_id: planId,
				user_id: user.id,
				category,
				amount_cny: amountCNY,
				notes: notes || null,
				expense_date: expenseDate || null,
			})
			.select()
			.single();

		if (error) throw error;

		return NextResponse.json({ expense: data });
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
		const expenseId = searchParams.get("id");

		if (!expenseId) {
			return NextResponse.json({ error: "Expense ID required" }, { status: 400 });
		}

		const { error } = await supabase
			.from("expenses")
			.delete()
			.eq("id", expenseId)
			.eq("user_id", user.id);

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

