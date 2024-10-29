/**
 * Unit tests for the HubClass.
 *
 * Author: Elias Sjödin
 * Created: 2024-10-26
 */

import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  afterEach
} from "vitest";
import { HubClass } from "../../../src/internal/classes/hub";
// @ts-expect-error
import type { HubPayload, Listener } from "../../../src/internal/classes/hub";

// Mock console.log to avoid unnecessary output during tests
vi.spyOn(console, "log").mockImplementation(() => {});

describe("HubClass", () => {
  let hubInstance: HubClass;

  beforeEach(() => {
    hubInstance = new HubClass();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("listen", () => {
    test("should add a listener for a channel", () => {
      const callback = vi.fn();
      const channel = "testChannel";
      const listenerName = "testListener";

      const removeListener = hubInstance.listen(channel, callback, listenerName);

      expect(typeof removeListener).toBe("function");

      const listeners = (hubInstance as any).listeners.get(channel) as Listener[];
      expect(listeners).toBeDefined();
      expect(listeners.length).toBe(1);
      expect(listeners[0]).toEqual({ name: listenerName, callback });
    });

    test("should return a no-op function if callback is not a function", () => {
      const invalidCallback = null;
      const channel = "testChannel";

      // @ts-expect-error Testing invalid callback
      const removeListener = hubInstance.listen(channel, invalidCallback);

      expect(typeof removeListener).toBe("function");
      expect(() => removeListener()).not.toThrow();

      const listeners = (hubInstance as any).listeners.get(channel);
      expect(listeners).toBeUndefined();
    });
  });

  describe("dispatch", () => {
    test("should call listeners when an event is dispatched", () => {
      const callback = vi.fn();
      const channel = "testChannel";
      const payload: HubPayload = { data: "testData" };

      hubInstance.listen(channel, callback);
      hubInstance.dispatch(channel, payload);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({
        channel,
        payload,
        patternInfo: [],
      });
    });

    test("should handle errors in _toListeners and log dispatch error", () => {
      const error = new Error("Listener error");
      const faultyCallback = vi.fn(() => {
        throw error;
      });
      const channel = "testChannel";
      const payload: HubPayload = { data: "testData" };

      hubInstance.listen(channel, faultyCallback);
      hubInstance.dispatch(channel, payload);

      expect(faultyCallback).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("_toListeners error:", error);
    });

    test("should catch errors in dispatch method and log dispatch error", () => {
      const error = new Error("Listener error");
      const faultyCallback = vi.fn(() => {
        throw error;
      });
      const channel = "testChannel";
      const payload: HubPayload = { data: "testData" };

      vi.spyOn(hubInstance as any, "_toListeners").mockImplementation(() => {
        throw error;
      });

      hubInstance.dispatch(channel, payload);
      expect(console.log).toHaveBeenCalledWith("dispatch error:", error);
    });
  });

  describe("_remove", () => {
    test("should remove a listener from a channel", () => {
      const callback = vi.fn();
      const channel = "testChannel";

      const removeListener = hubInstance.listen(channel, callback);

      let listeners = (hubInstance as any).listeners.get(channel) as Listener[];
      expect(listeners.length).toBe(1);

      removeListener();

      listeners = (hubInstance as any).listeners.get(channel) as Listener[];
      expect(listeners.length).toBe(0);
    });

    test("should handle removing a listener from a channel with no listeners", () => {
      const callback = vi.fn();
      const channel = "testChannel";

      (hubInstance as any).listeners.set(channel, []);

      // @ts-expect-error Accessing private method for testing
      hubInstance._remove(channel, callback);

      expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining("No listeners for"));
    });

    test("should log message when removing from a channel with undefined listeners", () => {
      const callback = vi.fn();
      const channel = "testChannel";

      // Ensure there are no listeners for the channel
      (hubInstance as any).listeners.delete(channel);

      // @ts-expect-error Accessing private method for testing
      hubInstance._remove(channel, callback);

      expect(console.log).toHaveBeenCalledWith(`No listeners for ${channel}`);
    });
  });

  describe("_toListeners", () => {
    test("should call all listeners for a channel", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const channel = "testChannel";
      const payload: HubPayload = { data: "testData" };

      hubInstance.listen(channel, callback1);
      hubInstance.listen(channel, callback2);

      // @ts-expect-error Accessing private method for testing
      hubInstance._toListeners({
        channel,
        payload,
        patternInfo: [],
      });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test("should handle when there are no listeners for a channel", () => {
      const channel = "testChannel";
      (hubInstance as any).listeners.delete(channel);

      expect(() => {
        // @ts-expect-error Accessing private method for testing
        hubInstance._toListeners({
          channel,
          payload: {},
          patternInfo: [],
        });
      }).not.toThrow();
    });

    test("should catch errors from listener callbacks and log them", () => {
      const error = new Error("Listener callback error");
      const faultyCallback = vi.fn(() => {
        throw error;
      });
      const channel = "testChannel";
      const payload: HubPayload = { data: "testData" };

      hubInstance.listen(channel, faultyCallback);

      // @ts-expect-error Accessing private method for testing
      hubInstance._toListeners({
        channel,
        payload,
        patternInfo: [],
      });

      expect(faultyCallback).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("_toListeners error:", error);
    });
  });
});
