export interface TNSPosition {
    node: Text;
    ch: number;
}
export declare function lastIndexOf(nodes: NodeList, needle: string, since?: TNSPosition): TNSPosition;
