"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

interface SpeechRecognitionAlternative {
	transcript?: string;
}

interface SpeechRecognitionResult {
	isFinal: boolean;
	length: number;
	item(index: number): SpeechRecognitionAlternative;
	[index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList extends Iterable<SpeechRecognitionResult> {
	length: number;
	item(index: number): SpeechRecognitionResult;
	[index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
	results: SpeechRecognitionResultList;
}

interface SpeechRecognition {
	lang: string;
	interimResults: boolean;
	continuous: boolean;
	start: () => void;
	stop: () => void;
	abort?: () => void;
	onresult: ((event: SpeechRecognitionEvent) => void) | null;
	onend: (() => void) | null;
	onerror: ((event: any) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare global {
	interface Window {
		webkitSpeechRecognition?: SpeechRecognitionConstructor;
		SpeechRecognition?: SpeechRecognitionConstructor;
	}
}

type Props = {
	onTranscript: (text: string) => void;
	className?: string;
	lang?: string;
	onGetActiveElement?: () => HTMLInputElement | HTMLTextAreaElement | null;
};

export default function MicButton({ onTranscript, className, lang = "zh-CN", onGetActiveElement }: Props) {
	const [recording, setRecording] = useState(false);
	const recognitionRef = useRef<SpeechRecognition | null>(null);
	const [supported, setSupported] = useState(false);
	const lastActiveElementRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
	const lastResultRef = useRef<string>("");
	const sessionStartValueRef = useRef<string>("");

	useEffect(() => {
		if (typeof window === "undefined") return;
		
		// 跟踪当前焦点元素
		const handleFocus = (e: FocusEvent) => {
			const target = e.target;
			if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
				// 排除日期选择器和下拉框
				if (target.type !== "date" && target.tagName !== "SELECT") {
					lastActiveElementRef.current = target;
				}
			}
		};

		document.addEventListener("focusin", handleFocus);

		const SR: any =
			(window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
		if (SR) {
			// 不在 useEffect 中创建识别器，而是在 handleToggle 中创建，避免重复累积
			setSupported(true);
		} else {
			setSupported(false);
		}

		return () => {
			document.removeEventListener("focusin", handleFocus);
		};
	}, [lang, onTranscript, onGetActiveElement]);

	const handleToggle = useMemo(
		() => () => {
			if (!supported) return;
			
			const SR: any =
				(window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
			if (!SR) return;

			if (!recording) {
				// 开始录音时，创建新的识别器实例，避免累积
				const rec: SpeechRecognition = new SR();
				rec.lang = lang;
				rec.interimResults = false; // 只获取最终结果
				rec.continuous = false; // 每次只识别一次

				// 记录当前焦点元素的值
				const activeElement = onGetActiveElement?.() || lastActiveElementRef.current;
				if (activeElement) {
					sessionStartValueRef.current = activeElement.value || "";
				} else {
					sessionStartValueRef.current = "";
				}
				lastResultRef.current = "";

				rec.onresult = (e: SpeechRecognitionEvent) => {
					// 只获取最后一个最终结果
					const finalResult = Array.from(e.results)
						.filter((r) => r.isFinal)
						.map((r) => r[0]?.transcript ?? "")
						.join(" ")
						.trim();
					
					if (finalResult) {
						// 获取当前焦点元素
						const currentElement = onGetActiveElement?.() || lastActiveElementRef.current;
						if (currentElement) {
							// 获取录音开始时的值
							const startValue = sessionStartValueRef.current;
							// 只添加新的识别结果，不重复已有内容
							// 如果识别结果包含开始值，则只取新增部分
							let newText = finalResult;
							if (startValue && finalResult.startsWith(startValue)) {
								newText = finalResult.slice(startValue.length).trim();
							}
							
							if (newText) {
								currentElement.value = startValue ? `${startValue} ${newText}` : newText;
								// 触发 input 事件，让 React 状态更新
								currentElement.dispatchEvent(new Event("input", { bubbles: true }));
							}
						}
						onTranscript(finalResult);
					}
				};

				rec.onend = () => {
					setRecording(false);
					recognitionRef.current = null;
				};

				rec.onerror = (e: any) => {
					console.error("语音识别错误:", e);
					setRecording(false);
					recognitionRef.current = null;
				};

				recognitionRef.current = rec;
				setRecording(true);
				try {
					rec.start();
				} catch (err) {
					console.error("启动语音识别失败:", err);
					setRecording(false);
				}
			} else {
				// 停止录音
				const rec = recognitionRef.current;
				if (rec) {
					try {
						rec.stop();
					} catch {
						// ignore
					}
				}
				setRecording(false);
				recognitionRef.current = null;
			}
		},
		[recording, onGetActiveElement, lang, supported, onTranscript]
	);

	return (
		<button
			type="button"
			onClick={handleToggle}
			disabled={!supported}
			className={
				(recording
					? "btn bg-red-500 text-white hover:bg-red-600"
					: "btn-outline") + (className ? " " + className : "")
			}
			aria-pressed={recording}
		>
			{recording ? <Square size={16} /> : <Mic size={16} />}
			{recording ? "停止录音" : "开始语音"}
		</button>
	);
}


