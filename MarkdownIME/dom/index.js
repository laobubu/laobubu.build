/** This file provides some util functions for DOM manipulation */
var win = window;
var document = window.document;
/** Set the context document. This will affect some DOM operation like `elt`, `findCaret` */
export function setContextDocument(doc) {
    document = doc || window.document;
    win = document.defaultView;
}
/**
 * Get the context document that currently MarkdownIME is using.
 *
 * The context affects some DOM operation like `elt`, `findCaret`
 */
export function getContextDocument() {
    return document;
}
/**
 * Try to get the node which is exactly before the caret.
 */
export function findCaret() {
    var sel = document.getSelection();
    var anchorNode = sel.anchorNode, anchorOffset = sel.anchorOffset;
    if (!sel.isCollapsed || !anchorNode)
        return null;
    if (anchorNode.nodeType === Node.ELEMENT_NODE) {
        return anchorOffset == 0 ? anchorNode : anchorNode.childNodes[anchorOffset - 1];
    }
    if (anchorNode.nodeType === Node.TEXT_NODE) {
        var textContent = anchorNode.textContent;
        if (anchorOffset == 0)
            return anchorNode.previousSibling;
        if (textContent.length <= anchorOffset)
            return anchorNode;
        // break text node into two
        anchorNode.textContent = textContent.slice(0, anchorOffset);
        var newNode = document.createTextNode(textContent.slice(anchorOffset));
        anchorNode.parentNode.insertBefore(newNode, anchorNode.nextSibling);
        sel.setPosition(anchorNode, anchorOffset);
        return anchorNode;
    }
    return null;
}
export function setCaret(anchor, offset) {
    var sel = document.getSelection();
    if (!sel.isCollapsed)
        sel.collapseToEnd();
    sel.setPosition(anchor, offset || 0);
    scrollIntoViewIfNeeded((isTextNode(anchor) ? anchor.parentNode : anchor));
}
export function setCaretAfter(anchor) {
    var parent = anchor.parentNode;
    setCaret(parent, [].indexOf.call(parent.childNodes, anchor) + 1);
    scrollIntoViewIfNeeded((isTextNode(anchor) ? parent : anchor));
}
/**
 * Get Line Container Node
 */
export function getLineContainer(el) {
    return findUpward(el, function (node) { return /^(?:div|p|h\d|pre|body|td|th|li|dt|dd|blockquote)$/i.test(node.nodeName); });
}
export function breakElement(el) {
    if (!el || !el.parentElement)
        return;
    var parent = el.parentElement;
    var frag = document.createDocumentFragment();
    while (el.childNodes.length)
        frag.appendChild(el.childNodes[0]);
    parent.insertBefore(frag, el);
    parent.removeChild(el);
}
export function findUpward(el, checker) {
    while (el) {
        if (checker(el))
            return el;
        else
            el = el.parentNode;
    }
    return null;
}
/** tidy one node's childNodes, concate broken text nodes */
export function tidy(el) {
    var nodes = el.childNodes;
    for (var i = 0; i < nodes.length; i++) {
        var base = nodes[i];
        if (base.nodeType !== Node.TEXT_NODE)
            continue;
        var forwardCnt = 1;
        var forwardText = "";
        while (nodes[i + forwardCnt] && nodes[i + forwardCnt].nodeType === Node.TEXT_NODE) {
            forwardText += nodes[i + forwardCnt].textContent;
            forwardCnt++;
        }
        if (forwardCnt > 1) {
            while (forwardCnt-- > 1)
                el.removeChild(nodes[i + 1]);
            base.textContent += forwardText;
        }
        i++;
    }
}
export function elt(tag, attrs, content) {
    var el = document.createElement(tag);
    if (attrs)
        for (var attr in attrs) {
            var val = attrs[attr];
            el.setAttribute(attr, "" + val);
        }
    if (typeof content === 'string')
        el.textContent = content;
    else if (content && content.length > 0)
        [].slice.call(content).forEach(function (child) { return el.appendChild(child); });
    return el;
}
/** create <br> for empty lines */
export function makeBr() {
    return elt('br', { 'data-bogus': true });
}
/** create <p> for empty lines */
export function makeLine(content) {
    return elt('p', null, content || [makeBr()]);
}
/** insert new node before old one, then remove old one */
export function replace(old, newNode) {
    var parent = old && old.parentNode;
    if (!parent)
        return;
    parent.insertBefore(newNode, old);
    parent.removeChild(old);
}
/** insert a node after an existsing one */
export function insertAfter(newNode, refNode) {
    var parent = refNode && refNode.parentNode;
    if (!parent)
        return;
    parent.insertBefore(newNode, refNode.nextSibling);
}
export function isTextNode(node) {
    return node && node.nodeType === Node.TEXT_NODE;
}
/**
 * get current viewport rect
 *
 * @returns Non-Standard ClientRect (because IE/Edge not supports DOMRect)
 */
export function getViewport(_window, considerScroll) {
    if (!_window)
        _window = win || window;
    var left = considerScroll ? _window.pageXOffset : 0;
    var top = considerScroll ? _window.pageYOffset : 0;
    var height = _window.innerHeight;
    var width = _window.innerWidth;
    return {
        left: left, top: top, height: height, width: width,
        right: left + width,
        bottom: top + height,
    };
}
function rectContains(container, subRect) {
    if (container.left >= subRect.left)
        return 3 /* LEFT */;
    if (container.right <= subRect.right)
        return 4 /* RIGHT */;
    if (container.top >= subRect.top)
        return 1 /* ABOVE */;
    if (container.bottom <= subRect.bottom)
        return 2 /* BELOW */;
    return 0 /* CONTAINED */;
}
/**
 * a much better polyfill for scrollIntoViewIfNeeded
 *
 * @returns - `true` -- trigged and now node is on the top edge.
 *          - `false` -- trigged and node is on the bottom edge.
 *          - `undefined` -- nothing happened
 */
export function scrollIntoViewIfNeeded(node) {
    if ('scrollIntoViewIfNeeded' in node) { // Chrome only stuff
        node.scrollIntoViewIfNeeded(false);
        return;
    }
    var body = node.ownerDocument.body;
    var window = body.ownerDocument.defaultView;
    var scrollArg = void 0;
    var nodeRect = node.getBoundingClientRect();
    var node_it = node;
    while (scrollArg === void 0) {
        var container = node_it.parentElement;
        var containerRect = (node_it === body) ? getViewport(window, false) : container.getBoundingClientRect();
        var rectRelation = rectContains(containerRect, nodeRect);
        if (rectRelation === 3 /* LEFT */ || rectRelation === 1 /* ABOVE */)
            scrollArg = true;
        if (rectRelation === 4 /* RIGHT */ || rectRelation === 2 /* BELOW */)
            scrollArg = false;
        if (node_it === body)
            break;
        node_it = container;
    }
    if (scrollArg !== void 0)
        node.scrollIntoView(scrollArg);
    return scrollArg;
}
