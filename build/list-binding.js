import { settings } from './settings';
const itemToElement = new WeakMap();
const elementToItem = new WeakMap();
const listBindings = new WeakMap();
class ListBinding {
    constructor(boundElement, options = {}) {
        this.boundElement = boundElement;
        if (boundElement.children.length !== 1) {
            throw new Error('ListBinding expects an element with exactly one child element');
        }
        if (boundElement.children[0] instanceof HTMLTemplateElement) {
            const template = boundElement.children[0];
            if (template.content.children.length !== 1) {
                throw new Error('ListBinding expects a template with exactly one child element');
            }
            template.remove();
            this.template = template.content.children[0].cloneNode(true);
        }
        else {
            this.template = boundElement.children[0];
            this.template.remove();
        }
        this.options = options;
    }
    update(array) {
        if (!array) {
            array = [];
        }
        const { idPath, initInstance, updateInstance } = this.options;
        let removed = 0;
        let moved = 0;
        let created = 0;
        for (const element of [...this.boundElement.children]) {
            const item = elementToItem.get(element);
            if (!item || !array.includes(item)) {
                element.remove();
                itemToElement.delete(item);
                elementToItem.delete(element);
                removed++;
            }
        }
        // build a complete new set of elements in the right order
        const elements = [];
        // @ts-expect-error
        const arrayPath = array._xinPath;
        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            const path = idPath ? `${arrayPath}[${idPath}=${item[idPath]}]` : false;
            if (!item) {
                continue;
            }
            let element = itemToElement.get(item._xinValue);
            if (!element) {
                created++;
                element = this.template.cloneNode(true);
                if (typeof item === 'object') {
                    itemToElement.set(item._xinValue, element);
                    elementToItem.set(element, item._xinValue);
                }
                if (initInstance) {
                    initInstance(element, path || item);
                }
                this.boundElement.append(element);
            }
            if (updateInstance) {
                updateInstance(element, path || item);
            }
            elements.push(element);
        }
        // make sure all the elements are in the DOM and in the correct location
        let insertionPoint = null;
        for (const element of elements) {
            if (element.previousElementSibling !== insertionPoint) {
                moved++;
                if (insertionPoint && insertionPoint.nextElementSibling) {
                    this.boundElement.insertBefore(element, insertionPoint.nextElementSibling);
                }
                else {
                    this.boundElement.append(element);
                }
            }
            insertionPoint = element;
        }
        if (settings.perf) {
            // @ts-expect-error
            console.log(array._xinPath, 'updated', { removed, created, moved });
        }
    }
}
export const getListBinding = (boundElement, options) => {
    let listBinding = listBindings.get(boundElement);
    if (!listBinding) {
        listBinding = new ListBinding(boundElement, options);
        listBindings.set(boundElement, listBinding);
    }
    return listBinding;
};
