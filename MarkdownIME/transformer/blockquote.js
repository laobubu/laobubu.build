import { elt, makeLine } from "../dom";
import createBlockTransformer from "./pattern/block";
var transformBlockquote = createBlockTransformer(/^(?:>\s*)+$/, function (match, line) {
    var bqCount = 0, txt = match[0];
    for (var i = 0; i < txt.length; i++)
        if (txt.charAt(i) === '>')
            bqCount++;
    var isInList = line.tagName.toLowerCase() === "li";
    if (isInList)
        line = makeLine(line.childNodes);
    var ans = line;
    while (bqCount--)
        ans = elt("blockquote", null, [ans]);
    if (isInList)
        ans = elt("li", null, [ans]);
    return ans;
});
export default transformBlockquote;
