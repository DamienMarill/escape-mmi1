// Empêche la mise en veille de l'écran pendant le jeu (Screen Wake Lock API —
// l'équivalent propre de « faire croire qu'une vidéo joue »). Le verrou est
// libéré par le navigateur quand l'onglet devient invisible : on le redemande
// au retour. Sans support (vieux navigateur), échec silencieux.

export function keepScreenAwake(): () => void {
	let lock: WakeLockSentinel | null = null;

	const request = async () => {
		try {
			if (document.visibilityState === 'visible' && 'wakeLock' in navigator) {
				lock = await navigator.wakeLock.request('screen');
			}
		} catch {
			// Refusé (économie d'énergie, permission…) — tant pis, pas bloquant.
		}
	};

	const onVisibility = () => {
		if (document.visibilityState === 'visible') void request();
	};

	void request();
	document.addEventListener('visibilitychange', onVisibility);

	return () => {
		document.removeEventListener('visibilitychange', onVisibility);
		void lock?.release();
		lock = null;
	};
}
