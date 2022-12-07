const stringify = (x) => {
    try {
        return JSON.stringify(x);
    }
    catch (_) {
        return '{has circular references}';
    }
};
export const makeError = (...messages) => new Error(messages.map(stringify).join(' '));
