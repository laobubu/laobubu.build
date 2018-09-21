import { TransformerResult } from ".";
export declare const shortcodeDict: Record<string, string>;
export declare const emoticonDict: Record<string, string>;
declare function transformEmoji(caret: Node): TransformerResult;
export default transformEmoji;
