import { Color } from './color';
import { camelToKabob, elements } from './elements';
export function StyleNode(styleSheet) {
    return elements.style(css(styleSheet));
}
const dimensionalProps = ['left', 'right', 'top', 'bottom', 'gap'];
const isDimensional = (cssProp) => {
    return (cssProp.match(/(width|height|size|margin|padding|radius)/) != null) || dimensionalProps.includes(cssProp);
};
const renderStatement = (key, value, indentation = '') => {
    const cssProp = camelToKabob(key);
    if (typeof value === 'object') {
        const renderedRule = Object.keys(value).map(innerKey => renderStatement(innerKey, value[innerKey], `${indentation}  `)).join('\n');
        return `${indentation}  ${key} {\n${renderedRule}\n${indentation}  }`;
    }
    else if (typeof value === 'number' && isDimensional(cssProp)) {
        return `${indentation}  ${cssProp}: ${value}px;`;
    }
    return `${indentation}  ${cssProp}: ${value};`;
};
export const css = (obj, indentation = '') => {
    const selectors = Object.keys(obj).map((selector) => {
        const body = obj[selector];
        const rule = Object.keys(body)
            .map(prop => renderStatement(prop, body[prop]))
            .join('\n');
        return `${indentation}${selector} {\n${rule}\n}`;
    });
    return selectors.join('\n\n');
};
export const initVars = (obj) => {
    const rule = {};
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        rule[`--${camelToKabob(key)}`] = typeof value === 'number' ? String(value) + 'px' : value;
    }
    return rule;
};
export const darkMode = (obj) => {
    const rule = {};
    for (const key of Object.keys(obj)) {
        let value = obj[key];
        if (typeof value === 'string' && value.match(/^(#|rgb[a]?\(|hsl[a]?\()/) != null) {
            value = Color.fromCss(value).inverseLuminance.html;
            rule[`--${camelToKabob(key)}`] = value;
        }
    }
    return rule;
};
export const vars = new Proxy({}, {
    get(target, prop) {
        if (target[prop] == null) {
            prop = prop.replace(/[A-Z]/g, x => `-${x.toLocaleLowerCase()}`);
            let [, varName, , isNegative, scaleText, method] = prop.match(/^([^\d_]*)((_)?(\d+)(\w*))?$/);
            varName = `--${varName}`;
            if (scaleText != null) {
                const scale = isNegative == null ? Number(scaleText) / 100 : -Number(scaleText) / 100;
                switch (method) {
                    case 'b': // brighten
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = scale > 0 ? Color.fromCss(baseColor).brighten(scale).rgba : Color.fromCss(baseColor).darken(-scale).rgba;
                        }
                        break;
                    case 's': // saturate
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = scale > 0 ? Color.fromCss(baseColor).saturate(scale).rgba : Color.fromCss(baseColor).desaturate(-scale).rgba;
                        }
                        break;
                    case 'h': // hue
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = Color.fromCss(baseColor).rotate(scale).rgba;
                        }
                        break;
                    case 'o': // alpha
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = Color.fromCss(baseColor).opacity(scale).rgba;
                        }
                        break;
                    case '':
                        target[prop] = `calc(var(${varName}) * ${scale})`;
                        break;
                    default:
                        console.error(method);
                        throw new Error(`Unrecognized method ${method} for css variable ${varName}`);
                }
            }
            else {
                target[prop] = `var(${varName})`;
            }
        }
        return target[prop];
    }
});
