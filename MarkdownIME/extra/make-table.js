import { isTextNode, elt, replace, setCaret, makeBr, getContextDocument } from "../dom";
export default function tryMakeTable(caret, line) {
    var nodes = line.childNodes, first = nodes[0], last = nodes[nodes.length - 1];
    // sometime there is an extra <br>, just remove it
    if (last && last.nodeName.toLowerCase() === 'br') {
        line.removeChild(last);
        last = nodes[nodes.length - 1];
    }
    if (!isTextNode(first) || !isTextNode(last))
        return false;
    if (!/^\s*\|/.test(first.textContent) || !/\|\s*$/.test(last.textContent))
        return false;
    var headerCells = [];
    var currentCell = null;
    function goNextCell() {
        if (currentCell && currentCell.childNodes.length > 0)
            headerCells.push(currentCell);
        currentCell = elt('th');
    }
    goNextCell();
    while (nodes.length > 0) {
        var srcNode = nodes[0];
        if (isTextNode(srcNode)) {
            srcNode.textContent.split("|").forEach(function (text, idx) {
                if (idx > 0)
                    goNextCell();
                if (!/^\s*$/.test(text))
                    currentCell.appendChild(getContextDocument().createTextNode(text));
            });
            line.removeChild(srcNode);
        }
        else {
            currentCell.appendChild(srcNode);
        }
    }
    goNextCell();
    if (headerCells.length == 0)
        return false;
    var headerRow = elt('tr', null, headerCells);
    var contentRow = elt('tr', null, headerCells.map(function () { return elt('td'); }));
    var table = elt('table', null, [headerRow, contentRow]);
    var contentCell = contentRow.childNodes[0];
    contentCell.appendChild(makeBr());
    replace(line, table);
    setCaret(contentCell);
    return true;
}
