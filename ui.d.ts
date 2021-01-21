export declare const enum SimultaneityFrame {
    world = 0,
    camera = 1
}
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
    /**
     * Used with `useNoTimeDelay` to define which frame to use to define
     * when events are simultaneous.
     */
    simultaneityFrame: SimultaneityFrame;
    /** Set to true to enable relativistic beaming. */
    relativisticBeaming: boolean;
    /** Set to true to doppler shift the wavelength of light. */
    dopplerEffect: boolean;
};
export declare const getState: () => UiState;
export declare const initSpeedIndicator: (el: HTMLElement) => HTMLDivElement;
/** Element to add the UI to. */
export declare const initUi: (el: HTMLElement) => void;
//# sourceMappingURL=ui.d.ts.map