/** UI configuration used in this demo. */
export declare type UiState = {
    /** Fraction of the speed of light the camera is traveling at. */
    cameraBeta: number;
    /** Use a fixed velocity as the speed of light. */
    useFixedVelocity: boolean;
    /** Don't take into account travel time of light to reach camera. */
    useNoTimeDelay: boolean;
    /**
     * True to transform according to Euclidean space. False for special
     * relativity.
     */
    galilean: boolean;
};
export declare const getState: () => UiState;
/** Element to add the UI to. */
export declare const initUi: (el: HTMLElement) => void;
//# sourceMappingURL=ui.d.ts.map