export function createHtmlElement(parentNode, tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    for (const [key, value] of Object.entries(attributes)) {
        if (key === "style" && typeof value === "object") {
            Object.assign(element.style, value);
        } else if (key.startsWith("on") && typeof value === "function") {
            element.addEventListener(key.substring(2), value);
        } else {
            element.setAttribute(key, value);
        }
    }
    children.forEach((child) => {
        if (typeof child === "string") {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    parentNode.appendChild(element);
    return element;
}
