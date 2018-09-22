/** This file provides some util functions for DOM manipulation */
/** Set the context document. This will affect some DOM operation like `elt`, `findCaret` */
export declare function setContextDocument(doc: Document): void;
/**
 * Get the context document that currently MarkdownIME is using.
 *
 * The context affects some DOM operation like `elt`, `findCaret`
 */
export declare function getContextDocument(): Document;
/**
 * Try to get the node which is exactly before the caret.
 */
export declare function findCaret(): Node;
export declare function setCaret(anchor: Node, offset?: number): void;
export declare function setCaretAfter(anchor: Node): void;
/**
 * Get Line Container Node
 */
export declare function getLineContainer(el: Node): HTMLElement;
export declare function breakElement(el: Element): void;
export declare function findUpward(el: Node, checker: (el: Node) => boolean): Node;
/** tidy one node's childNodes, concate broken text nodes */
export declare function tidy(el: Element): void;
/** Create element */
export declare function elt<TagName extends keyof HTMLElementTagNameMap>(tag: TagName, attrs?: Record<string, string | true>, content?: string | NodeList | Node[]): HTMLElementTagNameMap[TagName];
export declare function elt(tag: string, attrs?: Record<string, string | true>, content?: string | NodeList | Node[]): HTMLElement;
/** create <br> for empty lines */
export declare function makeBr(): HTMLBRElement;
/** create <p> for empty lines */
export declare function makeLine(content?: Node[] | NodeList): HTMLParagraphElement;
/** insert new node before old one, then remove old one */
export declare function replace(old: Node, newNode: Node): void;
/** insert a node after an existsing one */
export declare function insertAfter(newNode: Node, refNode: Node): void;
export declare function isTextNode(node: any): node is Text;
interface ClientRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}
/**
 * get current viewport rect
 *
 * @returns Non-Standard ClientRect (because IE/Edge not supports DOMRect)
 */
export declare function getViewport(_window?: Window, considerScroll?: boolean): ClientRect;
/**
 * a much better polyfill for scrollIntoViewIfNeeded
 *
 * @returns - `true` -- trigged and now node is on the top edge.
 *          - `false` -- trigged and node is on the bottom edge.
 *          - `undefined` -- nothing happened
 */
export declare function scrollIntoViewIfNeeded(node: HTMLElement): boolean;
export {};
