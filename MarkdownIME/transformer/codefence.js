import { elt } from "../dom";
import createBlockTransformer from "./pattern/block";
var transformCodefence = createBlockTransformer(/^```+([\w-]*)$/, function (match, line) {
    var lang = match[1];
    var ans = elt('pre', null, line.childNodes);
    if (lang)
        ans.setAttribute("data-lang", lang);
    return ans;
});
export default transformCodefence;
