import { setCaretAfter, tidy, getContextDocument } from "../../dom";
import { caretIsSafeForInline } from "../index";
import { lastIndexOf } from "../../dom/textNodeSearch";
/**
 * Create a Transformer for inline elements.
 *
 * examples: (where `|` is caret, '**' is tag):
 *  - `<p> Hello **World**|</p>`
 *  - `<p> Hello **Wo <b>rl</b> d**|</p>`
 */
export default function createInlineTransformer(tag, doWrap, reserveTag) {
    var tagLen = tag.length;
    return function (caret) {
        if (!caretIsSafeForInline(caret) || caret.textContent.slice(-tagLen) !== tag) {
            return 0 /* FAILED */;
        }
        // do not accept **space before tailing tag **
        if (caret.textContent.slice(-tagLen - 1, -tagLen) === ' ')
            return 0 /* FAILED */;
        var document = getContextDocument();
        var caretTextLen = caret.textContent.length;
        // find beginning tag
        var beginPos = lastIndexOf(caret.parentNode.childNodes, tag, { node: caret, ch: caretTextLen - tagLen - 1 });
        if (!beginPos)
            return 0 /* FAILED */;
        var endCh = caretTextLen - tagLen;
        if (!reserveTag) {
            // remove the tag
            caret.textContent = caret.textContent.slice(0, -tagLen);
            var bnt = beginPos.node.textContent;
            beginPos.node.textContent = bnt.slice(0, beginPos.ch) + bnt.slice(beginPos.ch + tagLen);
            if (caret === beginPos.node)
                endCh -= tagLen;
        }
        else {
            // move the selected range
            beginPos.ch += tagLen;
        }
        var range = document.createRange();
        range.setStart(beginPos.node, beginPos.ch);
        range.setEnd(caret, endCh);
        var wrapper = doWrap(range);
        if (!wrapper)
            return 0 /* FAILED */;
        setCaretAfter(wrapper);
        tidy(wrapper.parentElement);
        return 1 /* SUCCESS */;
    };
}
