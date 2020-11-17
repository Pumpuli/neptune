import { useEffect, useRef, useCallback } from 'react';

export default function useWebSocket(
	url: string,
	{
		onClose = () => {},
		onOpen = () => {},
		onMessage = () => {},
		onError = () => {},
	}: { onClose?: () => void; onOpen?: () => void; onMessage?: (data: string) => void; onError?: () => void } = {}
) {
	const socketRef = useRef<WebSocket>();
	const onCloseRef = useRef<() => void>();
	const onOpenRef = useRef<() => void>();
	const onMessageRef = useRef<(data: string) => void>();
	const onErrorRef = useRef<() => void>();

	useEffect(() => void (onCloseRef.current = onClose), [onClose]);
	useEffect(() => void (onOpenRef.current = onOpen), [onOpen]);
	useEffect(() => void (onMessageRef.current = onMessage), [onMessage]);
	useEffect(() => void (onErrorRef.current = onError), [onError]);

	useEffect(() => {
		const ws = (socketRef.current = new WebSocket(url));

		ws.addEventListener('close', () => {
			onCloseRef.current?.();
		});

		ws.addEventListener('open', () => {
			onOpenRef.current?.();
		});

		ws.addEventListener('message', (event) => {
			onMessageRef.current?.(event.data);
		});

		ws.addEventListener('error', () => {
			onErrorRef.current?.();
		});

		return () => socketRef.current?.close();
	}, [url]);

	const sendMessage = useCallback((data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) => {
		socketRef.current?.send(data);
	}, []);

	return {
		sendMessage,
	};
}
