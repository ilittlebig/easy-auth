type HubPayload = {
    [key: string]: any;
};
type HubCapsule = {
    channel: string;
    payload: HubPayload;
    patternInfo: any[];
};
export declare class HubClass {
    private listeners;
    constructor();
    /**
     * Used internally to remove a Hub listener.
     *
     * @remarks
     * This private method is for internal use only. Instead of calling Hub.remove, call the result of Hub.listen.
     */
    private _remove;
    /**
     * Used to send a Hub event.
     *
     * @param channel - The channel on which the event will be broadcast
     * @param payload - The HubPayload
     */
    dispatch(channel: string, payload: HubPayload): void;
    /**
     * Used to listen for Hub events.
     *
     * @param channel - The channel on which to listen
     * @param callback - The callback to execute when an event is received on the specified channel
     * @param listenerName - The name of the listener; defaults to "noname"
     * @returns A function which can be called to cancel the listener.
     */
    listen(channel: string, callback: (capsule: HubCapsule) => void, listenerName?: string): () => void;
    private _toListeners;
}
export declare const Hub: HubClass;
export {};
