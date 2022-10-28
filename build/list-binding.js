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
        if (!array) {
            array = [];
        }
        // remove elements whose items no longer live in the array
        for (const element of this.elements) {
            const item = elementToItem.get(element);
            // @ts-ignore-error
            if (!item || !array._xinValue.includes(item)) {
                element.remove();
                itemToElement.delete(item);
                elementToItem.delete(element);
            }
        }
        // build a complete new set of elements in the right order
        this.elements = [];
        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            if (!item) {
                continue;
            }
            let element = itemToElement.get(item._xinValue);
            if (!element) {
                element = this.template.cloneNode(true);
                if (typeof item === 'object') {
                    itemToElement.set(item._xinValue, element);
                    elementToItem.set(element, item._xinValue);
                }
            }
            if (this.bindInstance) {
                this.bindInstance(element, item);
            }
            this.elements.push(element);
        }
        // make sure all the elements are in the DOM and in the correct location
        let insertionPoint = this.boundElement;
        const parent = insertionPoint.parentElement;
        if (parent) {
            for (const element of this.elements) {
                if (element.previousElementSibling !== insertionPoint) {
                    if (insertionPoint.nextElementSibling) {
                        parent.insertBefore(element, insertionPoint.nextElementSibling);
                    }
                    else {
                        parent.append(element);
                    }
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
