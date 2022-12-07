export function deepClone(obj) {
    if (obj == null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        // @ts-expect-error-error
        return obj.map(deepClone);
    }
    const clone = {};
    for (const key in obj) {
        const val = obj[key];
        if (obj != null && typeof obj === 'object') {
            clone[key] = deepClone(val);
        }
        else {
            clone[key] = val;
        }
    }
    return clone;
}
