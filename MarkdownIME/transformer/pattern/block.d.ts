import { TransformerType } from "../index";
export default function createBlockTransformer(prefix: RegExp, transformLine: (matchResult: RegExpMatchArray, oldLine: Element, caret: Node) => Element): TransformerType;
