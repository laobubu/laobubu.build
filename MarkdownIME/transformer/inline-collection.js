import createInlineTransformer from "./pattern/inline";
import { elt } from "../dom";
var makeWrapFn = function (tag) { return function (range) {
    var wrapper = elt(tag);
    range.surroundContents(wrapper);
    return wrapper;
}; };
export var wrapCode = makeWrapFn("code");
export var wrapBold = makeWrapFn("b");
export var wrapItalic = makeWrapFn("i");
export var wrapDel = makeWrapFn("del");
export var wrapBoldItalic = function (range) {
    var wrapper = elt("b");
    var wrapperOutside = elt("i");
    range.surroundContents(wrapper);
    range.surroundContents(wrapperOutside);
    return wrapperOutside;
};
var inlineStyleTransformers = [
    createInlineTransformer("`", wrapCode),
    createInlineTransformer("***", wrapBoldItalic),
    createInlineTransformer("___", wrapBoldItalic),
    // "bold" must be in front of "italic"
    createInlineTransformer("**", wrapBold),
    createInlineTransformer("__", wrapBold),
    createInlineTransformer("*", wrapItalic),
    createInlineTransformer("_", wrapItalic),
    createInlineTransformer("~~", wrapDel),
];
export default inlineStyleTransformers;
