export const debounce = (origFn, minInterval = 250) => {
    let debounceId;
    return (...args) => {
        if (debounceId !== undefined)
            clearTimeout(debounceId);
        debounceId = setTimeout(() => {
            origFn(...args);
        }, minInterval);
    };
};
export const throttle = (origFn, minInterval = 250) => {
    let debounceId;
    let previousCall = Date.now() - minInterval;
    let inFlight = false;
    return (...args) => {
        clearTimeout(debounceId);
        debounceId = setTimeout(async () => {
            origFn(...args);
            previousCall = Date.now();
        }, minInterval);
        if (!inFlight && Date.now() - previousCall >= minInterval) {
            inFlight = true;
            try {
                origFn(...args);
                previousCall = Date.now();
            }
            finally {
                inFlight = false;
            }
        }
    };
};
