export function camelToKabob(s) {
    return s.replace(/[A-Z]/g, (c) => {
        return `-${c.toLocaleLowerCase()}`;
    });
}
export function kabobToCamel(s) {
    return s.replace(/-([a-z])/g, (_, c) => {
        return c.toLocaleUpperCase();
    });
}
