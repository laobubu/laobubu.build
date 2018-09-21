import { setCaret, replace, insertAfter, makeBr, makeLine } from "../dom";
/**
 * Move line to higher level wrapper
 *
 * - NewWrapper
 *   - OldWrapper
 *     - Line
 *
 * eg: From
 *
 * - #editor
 *   - blockquote
 *      - p {caret here}
 *
 * To
 *
 * - #editor
 *   - blockquote
 *   - p {caret here}
 */
function tryHoistBlock(caret, line) {
    // maybe leave a codefence?
    if (line.nodeName.toLowerCase() === 'pre') {
        var pre = line, mat = caret.textContent.match(/(^|[\r\n])```+$/);
        if (mat) {
            caret.textContent = caret.textContent.slice(0, -mat[0].length);
            if (caret.nextSibling && caret.nextSibling.nodeName.toLowerCase() === 'br') {
                caret.parentNode.removeChild(caret.nextSibling);
            }
            if (caret.previousSibling && caret.previousSibling.nodeName.toLowerCase() === 'br') {
                caret.parentNode.removeChild(caret.previousSibling);
            }
            var br_1 = makeBr();
            var newLine = makeLine();
            insertAfter(newLine, pre);
            setCaret(newLine);
            return true;
        }
        return false;
    }
    // if line is not empty, do not try hoisting it
    if (line.textContent || line.querySelector('img,video,audio,object'))
        return false;
    var oldWrapper = line.parentNode;
    if (!/^(?:ul|ol|blockquote)$/i.test(oldWrapper.nodeName))
        return false;
    var newWrapper = oldWrapper.parentNode;
    newWrapper.insertBefore(line, oldWrapper.nextSibling);
    if (oldWrapper.childNodes.length == 0)
        newWrapper.removeChild(oldWrapper);
    if (!/^(?:ul|ol)$/i.test(newWrapper.nodeName) && line.nodeName.toLowerCase() === 'li') {
        // leaving a list ? convert <li> to <p>
        var newLine = makeLine(line.childNodes);
        replace(line, newLine);
        line = newLine;
    }
    // create a bogus <br>
    var br = line.querySelector('br');
    if (!br) {
        br = makeBr();
        caret.appendChild(br);
    }
    setCaret(br.parentNode);
    return true;
}
export default tryHoistBlock;
