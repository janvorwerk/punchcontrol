const DUMMY_KEY = '__.shared-session-storage';

export function enableSharedSessionStorage() {
    if (!sessionStorage.length) {
        // Ask other tabs for session storage
        localStorage.setItem(DUMMY_KEY, `request ${Date.now()}`);
    }

    window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === DUMMY_KEY && event.newValue) {
            if (event.newValue.startsWith('request') && sessionStorage.length) {
                // Some tab asked for the sessionStorage and we have an answer -> send it
                localStorage.setItem(DUMMY_KEY, JSON.stringify(sessionStorage));
                localStorage.removeItem(DUMMY_KEY);
            } else if (!sessionStorage.length) {
                // ignore if we did not request it

                const data = JSON.parse(event.newValue);

                for (const key of Object.keys(data)) {
                    sessionStorage.setItem(key, data[key]);
                }
            }
        }
    }, false);
}
