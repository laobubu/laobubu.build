import { elt, setCaretAfter, insertAfter } from "../dom";
var renderer = defaultRenderer;
export function getMathRenderer() { return renderer; }
export function setMathRenderer(r) { renderer = r || defaultRenderer; }
function defaultRenderer(formula, displayMode) {
    var src = 'http://latex.codecogs.com/gif.latex?' + encodeURIComponent(formula);
    var img = elt('img', {
        src: src,
        alt: formula,
        title: formula,
        'data-formula': formula,
    });
    return img;
}
function transformMath(caret) {
    if (caret.nodeType !== Node.TEXT_NODE)
        return 0 /* FAILED */;
    var text = caret.textContent;
    var mat = text.match(/(\${1,2})([^\$]+)\1$/);
    if (!mat)
        return 0 /* FAILED */;
    var expr = mat[2], displayMode = mat[1].length == 2;
    var mathEl = renderer(expr, displayMode);
    if (!mathEl)
        return 0 /* FAILED */;
    caret.textContent = text.slice(0, -mat[0].length);
    insertAfter(mathEl, caret);
    setCaretAfter(mathEl);
    return 1 /* SUCCESS */;
}
export default transformMath;
