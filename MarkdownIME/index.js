/*!
 * MarkdownIME by laobubu
 * @url https://github.com/laobubu/MarkdownIME
 */
import * as DOM from "./dom";
import { findCaret, setCaret, replace, getLineContainer, findUpward, makeLine, setContextDocument } from "./dom";
import { transformers } from './transformer';
import bindShortkeys from "./extra/shortkeys";
import tryHoistBlock from "./extra/leave-block";
import tryInsertLine from "./extra/new-line";
import { Toast } from "./extra/toast";
import tryMakeTable from "./extra/make-table";
export { DOM };
export { getContextDocument, setContextDocument, elt } from "./dom";
export { Toast, ToastStatus } from "./extra/toast";
export { emoticonDict, shortcodeDict as emojiDict } from "./transformer/emoji";
export { getMathRenderer, setMathRenderer } from "./transformer/math";
/** Return all content-editable elements inside the window, which could be enhanced by MarkdownIME. */
export function Scan(window) {
    var document = window.document;
    var candidates = document.querySelectorAll('[contenteditable], [designMode]');
    var editors = [];
    for (var i = 0; i < candidates.length; i++) {
        var candidate = candidates[i];
        var rect = candidate.getBoundingClientRect();
        if (rect.height > 10 && rect.width > 10)
            editors.push(candidate);
    }
    [].forEach.call(document.querySelectorAll('iframe'), function (i) {
        try {
            var result = Scan(i.contentWindow);
            editors.push.apply(editors, result);
        }
        catch (err) {
            //security limit, cannot scan the iframe
        }
    });
    return editors;
}
export function Enhance(editor, options) {
    if ('length' in editor) {
        var ans = [];
        for (var i = 0; i < editor.length; i++)
            ans.push(EnhanceOne(editor[i], options));
        return ans;
    }
    else {
        return EnhanceOne(editor, options);
    }
}
/** Scan and enhance all editors, then show a notice. */
export function Bookmarklet(win, options) {
    var opts = { successToast: true };
    if (options) {
        for (var key in options)
            opts[key] = options[key];
    }
    var editableElements = Scan(win || window);
    Enhance(editableElements, opts);
}
function EnhanceOne(editor, options) {
    if (!options)
        options = {};
    if (!('noShortkey' in options)) {
        // by default, disable shortkeys in TinyMCE and Quill
        options.noShortkey = editor.id === 'tinymce' || /\bql-editor\b/.test(editor.className);
    }
    if (!options.noShortkey)
        bindShortkeys(editor);
    var document = editor.ownerDocument;
    var doTransform = function (enterKey) {
        setContextDocument(document);
        var caretEl = findCaret();
        if (!caretEl)
            return 0 /* FAILED */;
        if (editor === caretEl) {
            caretEl = makeLine();
            editor.appendChild(caretEl);
            setCaret(caretEl);
        }
        else if (caretEl.nodeType === Node.TEXT_NODE && caretEl.parentNode === editor) {
            // make a line container for
            // <div id="editor"> content <b> not </b> wrapped by P or DIV </div>
            var placeholder = document.createComment("placeholder");
            replace(caretEl, placeholder);
            var line = makeLine([caretEl]);
            replace(placeholder, line);
            setCaret(caretEl);
        }
        for (var i = 0; i < transformers.length; i++) {
            var transformer = transformers[i];
            var trResult = transformer(caretEl);
            if (trResult !== 0 /* FAILED */)
                return trResult;
        }
        // no transformer work. Maybe time to handle Enter Key?
        if (enterKey) {
            var isInCodeFence = !!findUpward(caretEl, function (el) { return el.nodeName.toLowerCase() === 'pre'; });
            var line = getLineContainer(caretEl);
            var success = tryHoistBlock(caretEl, line);
            if (!isInCodeFence && !success) {
                success = tryInsertLine(caretEl, line) || tryMakeTable(caretEl, line);
            }
            if (success)
                return 2 /* NEED_PREVENT_DEFAULT */;
        }
        // Everything failed
        return 0 /* FAILED */;
    };
    editor.addEventListener('keypress', function (ev) {
        if (ev.which === 32 || ev.which === 13) { // pressed space key
            var trResult = doTransform(ev.which === 13);
            if (trResult === 2 /* NEED_PREVENT_DEFAULT */)
                ev.preventDefault();
        }
    }, false);
    if (options.successToast)
        Toast.showToast("MarkdownIME loaded", editor, Toast.SHORT, true);
    return { editor: editor, document: document, doTransform: doTransform };
}
