/**
 * scrollIntoViewIfNeeded
 *
 * A Webkit stuff, but it works like a charm!
 */
interface Element {
    scrollIntoViewIfNeeded(centerIfNeeded?: boolean): any;
}
declare namespace MarkdownIME.Utils {
    /** convert some chars to HTML entities (`&` -> `&amp;`) */
    function text2html(text: string): string;
    /** add slash chars for a RegExp */
    function text2regex(text: string): string;
    /** convert HTML entities to chars */
    function html_entity_decode(html: string): string;
    /** remove whitespace in the DOM text. works for textNode. */
    function trim(str: string): string;
}
declare namespace MarkdownIME.Utils {
    namespace Pattern {
        namespace NodeName {
            var list: RegExp;
            var li: RegExp;
            var cell: RegExp;
            var line: RegExp;
            var blockquote: RegExp;
            var pre: RegExp;
            var hr: RegExp;
            var autoClose: RegExp;
        }
    }
    /**
     * Check if it's a BR or empty stuff.
     */
    function is_node_empty(node: Node, regardBrAsEmpty?: boolean): boolean;
    /**
     * revert is_node_empty()
     */
    function is_node_not_empty(node: Node): boolean;
    /**
     * Check if one node is a container for text line
     */
    function is_node_block(node: Node): boolean;
    /**
     * Check if one line container can be processed.
     */
    function is_line_container_clean(wrapper: Node): any;
    /**
     * Check if one line is empty
     */
    function is_line_empty(line: HTMLElement): boolean;
    /**
     * Get the previousSibling big block wrapper or create one.
     * @note every char in blockTagName shall be upper, like "BLOCKQUOTE"
     */
    function get_or_create_prev_block(node: Node, blockTagName: string): Node;
    /**
     * Find all non-empty children
     */
    function get_real_children(node: Node): Array<Node>;
    /**
     * Get all nodes on the same line.
     * This is for lines like <br>...<br>. it is recommended to use TextNode as the anchor.
     * If the anchor is <br>, nodes before it will be in return.
     */
    function get_line_nodes(anchor: Node, wrapper: Node): Array<Node>;
    /**
     * Get all parent elements.
     *
     * @returns {Element[]} the parents, exclude `node`, include `end`.
     */
    function build_parent_list(node: Node, end: Element): Element[];
    /**
     * help one element wear a wrapper
     */
    function wrap(wrapper: Node, node: Node): void;
    /**
     * get outerHTML for a new element safely.
     * @see http://www.w3.org/TR/2000/WD-xml-c14n-20000119.html#charescaping
     * @see http://www.w3.org/TR/2011/WD-html-markup-20110113/syntax.html#void-element
     */
    function generateElementHTML(nodeName: string, props?: Object, innerHTML?: string): string;
}
declare namespace MarkdownIME.Utils {
    /** Move the cursor to the end of one element. */
    function move_cursor_to_end(ele: Node): void;
}
declare namespace MarkdownIME.Renderer {
    interface IInlineToken {
        isToken: boolean;
        data: string | Node;
    }
    interface IInlineRule {
        name: string;
    }
    interface IInlineTokenRule extends IInlineRule {
        /** token chars that this rule needs */
        tokens: string[];
        Proc(InlineRenderProcess: any): boolean;
        /** callback when process is finished */
        afterProc?(InlineRenderProcess: any): any;
    }
    class InlineRenderProcess {
        renderer: InlineRenderer;
        tokens: IInlineToken[];
        document: Document;
        i: number;
        iStack: number[];
        constructor(renderer: any, document: any, tokens: any);
        /** turn tokens into plain string */
        toString(tokens?: IInlineToken[]): string;
        /** turn tokens into DocumentFragment */
        toFragment(tokens?: IInlineToken[]): DocumentFragment;
        pushi(): void;
        popi(): void;
        stacki(level: number): number;
        isToken(token: IInlineToken, tokenChar: string): boolean;
        /** a safe splice for `this.token`; it updates the stack */
        splice(startIndex: number, delCount: number, ...adding: IInlineToken[]): IInlineToken[];
        /** Iterate through all tokens, calling corresponding `InlineBracketRuleBase.Proc()` */
        execute(): void;
        /** merge adjacent text nodes into one */
        mergeTextNode(): void;
        debugDump(output?: boolean): string;
    }
    /**
     * InlineRenderer: Renderer for inline objects
     *
     * Flow:
     *
     * 1. Parse: `Renderer.parse(HTMLElement) => IInlineToken[]`
     * 2. Create a Process: `new InlineRenderProcess(...)`
     * 3. Execute: `InlineRenderProcess.execute()`
     * 4. Update HTMLElement
     *
     * @example
     * ```
     * var renderer = new MarkdownIME.Renderer.InlineRenderer();
     * // Add Markdown rules here...
     * renderer.RenderNode(node); // where node.innerHTML == "Hello **World<img src=...>**"
     * assert(node.innerHTML == "Hello <b>World<img src=...></b>");
     * ```
     */
    class InlineRenderer {
        rules: IInlineRule[];
        /** The chars that could be a token */
        tokenChars: {
            [char: string]: IInlineTokenRule[];
        };
        /**
         * do render on a Node
         *
         * @example
         * ```
         * renderer.RenderNode(node); //where node.innerHTML == "Hello **World<img src=...>**"
         * assert(node.innerHTML == "Hello <b>World<img src=...></b>")
         * ```
         */
        RenderNode(node: HTMLElement | DocumentFragment): void;
        /**
         * Extract tokens.
         *
         * @example
         * ```
         * var tokens = renderer.Parse(node); //where node.innerHTML == "Hello [<img src=...> \\]Welcome](xxx)"
         * tokens[0] == {isToken: false, data: "Hello "}
         * tokens[1] == {isToken: true,  data: "["}
         * tokens[2] == {isToken: false, data: (ElementObject)}
         * tokens[3] == {isToken: false, data: " \\]Welcome"}
         * //...
         * ```
         */
        parse(contentContainer: Element | DocumentFragment): IInlineToken[];
        /** Add one extra replacing rule */
        addRule(rule: IInlineRule): void;
    }
}
declare namespace MarkdownIME.Renderer {
    interface ElevateResult {
        parent: Element;
        child: Element;
        feature?: any;
        containerType?: BlockRendererContainer;
    }
    class BlockRendererContainer {
        name: string;
        /**
         * the feature mark HTML, which will be removed.
         * do not forget `^` when writing RegExp
         * @example ^\s*\d+\.\s+ for ordered list.
         * @example ^(\>|&gt;)\s* for blockquote
         */
        featureMark: RegExp;
        /**
         * the new nodeName of children. Use `null` to keep original nodeName when elevate a node.
         * @example "LI" for "ol > li"
         */
        childNodeName: string;
        /**
         * the new nodeName of parent. Use `null` to prevent creating one.
         * @example "OL" for "ol > li"
         */
        parentNodeName: string;
        /**
         * tell if user can type inside. this helps when creating strange things like <hr>
         */
        isTypable: boolean;
        /**
         * if is true, the text that matches featureMark will be deleted.
         */
        removeFeatureMark: boolean;
        /** changing its name, moving it into proper container. return null if failed. */
        Elevate(node: Element): ElevateResult;
        /**
         * check if one node is elevatable and remove the feature mark.
         * do NOT use this func outsides Elevate()
         */
        prepareElevate(node: Element): string[];
    }
    namespace BlockRendererContainers {
        class UL extends BlockRendererContainer {
            constructor();
        }
        class OL extends BlockRendererContainer {
            constructor();
            Elevate(node: Element): ElevateResult;
        }
        class BLOCKQUOTE extends BlockRendererContainer {
            constructor();
        }
        /** assuming a <hr> is just another block container and things go easier */
        class HR extends BlockRendererContainer {
            constructor();
            Elevate(node: Element): {
                parent: Element;
                child: Element;
            };
        }
        class CodeBlock extends BlockRendererContainer {
            constructor();
            Elevate(node: Element): {
                parent: Element;
                child: Element;
            };
        }
        class HeaderText extends BlockRendererContainer {
            constructor();
            Elevate(node: Element): {
                parent: Element;
                child: Element;
            };
        }
        class TableHeader extends BlockRendererContainer {
            constructor();
            Elevate(node: Element): {
                parent: Element;
                child: Element;
            };
        }
    }
    /**
     * In fact the BlockRenderer is not a renderer; it can elevate / degrade a node, changing its name, moving it from one container to another.
     */
    class BlockRenderer {
        containers: BlockRendererContainer[];
        /** Elevate a node. Make sure the node is a block node. */
        Elevate(node: Element): ElevateResult;
        /** Elevate once. Not work with `> ## this situation` */
        ElevateOnce(node: Element): ElevateResult;
        /**
         * Get suggested nodeName of a new line inside a container.
         * @return null if no suggestion.
         */
        GetSuggestedNodeName(container: Element): string;
        static markdownContainers: BlockRendererContainer[];
        /**
         * Add Markdown rules into this BlockRenderer
         */
        AddMarkdownRules(): BlockRenderer;
    }
}
declare namespace MarkdownIME.Renderer {
    abstract class InlineBracketRuleBase implements IInlineTokenRule {
        name: string;
        tokens: string[];
        abstract isLeftBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean;
        abstract isRightBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean;
        abstract ProcWrappedContent(proc: InlineRenderProcess, i1: number, i2: number): any;
        Proc(proc: InlineRenderProcess): boolean;
    }
}
declare namespace MarkdownIME.Renderer {
    module Markdown {
        /** the name list of built-in Markdown inline rules */
        var InlineRules: string[];
        /** basic support of **Bold** and **Emphasis** */
        class Emphasis extends InlineBracketRuleBase {
            name: string;
            tokens: string[];
            tagNameEmphasis: string;
            tagNameStrong: string;
            isLeftBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean;
            isRightBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean;
            ProcWrappedContent(proc: InlineRenderProcess, i1: number, i2: number): void;
        }
        /** basic support of ~~StrikeThrough~~ */
        class StrikeThrough extends InlineBracketRuleBase {
            name: string;
            tokens: string[];
            tagName: string;
            isLeftBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean;
            isRightBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean;
            ProcWrappedContent(proc: InlineRenderProcess, i1: number, i2: number): void;
        }
        /** link and image with `[]`
         *
         * Notice: the `src` OR `href` is not implemented here.
         */
        class LinkAndImage extends InlineBracketRuleBase {
            name: string;
            tokens: string[];
            isLeftBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean;
            isRightBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean;
            ProcWrappedContent(proc: InlineRenderProcess, i1: number, i2: number): void;
        }
        class LinkAndImageData implements IInlineTokenRule {
            name: string;
            tokens: string[];
            Proc(proc: InlineRenderProcess): boolean;
        }
        class InlineCode implements IInlineTokenRule {
            name: string;
            tokens: string[];
            Proc(proc: InlineRenderProcess): boolean;
        }
    }
}
declare var twemoji: {
    parse(text: string, ...args: any[]): string;
};
declare namespace MarkdownIME.Addon {
    type InlineRenderProcess = MarkdownIME.Renderer.InlineRenderProcess;
    type IInlineToken = MarkdownIME.Renderer.IInlineToken;
    /**
     * EmojiAddon is an add-on for InlineRenderer, translating `8-)` into ![😎](https://twemoji.maxcdn.com/36x36/1f60e.png)
     *
     * Part of the code comes from `markdown-it/markdown-it-emoji`
     *
     * @see https://github.com/markdown-it/markdown-it-emoji/
     */
    class EmojiAddon extends MarkdownIME.Renderer.InlineBracketRuleBase {
        name: string;
        tokens: string[];
        use_shortcuts: boolean;
        /** use twemoji to get `img` tags if possible. if it bothers, disable it. */
        use_twemoji: boolean;
        twemoji_config: {};
        constructor();
        isLeftBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean;
        isRightBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean;
        ProcWrappedContent(proc: InlineRenderProcess, i1: number, i2: number): boolean;
        afterProc(proc: InlineRenderProcess): void;
        /** shortcuts RegExp cache. Order: [shortest, ..., longest] */
        shortcuts_cache: {
            regexp: RegExp;
            length: number;
            targetName: string;
        }[];
        /** update the shortcuts RegExp cache. Run this after modifing the shortcuts! */
        UpdateShortcutCache(): void;
        chars: {
            "smile": string[];
            "happy": string;
            "grin": string[];
            "blush": string;
            "wink": string;
            "sad": string[];
            "+1": string;
            "-1": string;
            "heart_eyes": string;
            "kiss": string[];
            "tongue": string;
            "flushed": string;
            "relieved": string;
            "unamused": string;
            "disappointed": string;
            "persevere": string;
            "cry": string;
            "joy": string;
            "sob": string;
            "sleepy": string;
            "cold_sweat": string;
            "sweat": string;
            "weary": string;
            "tired": string;
            "fearful": string[];
            "scream": string;
            "angry": string;
            "rage": string;
            "confounded": string;
            "laugh": string[];
            "yum": string;
            "mask": string;
            "sunglasses": string[];
            "sleeping": string;
            "dizzy": string;
            "astonished": string;
            "worry": string[];
            "frown": string[];
            "anguished": string;
            "imp": string;
            "smiling_imp": string;
            "open_mouth": string;
            "neutral": string;
            "confused": string;
            "hushed": string;
            "no_mouth": string;
            "innocent": string[];
            "smirk": string;
            "expressionless": string;
            "joy_cat": string;
            "pouting_cat": string;
            "heart": string[];
            "broken_heart": string;
            "two_hearts": string;
            "sparkles": string[];
            "fist": string;
            "hand": string;
            "raised_hand": string;
            "cat": string;
            "mouse": string;
            "cow": string;
            "monkey": string;
            "star": string;
            "zap": string;
            "umbrella": string;
            "hourglass": string;
            "watch": string;
            "black_joker": string;
            "mahjong": string;
            "coffee": string;
            "anchor": string;
            "wheelchair": string;
            "aries": string;
            "taurus": string;
            "gemini": string;
            "cancer": string;
            "leo": string;
            "virgo": string;
            "libra": string;
            "scorpius": string;
            "sagittarius": string;
            "capricorn": string;
            "aquarius": string;
            "pisces": string;
            "loop": string;
        };
        /** shortcuts. use RegExp instead of string would be better. */
        shortcuts: {
            angry: string[];
            blush: string[];
            broken_heart: string[];
            confused: string[];
            cry: string[];
            frowning: string[];
            heart: string[];
            two_hearts: RegExp[];
            imp: string[];
            innocent: string[];
            joy: string[];
            kissing: string[];
            laughing: string[];
            neutral: string[];
            open_mouth: string[];
            rage: string[];
            smile: string[];
            smiley: string[];
            smiling_imp: string[];
            sob: string[];
            tongue: string[];
            sunglasses: string[];
            sweat: string[];
            unamused: string[];
            wink: string[];
        };
    }
}
declare namespace MarkdownIME.Renderer {
    var inlineRenderer: InlineRenderer;
    var blockRenderer: BlockRenderer;
    var emojiRule: Addon.EmojiAddon;
    /**
     * Make one Block Node beautiful!
     */
    function Render(node: Element): Element;
}
declare namespace MarkdownIME {
    interface EditorConfig {
        /** the wrapper tagName of a line. usually "p" or "div" */
        wrapper?: string;
        /** the outterHTML of a `<br>` placeholder. on Chrome/Firefox, an empty line must has at least one `<br>` */
        emptyBreak?: string;
    }
    interface IGetCurrentLineResult {
        line: Element;
        parent_tree: Element[];
        half_break: boolean;
    }
    class Editor {
        static defaultConfig: EditorConfig;
        config: EditorConfig;
        editor: Element;
        document: Document;
        window: Window;
        selection: Selection;
        isTinyMCE: boolean;
        isIE: boolean;
        constructor(editor: Element, config?: EditorConfig);
        /**
         * Init MarkdownIME on this editor.
         */
        Init(): boolean;
        /**
         * get the line element where the cursor is in.
         *
         * @note when half_break is true, other things might not be correct.
         */
        GetCurrentLine(range: Range): IGetCurrentLineResult;
        /**
         * Process the line on the cursor.
         * call this from the event handler.
         */
        ProcessCurrentLine(ev: KeyboardEvent): void;
        /**
         * Create new table row.
         * @argument {Element} refer - current cell
         * @returns  {Element} the corresponding new cell element
         */
        CreateNewCell(refer: Element): Element;
        /**
         * Create new line after one node and move cursor to it.
         *
         * @param   {Element} node - current line element.
         * @returns {Element} new line element or `null`
         */
        CreateNewLine(node: Element): Element;
        /**
         * Handler for keydown
         */
        keydownHandler(ev: KeyboardEvent): void;
        /**
         * execute the instant rendering.
         *
         * this will not work inside a `<pre>` element.
         *
         * @param {Range} range where the caret(cursor) is. You can get it from `window.getSelection().getRangeAt(0)`
         * @param {boolean} moveCursor true if you want to move the caret(cursor) after rendering.
         * @return {boolean} successful or not.
         */
        instantRender(range: Range, moveCursor?: boolean): boolean;
        /**
         * keyupHandler
         *
         * 1. call `instantRender` when space key is released.
         */
        keyupHandler(ev: KeyboardEvent): void;
        /**
         * inputHandler
         */
        inputHandler(ev: any): void;
        /**
         * Generate Empty Line
         */
        GenerateEmptyLine(tagName?: string): HTMLElement;
        /**
         * KeyDown Event Handler for Tables
         *
         * Move cursor using TAB, Shift+TAB, UP and DOWN
         *
         * @returns {boolean} handled or not.
         */
        keydownHandler_Table(ev: KeyboardEvent): boolean;
    }
}
declare namespace MarkdownIME.UI {
    enum ToastStatus {
        Hidden = 0,
        Shown = 1,
        Hiding = 2,
    }
    /**
     * Tooltip Box, or a Toast on Android.
     *
     * Providing a static method `showToast(text, coveron[, timeout])`, or you can construct one and control its visibility.
     */
    class Toast {
        static SHORT: number;
        static LONG: number;
        static style: string;
        document: Document;
        element: HTMLDivElement;
        status: ToastStatus;
        constructor(document: Document, text: string);
        setPosition(left: number, topOrBottom: number, isBottom?: boolean): void;
        show(timeout?: number): void;
        dismiss(): void;
        /**
         * A Quick way to show a temporary Toast over an Element.
         *
         * @param {string} text     message to be shown
         * @param {Element} ref     the location reference
         * @param {number} timeout  time in ms. 0 = do not dismiss.
         * @param {boolean} cover   true = cover on the ref. false = shown on top of the ref.
         */
        static showToast(text: string, ref: HTMLElement, timeout: number, cover?: boolean): Toast;
    }
}
/*!@preserve
    [MarkdownIME](https://github.com/laobubu/MarkdownIME)
    
    Copyright 2016 laobubu

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
declare namespace MarkdownIME {
    /**
     * Fetching contenteditable elements from the window and its iframe.
     */
    function Scan(window: Window): Element[];
    /**
     * Enhance one or more editor.
     */
    function Enhance(editor: Element | Element[]): Editor | Editor[];
    /**
     * Bookmarklet Entry
     */
    function Bookmarklet(window: Window): void;
}
declare namespace MarkdownIME.Addon {
    /**
     * MathAddon is an add-on for InlineRenderer, transforms `$y=ax^2+b$` into a formatted html.
     *
     * This addon MUST have a higher priority, than other inline elements like emphasising.
     *
     * To enable, execute this:
     *  `MarkdownIME.Renderer.inlineRenderer.addRule(new MarkdownIME.Addon.MathAddon())`
     *
     * Use CODECOGS API to generate the picture.
     * @see http://latex.codecogs.com/eqneditor/editor.php
     *
     * Originally planned to use http://www.mathjax.org/ , but failed due to its async proccessing.
     */
    class MathAddon implements MarkdownIME.Renderer.IInlineTokenRule {
        name: string;
        imgServer: string;
        tokens: string[];
        Proc(proc: MarkdownIME.Renderer.InlineRenderProcess): boolean;
    }
}
