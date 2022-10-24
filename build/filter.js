import { matchType } from './type-by-example';
export const filterArray = (template, obj) => {
    if (!Array.isArray(obj)) {
        return undefined;
    }
    if (template.length === 0) {
        return [...obj];
    }
    const output = [];
    for (const item of obj) {
        const itemTemplate = template.find(possible => matchType(possible, item).length === 0);
        if (itemTemplate !== undefined) {
            output.push(filter(itemTemplate, item));
        }
    }
    return output;
};
export const filterObject = (template, obj) => {
    if (matchType(template, obj).length) {
        return undefined;
    }
    const output = {};
    for (const key of Object.keys(template)) {
        const value = filter(template[key], obj[key]);
        if (value !== undefined) {
            output[key] = value;
        }
    }
    return output;
};
export const filter = (template, obj) => {
    if (obj === undefined || obj === null) {
        return undefined;
    }
    else if (typeof obj !== 'object' && matchType(template, obj).length) {
        return undefined;
    }
    else if (Array.isArray(template)) {
        return filterArray(template, obj);
    }
    else if (typeof template === 'object') {
        return filterObject(template, obj);
    }
    else {
        return matchType(obj, template).length ? undefined : obj;
    }
};
