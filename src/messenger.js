import { createHtmlElement } from "./helpers/html";

export const MESSAGE_TYPES = {
    LOG: 0,
    TASK: 1,
    WARNING: 2,
    CRITICAL: 3,
};

const MESSENGER_NODE_ID = "messenger";

export class Messenger {
    static #instance = null;

    constructor() {
        if (Messenger.#instance) {
            return Messenger.#instance; // Returns the existing instance transparently
        }

        this.messages = [];
        Messenger.#instance = this;

        this.messengerNode = document.getElementById(MESSENGER_NODE_ID);
        if (!this.messengerNode) {
            this.messengerNode = createHtmlElement();
            this.messengerNode.className = "messenger";
            const body = document.body;
            console.log(body);
            document.body.appendChild(this.messengerNode);
        }
        this.renderMessages();
    }

    clearMessages() {
        this.messages = [];
        this.renderMessages();
    }

    postMessage(message = "", type = MESSAGE_TYPES.LOG) {
        this.messages.push({ message, type });
        const newLine = createHtmlElement(null, "p");
        newLine.innerText = message + "[" + type + "]";
        this.messengerNode.appendChild(newLine);
    }

    renderMessages() {
        this.messengerNode.innerHTML = "";
        this.messages.forEach(({ message, type }) => {
            const newLine = createHtmlElement(null, "p");
            newLine.innerText = message + "[" + type + "]";
            this.messengerNode.appendChild(newLine);
        });
    }
}
