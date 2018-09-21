import { elt } from "../dom";
import createBlockTransformer from "./pattern/block";
var transformHR = createBlockTransformer(/^---+$/, function (match, line) {
    var hr = elt('hr');
    line.parentNode.insertBefore(hr, line);
    return line;
});
export default transformHR;
