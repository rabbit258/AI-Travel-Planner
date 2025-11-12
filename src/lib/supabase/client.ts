import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const missingConfigError =
	"Supabase 环境变量未配置。请设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY。";

type PlaceholderSupabase = SupabaseClient<any, "public", any>;

const placeholderQueryBuilder: any = {
	select: () => Promise.reject(new Error(missingConfigError)),
	insert: () => Promise.reject(new Error(missingConfigError)),
	update: () => Promise.reject(new Error(missingConfigError)),
	delete: () => Promise.reject(new Error(missingConfigError)),
	eq() {
		return this;
	},
	order() {
		return this;
	},
	single() {
		return this;
	},
};

const placeholderClient: PlaceholderSupabase = {
	auth: {
		async getSession() {
			if (process.env.NODE_ENV !== "production") {
				console.warn(missingConfigError);
			}
			return { data: { session: null }, error: new Error(missingConfigError) };
		},
		onAuthStateChange() {
			if (process.env.NODE_ENV !== "production") {
				console.warn(missingConfigError);
			}
			return {
				data: {
					subscription: {
						unsubscribe() {
							// no-op
						},
					},
				},
				error: new Error(missingConfigError),
			};
		},
		async signInWithPassword() {
			return { data: null, error: new Error(missingConfigError) };
		},
		async signUp() {
			return { data: null, error: new Error(missingConfigError) };
		},
		async signOut() {
			return { error: new Error(missingConfigError) };
		},
	} as PlaceholderSupabase["auth"],
	from() {
		if (process.env.NODE_ENV !== "production") {
			console.warn(missingConfigError);
		}
		return placeholderQueryBuilder;
	},
} as unknown as PlaceholderSupabase;

let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
	if (typeof window === "undefined") {
		return placeholderClient;
	}

	if (browserClient) {
		return browserClient;
	}

	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!url || !anonKey) {
		console.error(missingConfigError);
		return placeholderClient;
	}

	browserClient = createBrowserClient(url, anonKey);
	return browserClient;
}

