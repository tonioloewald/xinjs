import { xin, observe, xinValue } from './xin';
import { debounce } from './throttle';
// TODO reimplement using IndexedDB
export const hotReload = (test = () => true) => {
    const savedState = localStorage.getItem('xin-state');
    if (savedState != null) {
        const state = JSON.parse(savedState);
        for (const key of Object.keys(state).filter(test)) {
            if (xin[key] !== undefined) {
                Object.assign(xin[key], state[key]);
            }
            else {
                xin[key] = state[key];
            }
        }
    }
    const saveState = debounce(() => {
        const obj = {};
        const state = xin[xinValue];
        for (const key of Object.keys(state).filter(test)) {
            obj[key] = state[key];
        }
        localStorage.setItem('xin-state', JSON.stringify(obj));
        console.log('xin state saved to localStorage');
    }, 500);
    observe(test, saveState);
};
