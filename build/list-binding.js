const itemToElement = new WeakMap();
const elementToItem = new WeakMap();
const listBindings = new WeakMap();
class ListBinding {
    constructor(boundElement, bindInstance) {
        this.boundElement = boundElement;
        if (boundElement.children.length !== 1) {
            throw new Error('ListBinding expects an element with exactly one child element');
        }
        if (boundElement.children[0] instanceof HTMLTemplateElement) {
            const template = boundElement.children[0];
            if (template.content.children.length !== 1) {
                throw new Error('ListBinding expects a template with exactly one child element');
            }
            this.template = template.content.children[0].cloneNode(true);
            template.remove();
        }
        else {
            this.template = boundElement.children[0];
        }
        this.bindInstance = bindInstance;
    }
    update(array) {
        if (!array) {
            array = [];
        }
        let removed = 0;
        let moved = 0;
        let created = 0;
        // remove elements whose items no longer live in the array
        for (const element of [...this.boundElement.children]) {
            const item = elementToItem.get(element);
            // @ts-ignore-error
            if (!item || !array._xinValue.includes(item)) {
                element.remove();
                itemToElement.delete(item);
                elementToItem.delete(element);
                removed++;
            }
        }
        // build a complete new set of elements in the right order
        const elements = [];
        for (let i = 0; i < array.length; i++) {
            const item = array[i];
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
                this.boundElement.append(element);
            }
            if (this.bindInstance) {
                this.bindInstance(element, item);
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
        // @ts-expect-error
        console.log(array._xinPath, 'updated', { removed, created, moved });
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
