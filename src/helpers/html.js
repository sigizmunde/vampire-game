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

export function createModal(parentNode, title, content, onClose) {
    const modalOverlay = createHtmlElement(parentNode, "div", { class: "modal-overlay" });
    const modal = createHtmlElement(modalOverlay, "div", {
        class: "modal",
        id: "modal",
        style: {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#fff",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            zIndex: "1000",
        },
    });

    createHtmlElement(modal, "h2", {}, [title]);
    createHtmlElement(modal, "p", {}, [content]);
    const closeButton = createHtmlElement(modal, "button", { class: "close-button" }, ["Close"]);
    closeButton.addEventListener("click", () => {
        modalOverlay.remove();
        if (onClose) onClose();
    });
}
