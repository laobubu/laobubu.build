/*!
 * MarkdownIME by laobubu
 * @url https://github.com/laobubu/MarkdownIME
 */
import * as DOM from "./dom";
import { TransformerResult } from './transformer';
export { DOM };
export { getContextDocument, setContextDocument, elt } from "./dom";
export { Toast, ToastStatus } from "./extra/toast";
export { emoticonDict, shortcodeDict as emojiDict } from "./transformer/emoji";
export { getMathRenderer, setMathRenderer, MathRenderer } from "./transformer/math";
export interface Editor {
    editor: HTMLElement;
    document: Document;
    /**
     * do transform on current caret.
     *
     * @param enterKey if true, a new line might be inserted
     */
    doTransform(enterKey?: boolean): TransformerResult;
}
export interface EnhanceOption {
    /**
     * MarkdownIME provides Ctrl+B, Ctrl+I, Ctrl+E, Ctrl+R ... shortkeys by default.
     * You may disable this feature
     *
     * If not configured, MarkdownIME will set to `true` if the editor is TinyMCE
     */
    noShortkey: boolean;
    /** When MarkdownIME is ready, show a toast above */
    successToast: boolean;
}
/** Return all content-editable elements inside the window, which could be enhanced by MarkdownIME. */
export declare function Scan(window: Window): HTMLElement[];
/** Enhance one contentEditable element, making MarkdownIME work on. */
export declare function Enhance(editor: HTMLElement, options?: Partial<EnhanceOption>): Editor;
/** Enhance multi contentEditable elements, making MarkdownIME work on. */
export declare function Enhance(editor: ArrayLike<HTMLElement>, options?: Partial<EnhanceOption>): Editor[];
/** Scan and enhance all editors, then show a notice. */
export declare function Bookmarklet(win?: Window, options?: Partial<EnhanceOption>): void;
