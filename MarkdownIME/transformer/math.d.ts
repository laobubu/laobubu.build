import { TransformerResult } from ".";
export declare type MathRenderer = (formula: string, displayMode?: boolean) => HTMLElement;
export declare function getMathRenderer(): MathRenderer;
export declare function setMathRenderer(r: MathRenderer): void;
declare function transformMath(caret: Node): TransformerResult.FAILED | TransformerResult.SUCCESS;
export default transformMath;
