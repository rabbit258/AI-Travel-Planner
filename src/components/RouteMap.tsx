"use client";

import { useEffect, useRef } from "react";
import type { LocationInfo, RouteInfo, POI } from "@/types/plan";

type Props = {
	originLocation?: LocationInfo;
	destinationLocation?: LocationInfo;
	routeInfo?: RouteInfo;
	pois?: POI[];
	height?: number;
	className?: string;
};

declare global {
	interface Window {
		L: any;
	}
}

export default function RouteMap({
	originLocation,
	destinationLocation,
	routeInfo,
	pois = [],
	height = 420,
	className,
}: Props) {
	const mapRef = useRef<HTMLDivElement | null>(null);
	const mapInstanceRef = useRef<any>(null);
	const markersRef = useRef<any[]>([]);
	const routeLineRef = useRef<any>(null);

	// Load Leaflet CSS and JS
	useEffect(() => {
		if (typeof window === "undefined") return;

		// Load Leaflet CSS
		if (!document.querySelector('link[href*="leaflet.css"]')) {
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
			link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
			link.crossOrigin = "";
			document.head.appendChild(link);
		}

		// Load Leaflet JS
		if (window.L) {
			initMap();
			return;
		}

		if (!document.querySelector('script[src*="leaflet"]')) {
			const script = document.createElement("script");
			script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
			script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
			script.crossOrigin = "";
			script.onload = () => {
				initMap();
			};
			script.onerror = () => {
				console.error("Leaflet 脚本加载失败");
			};
			document.body.appendChild(script);
		}
	}, []);

	const initMap = () => {
		if (!mapRef.current || !window.L || mapInstanceRef.current) return;

		try {
			// 初始化地图，默认中心点：北京
			const map = window.L.map(mapRef.current, {
				zoomControl: true,
				scrollWheelZoom: true,
			});

			// 添加 OpenStreetMap 图层
			window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19,
			}).addTo(map);

			mapInstanceRef.current = map;

			// 如果有出发地和目的地，设置地图视野
			if (originLocation && destinationLocation) {
				const bounds = window.L.latLngBounds([
					[originLocation.lat, originLocation.lng],
					[destinationLocation.lat, destinationLocation.lng],
				]);
				map.fitBounds(bounds, { padding: [50, 50] });
			} else if (originLocation) {
				map.setView([originLocation.lat, originLocation.lng], 10);
			} else {
				map.setView([39.9042, 116.4074], 10); // 默认北京
			}
		} catch (error) {
			console.error("初始化地图失败:", error);
		}
	};

	// 更新标记点和路线
	useEffect(() => {
		if (!mapInstanceRef.current || !window.L) return;

		const map = mapInstanceRef.current;

		// 清除现有标记
		markersRef.current.forEach((marker) => {
			map.removeLayer(marker);
		});
		markersRef.current = [];

		// 清除现有路线
		if (routeLineRef.current) {
			map.removeLayer(routeLineRef.current);
			routeLineRef.current = null;
		}

		// 添加出发地标记
		if (originLocation) {
			const originIcon = window.L.divIcon({
				className: "custom-marker origin-marker",
				html: `<div style="
					width: 24px;
					height: 24px;
					background: #3b82f6;
					border: 3px solid white;
					border-radius: 50%;
					box-shadow: 0 2px 4px rgba(0,0,0,0.3);
				"></div>`,
				iconSize: [24, 24],
				iconAnchor: [12, 12],
			});

			const originMarker = window.L.marker([originLocation.lat, originLocation.lng], {
				icon: originIcon,
			})
				.addTo(map)
				.bindPopup(`<b>出发地</b><br>${originLocation.name}`);

			markersRef.current.push(originMarker);
		}

		// 添加目的地标记
		if (destinationLocation) {
			const destIcon = window.L.divIcon({
				className: "custom-marker dest-marker",
				html: `<div style="
					width: 24px;
					height: 24px;
					background: #ef4444;
					border: 3px solid white;
					border-radius: 50%;
					box-shadow: 0 2px 4px rgba(0,0,0,0.3);
				"></div>`,
				iconSize: [24, 24],
				iconAnchor: [12, 12],
			});

			const destMarker = window.L.marker([destinationLocation.lat, destinationLocation.lng], {
				icon: destIcon,
			})
				.addTo(map)
				.bindPopup(`<b>目的地</b><br>${destinationLocation.name}`);

			markersRef.current.push(destMarker);
		}

		// 绘制路线
		if (originLocation && destinationLocation) {
			// 如果有路线信息，可以绘制更详细的路径
			// 这里先绘制直线，后续可以根据 routeInfo.steps 绘制详细路径
			const routeCoordinates = [
				[originLocation.lat, originLocation.lng],
				[destinationLocation.lat, destinationLocation.lng],
			];

			const routeLine = window.L.polyline(routeCoordinates, {
				color: "#10b981",
				weight: 4,
				opacity: 0.7,
				dashArray: "10, 5",
			}).addTo(map);

			routeLineRef.current = routeLine;

			// 在路线中间添加距离标签
			if (routeInfo && routeInfo.distance) {
				const midLat = (originLocation.lat + destinationLocation.lat) / 2;
				const midLng = (originLocation.lng + destinationLocation.lng) / 2;

				const distanceText = routeInfo.distance >= 1000
					? `${(routeInfo.distance / 1000).toFixed(1)} 公里`
					: `${routeInfo.distance} 米`;

				window.L.marker([midLat, midLng], {
					icon: window.L.divIcon({
						className: "route-label",
						html: `<div style="
							background: white;
							padding: 4px 8px;
							border-radius: 4px;
							border: 2px solid #10b981;
							font-size: 11px;
							font-weight: bold;
							color: #059669;
							white-space: nowrap;
							box-shadow: 0 2px 4px rgba(0,0,0,0.2);
						">${distanceText}</div>`,
						iconSize: [100, 30],
						iconAnchor: [50, 15],
					}),
				}).addTo(map);
			}

			// 调整地图视野以包含出发地和目的地
			const bounds = window.L.latLngBounds([
				[originLocation.lat, originLocation.lng],
				[destinationLocation.lat, destinationLocation.lng],
			]);
			map.fitBounds(bounds, { padding: [50, 50] });
		}

		// // 添加 POI 标记（去重，避免重复显示）
		// // 使用 Set 根据坐标去重
		// const uniquePOIs = new Map<string, POI>();
		// pois.forEach((poi) => {
		// 	const key = `${poi.lat.toFixed(4)}_${poi.lng.toFixed(4)}`;
		// 	if (!uniquePOIs.has(key)) {
		// 		uniquePOIs.set(key, poi);
		// 	}
		// });

		// uniquePOIs.forEach((poi) => {
		// 	// 跳过与出发地或目的地相同的POI
		// 	if (originLocation && 
		// 		Math.abs(poi.lat - originLocation.lat) < 0.001 && 
		// 		Math.abs(poi.lng - originLocation.lng) < 0.001) {
		// 		return;
		// 	}
		// 	if (destinationLocation && 
		// 		Math.abs(poi.lat - destinationLocation.lat) < 0.001 && 
		// 		Math.abs(poi.lng - destinationLocation.lng) < 0.001) {
		// 		return;
		// 	}

		// 	const poiIcon = window.L.divIcon({
		// 		className: "custom-marker poi-marker",
		// 		html: `<div style="
		// 			width: 16px;
		// 			height: 16px;
		// 			background: #8b5cf6;
		// 			border: 2px solid white;
		// 			border-radius: 50%;
		// 			box-shadow: 0 2px 4px rgba(0,0,0,0.3);
		// 		"></div>`,
		// 		iconSize: [16, 16],
		// 		iconAnchor: [8, 8],
		// 	});

		// 	const poiMarker = window.L.marker([poi.lat, poi.lng], {
		// 		icon: poiIcon,
		// 	})
		// 		.addTo(map)
		// 		.bindPopup(`<b>${poi.name}</b>`);

		// 	markersRef.current.push(poiMarker);
		// });

		// // 如果有 POI，调整视野包含所有点
		// if (uniquePOIs.size > 0 && (originLocation || destinationLocation)) {
		// 	const allPoints: [number, number][] = [];
		// 	if (originLocation) allPoints.push([originLocation.lat, originLocation.lng]);
		// 	if (destinationLocation) allPoints.push([destinationLocation.lat, destinationLocation.lng]);
		// 	uniquePOIs.forEach((poi) => {
		// 		// 只添加不与出发地/目的地重复的POI
		// 		if (!(originLocation && 
		// 			Math.abs(poi.lat - originLocation.lat) < 0.001 && 
		// 			Math.abs(poi.lng - originLocation.lng) < 0.001) &&
		// 			!(destinationLocation && 
		// 			Math.abs(poi.lat - destinationLocation.lat) < 0.001 && 
		// 			Math.abs(poi.lng - destinationLocation.lng) < 0.001)) {
		// 			allPoints.push([poi.lat, poi.lng]);
		// 		}
		// 	});

		// 	if (allPoints.length > 0) {
		// 		const bounds = window.L.latLngBounds(allPoints);
		// 		map.fitBounds(bounds, { padding: [50, 50] });
		// 	}
		// }
	}, [originLocation, destinationLocation, routeInfo, pois]);

	return (
		<div className={className}>
			<div
				ref={mapRef}
				style={{
					width: "100%",
					height: `${height}px`,
					minHeight: `${height}px`,
					zIndex: 0,
				}}
			/>
			<style jsx global>{`
				.leaflet-container {
					font-family: inherit;
				}
				.custom-marker {
					background: transparent !important;
					border: none !important;
				}
			`}</style>
		</div>
	);
}

