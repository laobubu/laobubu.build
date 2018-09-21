/**
 * Move line to higher level wrapper
 *
 * - NewWrapper
 *   - OldWrapper
 *     - Line
 *
 * eg: From
 *
 * - #editor
 *   - blockquote
 *      - p {caret here}
 *
 * To
 *
 * - #editor
 *   - blockquote
 *   - p {caret here}
 */
declare function tryHoistBlock(caret: Node, line: Element): boolean;
export default tryHoistBlock;
