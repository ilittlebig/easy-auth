type HubPayload = {
  [key: string]: any;
};

type Listener = {
  name: string;
  callback: (capsule: HubCapsule) => void;
};

type HubCapsule = {
  channel: string;
  payload: HubPayload;
  patternInfo: any[];
};

export class HubClass {
  private name: string;
  private listeners: Map<string, Listener[]>;

  constructor(name: string) {
    this.name = name;
    this.listeners = new Map<string, Listener[]>();
  }

  /**
   * Used internally to remove a Hub listener.
   *
   * @remarks
   * This private method is for internal use only. Instead of calling Hub.remove, call the result of Hub.listen.
   */
  private _remove(channel: string, listener: (capsule: HubCapsule) => void): void {
    const holder = this.listeners.get(channel);
    if (!holder) {
      console.log(`No listeners for ${channel}`);
      return;
    }

    this.listeners.set(channel, holder.filter(({ callback }) => callback !== listener));
  }

  /**
   * Used to send a Hub event.
   *
   * @param channel - The channel on which the event will be broadcast
   * @param payload - The HubPayload
   */
  dispatch(channel: string, payload: HubPayload): void {
    const capsule: HubCapsule = {
      channel,
      payload: { ...payload },
      patternInfo: [],
    };

    try {
      this._toListeners(capsule);
    } catch (e) {
      console.log("dispatch error:", e);
    }
  }

  /**
   * Used to listen for Hub events.
   *
   * @param channel - The channel on which to listen
   * @param callback - The callback to execute when an event is received on the specified channel
   * @param listenerName - The name of the listener; defaults to "noname"
   * @returns A function which can be called to cancel the listener.
   */
  listen(
    channel: string,
    callback: (capsule: HubCapsule) => void,
    listenerName: string = "noname"
  ): () => void {
    if (typeof callback !== "function") {
      /*
      throw new AuthError({
        name: NO_HUBCALLBACK_PROVIDED_EXCEPTION,
        message: "No callback supplied to Hub",
      });
      */
      return () => {};
    }

    let holder = this.listeners.get(channel);
    if (!holder) {
      holder = [];
      this.listeners.set(channel, holder);
    }

    holder.push({
      name: listenerName,
      callback,
    });

    return () => this._remove(channel, callback);
  }

  private _toListeners(capsule: HubCapsule): void {
    const { channel } = capsule;
    const holder = this.listeners.get(channel);
    if (!holder) return;

    holder.forEach(listener => {
      try {
        listener.callback(capsule);
      } catch (e) {
        console.log("_toListeners error:", e);
      }
    });
  }
}

export const Hub = new HubClass("__default__");
