import UntypedEventEmitter2 from "eventemitter2";
import type {
  OnOptions,
  WaitForOptions,
  ListenToOptions,
  CancelablePromise,
  GeneralEventEmitter,
  ConstructorOptions,
} from "eventemitter2";

export default class EventEmitter2<Events extends Record<string, any[]>> {
  private emitter: UntypedEventEmitter2;

  constructor(options?: ConstructorOptions) {
    if (!options) {
      this.emitter = new UntypedEventEmitter2({
        wildcard: true,
        delimiter: ".",
        maxListeners: 10,
        newListener: true,
        removeListener: true,
      });
    } else {
      this.emitter = new UntypedEventEmitter2(options);
    }
  }

  addListener<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): this {
    this.emitter.addListener(event as string, listener);
    return this;
  }

  on<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void,
    options?: boolean | OnOptions
  ): this {
    this.emitter.on(event as string, listener, options);
    return this;
  }

  once<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void,
    options?: true | OnOptions
  ): this {
    this.emitter.once(event as string, listener, options);
    return this;
  }

  many<E extends keyof Events>(
    event: E,
    timesToListen: number,
    listener: (...args: Events[E]) => void,
    options?: boolean | OnOptions
  ): this {
    this.emitter.many(event as string, timesToListen, listener, options);
    return this;
  }

  removeListener<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): this {
    this.emitter.removeListener(event as string, listener);
    return this;
  }

  off<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): this {
    this.emitter.off(event as string, listener);
    return this;
  }

  removeAllListeners<E extends keyof Events>(event?: E): this {
    this.emitter.removeAllListeners(event as string);
    return this;
  }

  setMaxListeners(n: number): this {
    this.emitter.setMaxListeners(n);
    return this;
  }

  getMaxListeners(): number {
    return this.emitter.getMaxListeners();
  }

  listeners<E extends keyof Events>(
    event: E
  ): Array<(...args: Events[E]) => void> {
    return this.emitter.listeners(event as string) as Array<
      (...args: Events[E]) => void
    >;
  }

  listenersAny(): Array<(...args: any[]) => void> {
    return this.emitter.listenersAny();
  }

  emit<E extends keyof Events>(event: E, ...args: Events[E]): boolean {
    return this.emitter.emit(event as string, ...args);
  }

  emitAsync<E extends keyof Events>(
    event: E,
    ...args: Events[E]
  ): Promise<any[]> {
    return this.emitter.emitAsync(event as string, ...args);
  }

  listenerCount<E extends keyof Events>(event?: E): number {
    return this.emitter.listenerCount(event as string);
  }

  prependListener<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void,
    options?: boolean | OnOptions
  ): this {
    this.emitter.prependListener(event as string, listener, options);
    return this;
  }

  prependOnceListener<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void,
    options?: boolean | OnOptions
  ): this {
    this.emitter.prependOnceListener(event as string, listener, options);
    return this;
  }

  prependMany<E extends keyof Events>(
    event: E,
    timesToListen: number,
    listener: (...args: Events[E]) => void,
    options?: boolean | OnOptions
  ): this {
    this.emitter.prependMany(event as string, timesToListen, listener, options);
    return this;
  }

  eventNames(nsAsArray?: boolean): Array<keyof Events> {
    return this.emitter.eventNames(nsAsArray) as Array<keyof Events>;
  }
  waitFor<E extends keyof Events>(
    event: E,
    timeout?: number | WaitForOptions
  ): CancelablePromise<Events[E]> {
    return this.emitter.waitFor(
      event as string,
      timeout as WaitForOptions
    ) as CancelablePromise<Events[E]>;
  }

  listenTo(
    target: GeneralEventEmitter,
    events: keyof Events | Array<keyof Events>,
    options?: ListenToOptions
  ): this {
    this.emitter.listenTo(target, events as string | string[], options);
    return this;
  }

  stopListeningTo(target?: GeneralEventEmitter, event?: keyof Events): boolean {
    return this.emitter.stopListeningTo(target, event as string) as boolean;
  }

  hasListeners(event?: keyof Events): boolean {
    return this.emitter.hasListeners(event as string) as boolean;
  }
}
