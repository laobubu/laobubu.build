import { elt } from "../dom";
import createBlockTransformer from "./pattern/block";
var transformUnorderedList = createBlockTransformer(/^[-*]$/, function (match, line) {
    var item = elt("li", null, line.childNodes);
    var list = elt("ul", null, [item]);
    return list;
});
export default transformUnorderedList;
