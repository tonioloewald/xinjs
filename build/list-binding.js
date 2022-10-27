const itemToElement = new WeakMap();
const elementToItem = new WeakMap();
const listBindings = new WeakMap();
const getListTemplate = (element) => {
    if (element instanceof HTMLTemplateElement) {
        if (element.content.children.length !== 1) {
            throw new Error('list template must have exactly one top-level element');
        }
        return element.content.children[0];
    }
    return element;
};
class ListBinding {
    constructor(boundElement, bindInstance) {
        this.boundElement = boundElement;
        this.template = getListTemplate(boundElement);
        this.elements = [];
        this.bindInstance = bindInstance;
    }
    update(array) {
        for (const element of this.elements) {
            const item = elementToItem.get(element);
            if (!array.includes(item)) {
                element.remove();
                itemToElement.delete(item);
                elementToItem.delete(element);
            }
        }
        this.elements = [];
        for (const item of array) {
            if (!item) {
                continue;
            }
            let element = itemToElement.get(item);
            if (!element) {
                element = this.template.cloneNode(true);
                // @ts-ignore-error -- too stupid to realize it's not undefined
                itemToElement.set(item, element);
                // @ts-ignore-error -- too stupid to realize it's not undefined
                elementToItem.set(element, item);
            }
            if (this.bindInstance) {
                // @ts-ignore-error -- too stupid to realize it's not undefined
                this.bindInstance(element, item);
            }
            // @ts-ignore-error -- too stupid to realize it's not undefined
            this.elements.push(element);
        }
        let insertionPoint = this.boundElement;
        const parent = insertionPoint.parentElement;
        if (parent) {
            for (const element of this.elements.reverse()) {
                if (insertionPoint.previousElementSibling !== element) {
                    parent.insertBefore(element, insertionPoint);
                }
                insertionPoint = element;
            }
        }
    }
}
export const getListBinding = (boundElement, bindInstance) => {
    let listBinding = listBindings.get(boundElement);
    if (!listBinding) {
        listBinding = new ListBinding(boundElement, bindInstance);
        listBindings.set(boundElement, listBinding);
    }
    return listBinding;
};
