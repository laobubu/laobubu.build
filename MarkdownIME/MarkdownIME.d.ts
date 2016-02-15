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
     * Move the cursor to the end of one element.
     */
    function move_cursor_to_end(ele: Node): void;
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
     * Find the path to one certain container.
     * @return {Array<Node>}
     */
    function build_parent_list(node: Node, end: Node): Array<Node>;
    /** convert some chars to HTML entities (`&` -> `&amp;`) */
    function text2html(text: string): string;
    /** add slash chars for a RegExp */
    function text2regex(text: string): string;
    /** convert HTML entities to chars */
    function html_entity_decode(html: string): string;
    /**
     * remove whitespace in the DOM text. works for textNode.
     */
    function trim(str: string): string;
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
declare namespace MarkdownIME {
    /** something like a bridge between text and HTML, used to manipulate inline objects. */
    class DomChaos {
        /**
         * the XML-free text; all the XML tags go to proxyStorage.
         *
         * use `/\uFFFC\uFFF9\w+\uFFFB/g` to detect the placeholder(proxy)
         *
         * if you get new HTML data, use `setHTML(data)`
         * if you want to replace some text to HTML, use `replace(pattern, replacementHTML)`
         */
        text: string;
        /** a dict containing XML marks extracted from the innerHTML  */
        proxyStorage: any;
        /** clone content of a real element */
        cloneNode(htmlElement: HTMLElement): void;
        /** extract strange things and get clean text. */
        digestHTML(html: string): string;
        /** set HTML content, which will update proxy storage */
        setHTML(html: string): void;
        /**
         * get HTML content. things in proxyStorage will be recovered.
         *
         * @argument {string} [althtml] - the HTML containing proxy replacement. If not set, the html of this DomChaos will be used.
         */
        getHTML(althtml?: string): string;
        /**
         * replace some text to HTML
         * this is very helpful if the replacement is part of HTML / you are about to create new nodes.
         *
         * @argument {RegExp}   pattern to match the text (not HTML)
         * @argument {function} replacementHTML the replacement HTML (not text. you shall convert the strange chars like `<` and `>` to html entities)
         */
        replace(pattern: RegExp | string, replacementHTML: string | ((...matchResult: string[]) => string)): void;
        /**
         * replace the tags from proxyStorage. this works like a charm when you want to un-render something.
         *
         * @argument {RegExp} pattern to match the proxy content.
         * @argument {boolean} [keepProxy] set to true if you want to keep the proxy placeholder in the text.
         *
         * @example
         * chaos.screwUp(/^<\/?b>$/gi, "**")
         * //before: getHTML() == "Hello <b>World</b>"	proxyStorage == {1: "<b>", 2: "</b>"}
         * //after:  getHTML() == "Hello **World**"		proxyStorage == {}
         */
        screwUp(pattern: RegExp, replacement: string | ((...matchResult: string[]) => string), keepProxy?: boolean): void;
        /** storage some text to proxyStorage, and return its mark string */
        createProxy(reality: string): string;
        markCount: number;
        markPrefix: string;
        markSuffix: string;
        /** generate a random mark string */
        nextMark(): string;
        /**
         * apply the HTML content to a real element and
         * keep original child nodes as much as possible
         *
         * using a simple diff algorithm
         */
        applyTo(target: HTMLElement): void;
    }
}
declare namespace MarkdownIME.Renderer {
    /**
     * IInlineRendererReplacement
     * @description can be used to implement customized replacement.
     */
    interface IInlineRule {
        name: string;
        render(tree: DomChaos): any;
        unrender?(tree: DomChaos): any;
    }
    /** the render rule for Markdown simple inline wrapper like *emphasis* ~~and~~ `inline code` */
    class InlineWrapperRule implements IInlineRule {
        name: string;
        nodeName: string;
        leftBracket: string;
        rightBracket: string;
        nodeAttr: {};
        regex: RegExp;
        regex2_L: RegExp;
        regex2_R: RegExp;
        constructor(nodeName: string, leftBracket: string, rightBracket?: string);
        render(tree: DomChaos): void;
        unrender(tree: DomChaos): void;
    }
    /**
     * Use RegExp to do replace.
     * One implement of IInlineRendererReplacement.
     */
    class InlineRegexRule implements IInlineRule {
        name: string;
        regex: RegExp;
        replacement: any;
        constructor(name: string, regex: RegExp, replacement: any);
        render(tree: DomChaos): void;
        unrender(tree: DomChaos): void;
    }
    /**
     * InlineRenderer: Renderer for inline objects
     *
     *  [Things to be rendered] -> replacement chain -> [Renderer output]
     *  (you can also add your custom inline replacement)
     *
     * @example
     * var renderer = new MarkdownIME.Renderer.InlineRenderer();
     * renderer.AddMarkdownRules();
     * renderer.RenderHTML('**Hello Markdown**');
     * // returns "<b>Hello Markdown</b>"
     */
    class InlineRenderer {
        /** Suggested Markdown Replacement */
        static markdownReplacement: IInlineRule[];
        /** Rules for this Renderer */
        rules: IInlineRule[];
        /** Render, on a DomChaos object */
        RenderChaos(tree: DomChaos): void;
        /** Render a HTML part, returns a new HTML part */
        RenderHTML(html: string): string;
        /**
         * Markdown Text to HTML
         * @note after escaping, `\` will become `\u001B`.
         * @return {string} HTML Result
         */
        RenderText(text: string): string;
        /**
         * do render on a textNode
         * @note make sure the node is a textNode; function will NOT check!
         * @return the output nodes
         */
        RenderTextNode(node: Node): Node[];
        /**
         * do render on a Node
         * @return the output nodes
         */
        RenderNode(node: HTMLElement): Node[];
        /** Add basic Markdown rules into this InlineRenderer */
        AddMarkdownRules(): InlineRenderer;
        /** Add one extra replacing rule */
        AddRule(rule: IInlineRule): void;
    }
}
declare namespace MarkdownIME.Renderer {
    interface ElevateResult {
        parent: Element;
        child: Element;
        feature?: any;
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
        Elevate(node: Element): {
            containerType: BlockRendererContainer;
            parent: Element;
            child: Element;
        };
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
declare var twemoji: {
    parse(text: string, ...args: any[]): string;
};
declare namespace MarkdownIME.Addon {
    /**
     * EmojiAddon is an add-on for InlineRenderer, translating `8-)` into ![😎](https://twemoji.maxcdn.com/36x36/1f60e.png)
     * Part of the code comes from `markdown-it/markdown-it-emoji`
     *
     * @see https://github.com/markdown-it/markdown-it-emoji/
     */
    class EmojiAddon implements MarkdownIME.Renderer.IInlineRule {
        name: string;
        use_shortcuts: boolean;
        /** use twemoji to get `img` tags if possible. if it bothers, disable it. */
        use_twemoji: boolean;
        twemoji_config: {};
        render(tree: DomChaos): void;
        unrender(tree: DomChaos): void;
        full_syntax: RegExp;
        /** magic1 translates `:name:` into proper emoji char */
        magic1(fulltext: string, name: string): string;
        /** shortcuts RegExp cache. Order: [shortest, ..., longest] */
        shortcuts_cache: {
            regexp: RegExp;
            length: number;
            targetName: string;
        }[];
        /** update the shortcuts RegExp cache. Run this after modifing the shortcuts! */
        UpdateShortcutCache(): void;
        chars: {
            "smile": string;
            "smiley": string;
            "grinning": string;
            "blush": string;
            "wink": string;
            "heart_eyes": string;
            "kissing_heart": string;
            "kissing_closed_eyes": string;
            "kissing": string;
            "kissing_smiling_eyes": string;
            "stuck_out_tongue_winking_eye": string;
            "stuck_out_tongue_closed_eyes": string;
            "stuck_out_tongue": string;
            "flushed": string;
            "grin": string;
            "pensive": string;
            "relieved": string;
            "unamused": string;
            "disappointed": string;
            "persevere": string;
            "cry": string;
            "joy": string;
            "sob": string;
            "sleepy": string;
            "disappointed_relieved": string;
            "cold_sweat": string;
            "sweat_smile": string;
            "sweat": string;
            "weary": string;
            "tired_face": string;
            "fearful": string;
            "scream": string;
            "angry": string;
            "rage": string;
            "confounded": string;
            "laughing": string;
            "satisfied": string;
            "yum": string;
            "mask": string;
            "sunglasses": string;
            "sleeping": string;
            "dizzy_face": string;
            "astonished": string;
            "worried": string;
            "frowning": string;
            "anguished": string;
            "imp": string;
            "smiling_imp": string;
            "open_mouth": string;
            "neutral_face": string;
            "confused": string;
            "hushed": string;
            "no_mouth": string;
            "innocent": string;
            "smirk": string;
            "expressionless": string;
            "smiley_cat": string;
            "smile_cat": string;
            "heart_eyes_cat": string;
            "kissing_cat": string;
            "smirk_cat": string;
            "scream_cat": string;
            "crying_cat_face": string;
            "joy_cat": string;
            "pouting_cat": string;
            "heart": string;
            "broken_heart": string;
            "two_hearts": string;
            "sparkles": string;
            "fist": string;
            "hand": string;
            "raised_hand": string;
            "cat": string;
            "mouse": string;
            "cow": string;
            "monkey_face": string;
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
            "negative_squared_cross_mark": string;
            "white_check_mark": string;
            "loop": string;
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
            "x": string;
            "exclamation": string;
            "heavy_exclamation_mark": string;
            "question": string;
            "grey_exclamation": string;
            "grey_question": string;
            "heavy_plus_sign": string;
            "heavy_minus_sign": string;
            "heavy_division_sign": string;
            "curly_loop": string;
            "black_medium_small_square": string;
            "white_medium_small_square": string;
            "black_circle": string;
            "white_circle": string;
            "white_large_square": string;
            "black_large_square": string;
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
            neutral_face: string[];
            open_mouth: string[];
            rage: string[];
            smile: string[];
            smiley: string[];
            smiling_imp: string[];
            sob: string[];
            stuck_out_tongue: string[];
            sunglasses: string[];
            sweat: string[];
            sweat_smile: string[];
            unamused: string[];
            wink: string[];
        };
    }
}
declare namespace MarkdownIME.Renderer {
    var inlineRenderer: InlineRenderer;
    var blockRenderer: BlockRenderer;
    /**
     * Make one Block Node beautiful!
     */
    function Render(node: HTMLElement): HTMLElement;
}
declare namespace MarkdownIME {
    var config: {
        "wrapper": string;
    };
    class Editor {
        editor: Element;
        document: Document;
        window: Window;
        selection: Selection;
        isTinyMCE: boolean;
        constructor(editor: Element);
        /**
         * Init MarkdownIME on this editor.
         */
        Init(): boolean;
        /**
         * Process the line on the cursor.
         * call this from the event handler.
         */
        ProcessCurrentLine(ev: KeyboardEvent): void;
        /**
         * Create new table row.
         * @argument {Node} refer - current cell
         * @return   {Node} the corresponding new cell element
         */
        CreateNewCell(refer: Node): Element;
        /**
         * Create new line after one node and move cursor to it.
         * return false if not successful.
         */
        CreateNewLine(node: Node): boolean;
        /**
         * Handler for keydown
         */
        keydownHandler(ev: KeyboardEvent): void;
        keyupHandler(ev: KeyboardEvent): void;
        /**
         * Generate Empty Line
         */
        GenerateEmptyLine(tagName?: string): HTMLElement;
    }
}
declare namespace MarkdownIME.UI {
    class Toast {
        static SHORT: number;
        static LONG: number;
        disappearing: boolean;
        element: HTMLDivElement;
        timeout: number;
        style: string;
        constructor(element: HTMLDivElement, timeout: number);
        show(): void;
        dismiss(): void;
        static makeToast(text: string, coveron: HTMLElement, timeout?: number): Toast;
    }
}
declare namespace MarkdownIME {
    /**
     * Fetching contenteditable elements from the window and its iframe.
     */
    function Scan(window: Window): Array<Element>;
    /**
     * Enhance one or more editor.
     */
    function Enhance(editor: Element | Element[]): Editor;
    /**
     * Bookmarklet Entry
     */
    function Bookmarklet(window: Window): void;
    /**
     * Function alias, just for compatibility
     * @deprecated since version 0.2
     */
    var bookmarklet: typeof Bookmarklet;
    var enhance: (window: any, element: any) => void;
    var prepare: (window: any, element: any) => void;
    var scan: (window: any) => void;
}
declare namespace MarkdownIME.Addon {
    /**
     * MathAddon is an add-on for InlineRenderer, transforms `$y=ax^2+b$` into a formatted html.
     *
     * This addon MUST have a higher priority, than other inline elements like emphasising.
     *
     * To enable, execute this:
     *  `MarkdownIME.Renderer.inlineRenderer.rules.unshift(new MarkdownIME.Addon.MathAddon())`
     *
     * Use CODECOGS API to generate the picture.
     * @see http://latex.codecogs.com/eqneditor/editor.php
     *
     * Originally planned to use http://www.mathjax.org/ , but failed due to its async proccessing.
     */
    class MathAddon implements MarkdownIME.Renderer.IInlineRule {
        name: string;
        imgServer: string;
        regex: RegExp;
        render(tree: DomChaos): void;
        unrender(tree: DomChaos): void;
    }
}
