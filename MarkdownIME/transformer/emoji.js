import { setCaretAfter } from "../dom";
import * as EmojiData from "../extra/emoji-data";
export var shortcodeDict = {
    "smile": "😄",
};
export var emoticonDict = {
    ":)": "😃",
};
EmojiData.loadShortCodes(shortcodeDict);
EmojiData.loadEmoticons(emoticonDict, shortcodeDict);
function transformEmoji(caret) {
    if (caret.nodeType !== Node.TEXT_NODE)
        return 0 /* FAILED */;
    var text = caret.textContent;
    var output = null;
    var removeCharCount = 0;
    for (var emoticon in emoticonDict) {
        if (text.slice(-emoticon.length) === emoticon) {
            output = emoticonDict[emoticon];
            removeCharCount = emoticon.length;
            break;
        }
    }
    if (!output) {
        var mat = text.match(/:([^:]+):$/);
        output = mat && shortcodeDict[mat[1]];
        if (output) {
            removeCharCount = mat[0].length;
        }
    }
    if (!output)
        return 0 /* FAILED */;
    caret.textContent = text.slice(0, -removeCharCount) + output;
    setCaretAfter(caret);
    return 1 /* SUCCESS */;
}
export default transformEmoji;
