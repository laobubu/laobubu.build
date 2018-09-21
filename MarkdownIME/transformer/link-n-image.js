import { setCaretAfter, isTextNode, elt, getContextDocument } from "../dom";
import { lastIndexOf } from "../dom/textNodeSearch";
function transformLinkAndImage(caret) {
    if (!isTextNode(caret))
        return 0 /* FAILED */;
    if (caret.textContent.slice(-1) !== ')')
        return 0 /* FAILED */;
    var document = getContextDocument();
    var lineNodes = caret.parentElement.childNodes;
    var endPos = { node: caret, ch: caret.textContent.length - 1 };
    var middlePos = lastIndexOf(lineNodes, "](", endPos);
    if (!middlePos)
        return 0 /* FAILED */;
    var beginPos = lastIndexOf(lineNodes, "[", middlePos);
    if (!beginPos)
        return 0 /* FAILED */;
    // we found ( , )[ and ]    and it's time to extract data
    var urlRange = document.createRange();
    urlRange.setStart(middlePos.node, middlePos.ch);
    urlRange.setEnd(endPos.node, endPos.ch + 1);
    var url = urlRange.cloneContents().textContent.slice(2, -1).trim(); // remove "](" and ")", then trim
    if (!url)
        return 0 /* FAILED */;
    var beginNodeText = beginPos.node.textContent;
    var resultElement;
    var isImage = beginNodeText.charAt(beginPos.ch - 1) === '!';
    var textRange = document.createRange();
    textRange.setStart(beginPos.node, beginPos.ch + 1);
    textRange.setEnd(middlePos.node, middlePos.ch);
    if (isImage) {
        var alt = textRange.cloneContents().textContent.trim();
        resultElement = elt("img", { src: url, alt: alt });
        textRange.setStart(beginPos.node, beginPos.ch - 1);
        textRange.setEnd(endPos.node, endPos.ch + 1);
        textRange.deleteContents();
        textRange.insertNode(resultElement);
    }
    else {
        resultElement = elt("a", { href: url });
        var junkRange = document.createRange();
        junkRange.setStart(beginPos.node, beginPos.ch);
        junkRange.setEnd(beginPos.node, beginPos.ch + 1);
        junkRange.deleteContents();
        urlRange.deleteContents();
        textRange.surroundContents(resultElement);
    }
    setCaretAfter(resultElement);
    return 1 /* SUCCESS */;
}
export default transformLinkAndImage;
