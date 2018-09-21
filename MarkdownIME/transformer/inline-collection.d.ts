import { TransformerType } from ".";
export declare const wrapCode: (range: Range) => HTMLElement;
export declare const wrapBold: (range: Range) => HTMLElement;
export declare const wrapItalic: (range: Range) => HTMLElement;
export declare const wrapDel: (range: Range) => HTMLElement;
export declare const wrapBoldItalic: (range: Range) => HTMLElement;
declare const inlineStyleTransformers: TransformerType[];
export default inlineStyleTransformers;
