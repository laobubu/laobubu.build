import { TransformerType } from "../index";
/**
 * Create a Transformer for inline elements.
 *
 * examples: (where `|` is caret, '**' is tag):
 *  - `<p> Hello **World**|</p>`
 *  - `<p> Hello **Wo <b>rl</b> d**|</p>`
 */
export default function createInlineTransformer(tag: string, doWrap: (range: Range) => HTMLElement, reserveTag?: boolean): TransformerType;
