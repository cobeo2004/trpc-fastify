import EventEmitter2 from "./event-emitter-2";

// Replaceable with Redis pub/sub
export class EventEmitter2Service<
  TEventName extends string,
  TFunction extends Array<unknown>,
  TEvent extends Record<TEventName, TFunction> = Record<TEventName, TFunction>
> {
  private emitter: EventEmitter2<TEvent> | undefined;

  public getEmitter(): EventEmitter2<TEvent> {
    if (!this.emitter) {
      this.emitter = new EventEmitter2();
    }
    return this.emitter;
  }
}
