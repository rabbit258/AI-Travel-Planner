"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

type Props = {
	onTranscript: (text: string) => void;
	className?: string;
	lang?: string;
};

export default function MicButton({ onTranscript, className, lang = "zh-CN" }: Props) {
	const [recording, setRecording] = useState(false);
	const recognitionRef = useRef<SpeechRecognition | null>(null);
	const [supported, setSupported] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const SR: any =
			(window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
		if (SR) {
			const rec: SpeechRecognition = new SR();
			rec.lang = lang;
			rec.interimResults = true;
			rec.continuous = true;
			rec.onresult = (e: SpeechRecognitionEvent) => {
				const result = Array.from(e.results)
					.map((r) => r[0]?.transcript ?? "")
					.join(" ")
					.trim();
				if (result) onTranscript(result);
			};
			rec.onend = () => setRecording(false);
			recognitionRef.current = rec;
			setSupported(true);
		} else {
			setSupported(false);
		}
	}, [lang, onTranscript]);

	const handleToggle = useMemo(
		() => () => {
			const rec = recognitionRef.current;
			if (!rec) return;
			if (!recording) {
				setRecording(true);
				try {
					rec.start();
				} catch {
					// ignore double starts
				}
			} else {
				setRecording(false);
				try {
					rec.stop();
				} catch {
					// ignore
				}
			}
		},
		[recording]
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


