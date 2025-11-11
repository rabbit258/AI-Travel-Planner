import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const BAIDU_MAP_AK = process.env.BAIDU_MAP_AK;

/**
 * 百度地图地点检索 API
 * 根据地点名称获取经纬度
 */
async function searchPlace(query: string): Promise<{ lat: number; lng: number; name: string } | null> {
	if (!BAIDU_MAP_AK) {
		console.error("BAIDU_MAP_AK is not configured");
		return null;
	}

	try {
		// 百度地图地点检索 API v2.0 (更稳定)
		// 文档: https://lbsyun.baidu.com/index.php?title=webapi/guide/webservice-placeapi
		// 如果 v3 不可用，可以尝试 v2: /place/v2/search
		const url = `https://api.map.baidu.com/place/v2/search?query=${encodeURIComponent(query)}&region=全国&output=json&ak=${BAIDU_MAP_AK}`;
		const response = await fetch(url);

		// 检查响应状态码
		if (!response.ok) {
			const text = await response.text();
			console.error(`百度地图地点检索 HTTP 错误: ${response.status}`, text.substring(0, 200));
			return null;
		}

		// 百度地图 API 可能返回 text/html 或 text/plain，但内容是 JSON
		// 先尝试读取文本，然后尝试解析 JSON
		const text = await response.text();
		let data;
		try {
			data = JSON.parse(text);
		} catch (parseError) {
			console.error("百度地图地点检索返回非 JSON 响应:", text.substring(0, 500));
			return null;
		}

		// v2/v3 API 返回格式: { status: 0, results: [...] }
		if (data.status === 0 && data.results && Array.isArray(data.results) && data.results.length > 0) {
			const firstResult = data.results[0];
			const location = firstResult.location;
			
			if (location && typeof location.lat === "number" && typeof location.lng === "number") {
				return {
					name: firstResult.name || query,
					lat: location.lat,
					lng: location.lng,
				};
			}
		}

		console.error("百度地图地点检索失败:", JSON.stringify(data, null, 2));
		return null;
	} catch (error) {
		console.error("百度地图地点检索异常:", error);
		return null;
	}
}

/**
 * 百度地图路径规划 API
 * 根据起点和终点经纬度获取路径信息
 */
async function getRoute(
	originLat: number,
	originLng: number,
	destLat: number,
	destLng: number,
	tactics: number = 11 // 11: 不走高速, 13: 最短时间, 默认11
): Promise<{
	distance: number;
	duration: number;
	steps: Array<{ instruction: string; distance: number; duration: number }>;
} | null> {
	if (!BAIDU_MAP_AK) {
		console.error("BAIDU_MAP_AK is not configured");
		return null;
	}

	try {
		// 百度地图路径规划 API v2.0 (驾车路线规划)
		// 文档: https://lbsyun.baidu.com/index.php?title=webapi/direction-api-v2
		const url = `https://api.map.baidu.com/direction/v2/driving?origin=${originLat},${originLng}&destination=${destLat},${destLng}&tactics=${tactics}&ak=${BAIDU_MAP_AK}`;
		const response = await fetch(url);

		// 检查响应状态码
		if (!response.ok) {
			const text = await response.text();
			console.error(`百度地图路径规划 HTTP 错误: ${response.status}`, text.substring(0, 200));
			return null;
		}

		// 百度地图 API 可能返回 text/html 或 text/plain，但内容是 JSON
		// 先尝试读取文本，然后尝试解析 JSON
		const text = await response.text();
		let data;
		try {
			data = JSON.parse(text);
		} catch (parseError) {
			console.error("百度地图路径规划返回非 JSON 响应:", text.substring(0, 500));
			return null;
		}

		if (data.status === 0 && data.result && data.result.routes && data.result.routes.length > 0) {
			const route = data.result.routes[0];
			// 提取路线步骤信息
			// 百度地图返回的 steps 在 route.steps 中
			// 每个 step 可能包含: instruction, instructions, path.instruction, 或 turnInstruction
			const steps = route.steps?.map((step: any) => {
				// 尝试多种可能的字段名
				let instruction = "";
				if (step.instruction) {
					instruction = step.instruction;
				} else if (step.instructions) {
					instruction = step.instructions;
				} else if (step.path?.instruction) {
					instruction = step.path.instruction;
				} else if (step.turnInstruction) {
					instruction = step.turnInstruction;
				} else if (typeof step === "string") {
					instruction = step;
				}
				
				// 移除 HTML 标签和多余空白
				instruction = instruction
					.replace(/<[^>]*>/g, "")
					.replace(/\s+/g, " ")
					.trim();

				return {
					instruction,
					distance: step.distance || 0,
					duration: step.duration || 0,
				};
			}).filter((step: any) => step.instruction) || []; // 过滤掉空的指引

			return {
				distance: route.distance || 0, // 总距离（米）
				duration: route.duration || 0, // 总时间（秒）
				steps,
			};
		}

		console.error("百度地图路径规划失败:", data);
		return null;
	} catch (error) {
		console.error("百度地图路径规划异常:", error);
		return null;
	}
}

/**
 * POST /api/baidu-map
 * 获取出发地和目的地的经纬度，以及路径信息
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { origin, destination } = body;

		if (!origin || !destination) {
			return NextResponse.json(
				{ error: "origin and destination are required" },
				{ status: 400 }
			);
		}

		// 1. 获取出发地经纬度
		const originLocation = await searchPlace(origin);
		if (!originLocation) {
			return NextResponse.json(
				{ error: `无法找到出发地: ${origin}` },
				{ status: 404 }
			);
		}

		// 2. 获取目的地经纬度
		const destinationLocation = await searchPlace(destination);
		if (!destinationLocation) {
			return NextResponse.json(
				{ error: `无法找到目的地: ${destination}` },
				{ status: 404 }
			);
		}

		// 3. 获取路径信息
		const routeInfo = await getRoute(
			originLocation.lat,
			originLocation.lng,
			destinationLocation.lat,
			destinationLocation.lng
		);

		return NextResponse.json({
			originLocation,
			destinationLocation,
			routeInfo,
		});
	} catch (error: any) {
		console.error("百度地图 API 调用失败:", error);
		return NextResponse.json(
			{ error: error.message || "百度地图 API 调用失败" },
			{ status: 500 }
		);
	}
}

