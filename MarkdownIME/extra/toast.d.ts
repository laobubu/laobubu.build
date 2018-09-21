export declare enum ToastStatus {
    Hidden = 0,
    Shown = 1,
    Hiding = 2
}
/**
 * Tooltip Box, or a Toast on Android.
 *
 * Providing a static method `showToast(text, coveron[, timeout])`, or you can construct one and control its visibility.
 */
export declare class Toast {
    static SHORT: number;
    static LONG: number;
    static style: string;
    document: Document;
    element: HTMLDivElement;
    status: ToastStatus;
    constructor(document: Document, text: string);
    setPosition(left: number, topOrBottom: number, isBottom?: boolean): void;
    show(timeout?: number): void;
    dismiss(): void;
    /**
     * A Quick way to show a temporary Toast over an Element.
     *
     * @param {string} text     message to be shown
     * @param {Element} ref     the location reference
     * @param {number} timeout  time in ms. 0 = do not dismiss.
     * @param {boolean} cover   true = cover on the ref. false = shown on top of the ref.
     */
    static showToast(text: string, ref: HTMLElement, timeout: number, cover?: boolean): Toast;
}
