import { getLineContainer, replace, setCaret, makeBr, getContextDocument } from "../../dom";
export default function createBlockTransformer(prefix, transformLine) {
    return function (caret) {
        var matchResult = caret.textContent.match(prefix);
        if (!matchResult)
            return 0 /* FAILED */;
        var line = getLineContainer(caret);
        var tmpNode = caret;
        while (tmpNode != line) {
            if (tmpNode.previousSibling)
                return 0 /* FAILED */;
            tmpNode = tmpNode.parentNode;
        }
        var document = getContextDocument();
        var placeHolder = document.createComment("placeholder");
        line.parentNode.insertBefore(placeHolder, line);
        var newLine = transformLine(matchResult, line, caret);
        if (!newLine) {
            return 0 /* FAILED */;
        }
        else if (newLine === line) {
            placeHolder.parentNode.removeChild(placeHolder);
        }
        else {
            try {
                placeHolder.parentNode.removeChild(line);
            }
            catch (err) { }
            replace(placeHolder, newLine);
        }
        caret.textContent = "";
        if (!newLine.textContent && !newLine.querySelector('br')) {
            var br = makeBr();
            if (caret.nodeType === Node.TEXT_NODE)
                caret.parentNode.insertBefore(br, caret.nextSibling);
            else
                caret.appendChild(br);
        }
        setCaret(caret);
        return 2 /* NEED_PREVENT_DEFAULT */;
    };
}
