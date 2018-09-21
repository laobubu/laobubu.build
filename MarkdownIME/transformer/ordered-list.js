import { elt } from "../dom";
import createBlockTransformer from "./pattern/block";
var transformOrderedList = createBlockTransformer(/^(\d+)[\.\)]$/, function (match, line) {
    var start = match[1]; // start number
    var item = elt("li", null, line.childNodes);
    var list = elt("ol", { start: start }, [item]);
    return list;
});
export default transformOrderedList;
