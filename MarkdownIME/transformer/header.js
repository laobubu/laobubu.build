import { elt } from "../dom";
import createBlockTransformer from "./pattern/block";
var transformHeader = createBlockTransformer(/^#{1,6}$/, function (match, line) {
    var headerLevel = match[0].length;
    var headerEl = elt("h" + headerLevel, null, line.childNodes);
    return headerEl;
});
export default transformHeader;
