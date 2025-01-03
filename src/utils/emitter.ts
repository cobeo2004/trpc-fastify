import EventEmitter from "./event-emitter";
import EventEmitter2 from "./event-emitter-2";

interface IEventEmitterService<
  TEventName extends string,
  TFunction extends Array<unknown>,
  TEvent extends Record<TEventName, TFunction> = Record<TEventName, TFunction>,
  TEventEmitter extends EventEmitter<TEvent> | EventEmitter2<TEvent> = any
> {
  getEmitter(): TEventEmitter;
}

// Replaceable with Redis pub/sub
export class EventEmitter2Service<
  TEventName extends string,
  TFunction extends Array<unknown>,
  TEvent extends Record<TEventName, TFunction> = Record<TEventName, TFunction>
> implements IEventEmitterService<TEventName, TFunction, TEvent>
{
  private emitter: EventEmitter2<TEvent> | undefined;

  public getEmitter(): EventEmitter2<TEvent> {
    if (!this.emitter) {
      this.emitter = new EventEmitter2<TEvent>();
    }
    return this.emitter;
  }
}

export class EventEmitterService<
  TEventName extends string,
  TFunction extends Array<unknown>,
  TEvent extends Record<TEventName, TFunction> = Record<TEventName, TFunction>
> implements IEventEmitterService<TEventName, TFunction, TEvent>
{
  private emitter: EventEmitter<TEvent> | undefined;

  public getEmitter(): EventEmitter<TEvent> {
    if (!this.emitter) {
      this.emitter = new EventEmitter<TEvent>();
    }
    return this.emitter;
  }
}
