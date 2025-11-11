"use client";

import { useEffect, useRef } from "react";
import type { POI } from "@/types/plan";

type Props = {
	pois: POI[];
	className?: string;
	height?: number;
};

declare global {
	interface Window {
		AMap: any;
	}
}

export default function MapView({ pois, className, height = 420 }: Props) {
	const mapRef = useRef<HTMLDivElement | null>(null);
	const mapInstanceRef = useRef<any>(null);

	// Load AMap script dynamically
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (window.AMap) return; // already loaded
		const key = process.env.NEXT_PUBLIC_AMAP_KEY;
		if (!key) {
			console.warn("AMap key missing: NEXT_PUBLIC_AMAP_KEY");
			return;
		}
		const script = document.createElement("script");
		script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`;
		script.async = true;
		document.head.appendChild(script);
		return () => {
			document.head.removeChild(script);
		};
	}, []);

	// Initialize map
	useEffect(() => {
		if (!mapRef.current || !window.AMap) return;
		if (!mapInstanceRef.current) {
			mapInstanceRef.current = new window.AMap.Map(mapRef.current, {
				zoom: 11,
				center: [116.397428, 39.90923], // Default to Beijing until POIs come in
			});
		}
	}, []);

	// Update markers when POIs change
	useEffect(() => {
		const map = mapInstanceRef.current;
		if (!map || !window.AMap) return;
		// clear existing markers
		map.clearMap();
		if (!pois || pois.length === 0) return;

		const markers = pois.map((p) => {
			const m = new window.AMap.Marker({
				position: [p.lng, p.lat],
				title: p.name,
			});
			map.add(m);
			return m;
		});

		const bounds = new window.AMap.Bounds(
			[ Math.min(...pois.map(p => p.lng)), Math.min(...pois.map(p => p.lat)) ],
			[ Math.max(...pois.map(p => p.lng)), Math.max(...pois.map(p => p.lat)) ],
		);
		map.setBounds(bounds, undefined, 50);

		return () => {
			markers.forEach((m: any) => m.setMap(null));
		};
	}, [pois]);

	return (
		<div className={className}>
			<div ref={mapRef} style={{ width: "100%", height }} />
		</div>
	);
}


