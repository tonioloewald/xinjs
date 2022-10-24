import { useState, useEffect } from 'react';
import { xin, observe, unobserve } from './xin';
// TODO declare type the way it's declated for useState so that TypeScript
// passes through type of initialValue to the right thing
export const useXin = (path, initialValue = '') => {
    const [value, update] = useState(xin[path] || initialValue);
    useEffect(() => {
        const observer = (path) => {
            update(xin[path]);
        };
        const listener = observe(path, observer);
        return () => {
            unobserve(listener);
        };
    });
    const setValue = (value) => {
        xin[path] = value;
    };
    return [value, setValue];
};
