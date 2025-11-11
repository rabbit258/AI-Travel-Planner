import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

export function getSupabaseBrowserClient() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !anonKey) {
		console.warn("Supabase environment variables are missing.");
	}
	return createBrowserClient(url ?? "", anonKey ?? "");
}


