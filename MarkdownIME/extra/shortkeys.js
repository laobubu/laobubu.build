import { wrapCode } from "../transformer/inline-collection";
import { findUpward, breakElement, setCaretAfter, getContextDocument } from "../dom";
import { handleKeyboardEvent } from "./table-keys";
function handleFormattingKeys(ev) {
    var ctrl = ev.ctrlKey, shift = ev.shiftKey, alt = ev.altKey, which = ev.which;
    var document = getContextDocument();
    if (false) { }
    else if (ctrl && !shift && !alt && which == 73) /* Ctrl+I */
        document.execCommand("italic");
    else if (ctrl && !shift && !alt && which == 66) /* Ctrl+B */
        document.execCommand("bold");
    else if (ctrl && !shift && !alt && which == 85) /* Ctrl+U */
        document.execCommand("underline");
    else if (ctrl && shift && !alt && which == 61) /* Ctrl+Shift+= */
        document.execCommand("superscript");
    else if (ctrl && !shift && !alt && which == 61) /* Ctrl+= */
        document.execCommand("subscript");
    else if (ctrl && !shift && !alt && which == 76) /* Ctrl+L */
        document.execCommand("justifyLeft");
    else if (ctrl && !shift && !alt && which == 69) /* Ctrl+E */
        document.execCommand("justifyCenter");
    else if (ctrl && !shift && !alt && which == 82) /* Ctrl+R */
        document.execCommand("justifyRight");
    else
        return false;
    return true;
}
function toggleInlineElement(ev) {
    var ctrl = ev.ctrlKey, shift = ev.shiftKey, alt = ev.altKey, which = ev.which;
    if (ctrl || shift || alt)
        return false;
    var document = getContextDocument();
    var sel = document.getSelection();
    if (sel.isCollapsed)
        return false;
    var caret = sel.focusNode;
    if (caret.nodeType === Node.ELEMENT_NODE)
        caret = caret.childNodes[sel.focusOffset] || caret;
    var range = sel.getRangeAt(0);
    if (which === 192) /* ` */ {
        var code = findUpward(caret, function (el) { return el.nodeName.toLowerCase() === 'code'; });
        if (code) {
            var newCaretAfter = code.lastChild;
            breakElement(code);
            setCaretAfter(newCaretAfter);
        }
        else {
            code = wrapCode(range);
            setCaretAfter(code);
        }
    }
    else
        return false;
    return true;
}
export default function bindShortkeys(editor) {
    editor.addEventListener('keydown', function (ev) {
        try {
            var handled = false /* add a `false` to align the following methods */
                || handleFormattingKeys(ev)
                || toggleInlineElement(ev)
                || handleKeyboardEvent(ev); // table keys
            if (!handled)
                return;
        }
        catch (err) {
            return;
        }
        ev.preventDefault();
        ev.stopPropagation();
    }, false);
}
