import { findUpward } from "../dom";
import transformHR from "./hr";
import transformHeader from "./header";
import transformBlockquote from "./blockquote";
import transformOrderedList from "./ordered-list";
import transformUnorderedList from "./unordered-list";
import transformCodefence from "./codefence";
import inlineStyleTransformers from "./inline-collection";
import transformLinkAndImage from "./link-n-image";
import transformEmoji from "./emoji";
import transformMath from "./math";
var transformers = [
    transformHeader, transformHR, transformBlockquote,
    transformOrderedList, transformUnorderedList,
    transformCodefence
].concat(inlineStyleTransformers, [
    transformLinkAndImage,
    transformEmoji,
    transformMath,
]);
export function caretIsSafeForInline(caret) {
    if (caret.nodeType !== Node.TEXT_NODE)
        return false;
    if (findUpward(caret, function (parent) { return /^(?:code|pre)$/i.test(parent.nodeName); }))
        return false;
    return true;
}
export { transformers };
