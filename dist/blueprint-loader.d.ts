import { Component } from './component';
import { XinPackagedComponent } from './make-component';
export declare class Blueprint extends Component {
    tag: string;
    src: string;
    property: string;
    loaded?: XinPackagedComponent;
    onload: () => void;
    packaged(): Promise<XinPackagedComponent>;
    constructor();
}
export declare const blueprint: import("./xin-types").ElementCreator<Component<import("./xin-types").PartsMap<Element>>>;
export declare class BlueprintLoader extends Component {
    onload: () => void;
    constructor();
    private load;
    connectedCallback(): void;
}
export declare const blueprintLoader: import("./xin-types").ElementCreator<Component<import("./xin-types").PartsMap<Element>>>;
