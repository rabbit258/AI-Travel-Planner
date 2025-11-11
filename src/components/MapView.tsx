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
		BMap: any;
		BMapLib: any;
	}
}

export default function MapView({ pois, className, height = 420 }: Props) {
	const mapRef = useRef<HTMLDivElement | null>(null);
	const mapInstanceRef = useRef<any>(null);
	const markersRef = useRef<any[]>([]);

	// 初始化地图的函数
	const initMap = () => {
		if (!mapRef.current || mapInstanceRef.current || !window.BMap) return;
		
		try {
			const map = new window.BMap.Map(mapRef.current);
			const point = new window.BMap.Point(116.397428, 39.90923);
			map.centerAndZoom(point, 11);
			map.enableScrollWheelZoom(true);
			mapInstanceRef.current = map;
			console.log("百度地图初始化成功");
		} catch (error) {
			console.error("初始化百度地图失败:", error);
		}
	};

	// Load Baidu Map script dynamically
	useEffect(() => {
		if (typeof window === "undefined") return;
		
		const key = process.env.NEXT_PUBLIC_BAIDU_MAP_AK;
		if (!key) {
			console.error("Baidu Map key missing: NEXT_PUBLIC_BAIDU_MAP_AK");
			return;
		}

		// 如果已经加载了百度地图，直接初始化
		if (window.BMap) {
			// 延迟一下确保 DOM 准备好
			setTimeout(initMap, 100);
			return;
		}

		// 检查是否已经有脚本在加载
		const existingScript = document.querySelector(`script[src*="api.map.baidu.com"]`);
		if (existingScript) {
			// 等待脚本加载完成
			const checkInterval = setInterval(() => {
				if (window.BMap) {
					clearInterval(checkInterval);
					setTimeout(initMap, 100);
				}
			}, 100);
			
			return () => clearInterval(checkInterval);
		}
		
		// 设置全局回调函数
		const callbackName = `initBaiduMap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		(window as any)[callbackName] = () => {
			// 地图脚本加载完成，延迟初始化确保 DOM 准备好
			setTimeout(initMap, 100);
			// 清理回调函数
			if ((window as any)[callbackName]) {
				delete (window as any)[callbackName];
			}
		};
		
		const script = document.createElement("script");
		script.src = `https://api.map.baidu.com/api?v=3.0&ak=${key}&callback=${callbackName}`;
		script.async = true;
		script.onerror = () => {
			console.error("百度地图脚本加载失败");
			if ((window as any)[callbackName]) {
				delete (window as any)[callbackName];
			}
		};
		document.head.appendChild(script);
		
		return () => {
			if (document.head.contains(script)) {
				document.head.removeChild(script);
			}
			if ((window as any)[callbackName]) {
				delete (window as any)[callbackName];
			}
		};
	}, []);

	// 地图初始化已经在加载脚本的回调中完成，这里不需要重复初始化

	// Update markers when POIs change
	useEffect(() => {
		const map = mapInstanceRef.current;
		if (!map || !window.BMap) return;
		
		// 清除现有标记
		markersRef.current.forEach((marker) => {
			map.removeOverlay(marker);
		});
		markersRef.current = [];
		
		if (!pois || pois.length === 0) return;

		// 创建标记点
		const points: any[] = [];
		pois.forEach((p) => {
			// 百度地图使用 BD09 坐标系，POI 中的坐标应该是 BD09
			const point = new window.BMap.Point(p.lng, p.lat);
			points.push(point);
			
			const marker = new window.BMap.Marker(point);
			const infoWindow = new window.BMap.InfoWindow(p.name, {
				width: 200,
				height: 50,
			});
			
			marker.addEventListener("click", () => {
				map.openInfoWindow(infoWindow, point);
			});
			
			map.addOverlay(marker);
			markersRef.current.push(marker);
		});

		// 调整地图视野以包含所有标记点
		if (points.length > 0) {
			const viewport = map.getViewport(points, {
				padding: 50,
			});
			map.centerAndZoom(viewport.center, viewport.zoom);
		}

		return () => {
			markersRef.current.forEach((marker) => {
				if (map) {
					map.removeOverlay(marker);
				}
			});
			markersRef.current = [];
		};
	}, [pois]);

	return (
		<div className={className}>
			<div 
				ref={mapRef} 
				style={{ 
					width: "100%", 
					height: `${height}px`,
					minHeight: `${height}px`
				}} 
			/>
		</div>
	);
}


