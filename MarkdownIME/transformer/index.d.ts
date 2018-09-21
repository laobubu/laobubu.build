export declare const enum TransformerResult {
    FAILED = 0,
    SUCCESS = 1,
    NEED_PREVENT_DEFAULT = 2
}
export declare type TransformerType = (caret: Node) => TransformerResult;
declare const transformers: Array<TransformerType>;
export declare function caretIsSafeForInline(caret: Node): caret is Text;
export { transformers };
