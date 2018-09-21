/**
 * Handle keyboard events for table. Now supports:
 *
 * - Insert: insert a column
 * - Tab: goto next cell, or insert a row
 * - Backspace: delete empty row
 * - Del: delete empty row
 * - Up/Down/Left/Right: navigate between cells
 *
 * @returns {boolean} handled or not
 */
export declare function handleKeyboardEvent(ev: KeyboardEvent): boolean;
