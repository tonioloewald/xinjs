import { xin, observe } from './xin';
export const hotReload = (test = () => true) => {
    const savedState = localStorage.getItem('xin-state');
    if (savedState) {
        const state = JSON.parse(savedState);
        for (const key of Object.keys(state).filter(test)) {
            if (xin[key]) {
                Object.assign(xin[key], state[key]);
            }
            else {
                xin[key] = state[key];
            }
        }
    }
    let deferredSave = 0;
    const saveState = () => {
        const obj = {};
        const state = xin._xinValue;
        for (const key of Object.keys(state).filter(test)) {
            obj[key] = state[key];
        }
        localStorage.setItem('xin-state', JSON.stringify(xin._xinValue));
        console.log('xin state saved to localStorage');
    };
    observe(test, () => {
        clearTimeout(deferredSave);
        deferredSave = setTimeout(saveState, 250);
    });
};
