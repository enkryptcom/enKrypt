// let port = chrome.runtime.connect({ name: "trezor-connect" });
// port.onMessage.addListener((message) => {
//   window.postMessage(message, window.location.origin);
// });
// port.onDisconnect.addListener((d) => {
//   port = null;
// });

// /*
// Passing messages from popup to background script
// */

// window.addEventListener("message", (event) => {
//   if (port && event.source === window && event.data) {
//     port.postMessage({ data: event.data });
//   }
// });

/******/ ;(() => {
  // webpackBootstrap
  /******/ 'use strict'
  /******/ var __webpack_modules__ = {
    /***/ 46: /***/ module => {
      // Copyright Joyent, Inc. and other Node contributors.
      //
      // Permission is hereby granted, free of charge, to any person obtaining a
      // copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to permit
      // persons to whom the Software is furnished to do so, subject to the
      // following conditions:
      //
      // The above copyright notice and this permission notice shall be included
      // in all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
      // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
      // USE OR OTHER DEALINGS IN THE SOFTWARE.

      var R = typeof Reflect === 'object' ? Reflect : null
      var ReflectApply =
        R && typeof R.apply === 'function'
          ? R.apply
          : function ReflectApply(target, receiver, args) {
              return Function.prototype.apply.call(target, receiver, args)
            }

      var ReflectOwnKeys
      if (R && typeof R.ownKeys === 'function') {
        ReflectOwnKeys = R.ownKeys
      } else if (Object.getOwnPropertySymbols) {
        ReflectOwnKeys = function ReflectOwnKeys(target) {
          return Object.getOwnPropertyNames(target).concat(
            Object.getOwnPropertySymbols(target),
          )
        }
      } else {
        ReflectOwnKeys = function ReflectOwnKeys(target) {
          return Object.getOwnPropertyNames(target)
        }
      }

      function ProcessEmitWarning(warning) {
        if (console && console.warn) console.warn(warning)
      }

      var NumberIsNaN =
        Number.isNaN ||
        function NumberIsNaN(value) {
          return value !== value
        }

      function EventEmitter() {
        EventEmitter.init.call(this)
      }
      module.exports = EventEmitter
      module.exports.once = once

      // Backwards-compat with node 0.10.x
      EventEmitter.EventEmitter = EventEmitter

      EventEmitter.prototype._events = undefined
      EventEmitter.prototype._eventsCount = 0
      EventEmitter.prototype._maxListeners = undefined

      // By default EventEmitters will print a warning if more than 10 listeners are
      // added to it. This is a useful default which helps finding memory leaks.
      var defaultMaxListeners = 10

      function checkListener(listener) {
        if (typeof listener !== 'function') {
          throw new TypeError(
            'The "listener" argument must be of type Function. Received type ' +
              typeof listener,
          )
        }
      }

      Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
        enumerable: true,
        get: function () {
          return defaultMaxListeners
        },
        set: function (arg) {
          if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
            throw new RangeError(
              'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
                arg +
                '.',
            )
          }
          defaultMaxListeners = arg
        },
      })

      EventEmitter.init = function () {
        if (
          this._events === undefined ||
          this._events === Object.getPrototypeOf(this)._events
        ) {
          this._events = Object.create(null)
          this._eventsCount = 0
        }

        this._maxListeners = this._maxListeners || undefined
      }

      // Obviously not all Emitters should be limited to 10. This function allows
      // that to be increased. Set to zero for unlimited.
      EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
        if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
          throw new RangeError(
            'The value of "n" is out of range. It must be a non-negative number. Received ' +
              n +
              '.',
          )
        }
        this._maxListeners = n
        return this
      }

      function _getMaxListeners(that) {
        if (that._maxListeners === undefined)
          return EventEmitter.defaultMaxListeners
        return that._maxListeners
      }

      EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
        return _getMaxListeners(this)
      }

      EventEmitter.prototype.emit = function emit(type) {
        var args = []
        for (var i = 1; i < arguments.length; i++) args.push(arguments[i])
        var doError = type === 'error'

        var events = this._events
        if (events !== undefined)
          doError = doError && events.error === undefined
        else if (!doError) return false

        // If there is no 'error' event listener then throw.
        if (doError) {
          var er
          if (args.length > 0) er = args[0]
          if (er instanceof Error) {
            // Note: The comments on the `throw` lines are intentional, they show
            // up in Node's output if this results in an unhandled exception.
            throw er // Unhandled 'error' event
          }
          // At least give some kind of context to the user
          var err = new Error(
            'Unhandled error.' + (er ? ' (' + er.message + ')' : ''),
          )
          err.context = er
          throw err // Unhandled 'error' event
        }

        var handler = events[type]

        if (handler === undefined) return false

        if (typeof handler === 'function') {
          ReflectApply(handler, this, args)
        } else {
          var len = handler.length
          var listeners = arrayClone(handler, len)
          for (var i = 0; i < len; ++i) ReflectApply(listeners[i], this, args)
        }

        return true
      }

      function _addListener(target, type, listener, prepend) {
        var m
        var events
        var existing

        checkListener(listener)

        events = target._events
        if (events === undefined) {
          events = target._events = Object.create(null)
          target._eventsCount = 0
        } else {
          // To avoid recursion in the case that type === "newListener"! Before
          // adding it to the listeners, first emit "newListener".
          if (events.newListener !== undefined) {
            target.emit(
              'newListener',
              type,
              listener.listener ? listener.listener : listener,
            )

            // Re-assign `events` because a newListener handler could have caused the
            // this._events to be assigned to a new object
            events = target._events
          }
          existing = events[type]
        }

        if (existing === undefined) {
          // Optimize the case of one listener. Don't need the extra array object.
          existing = events[type] = listener
          ++target._eventsCount
        } else {
          if (typeof existing === 'function') {
            // Adding the second element, need to change to array.
            existing = events[type] = prepend
              ? [listener, existing]
              : [existing, listener]
            // If we've already got an array, just append.
          } else if (prepend) {
            existing.unshift(listener)
          } else {
            existing.push(listener)
          }

          // Check for listener leak
          m = _getMaxListeners(target)
          if (m > 0 && existing.length > m && !existing.warned) {
            existing.warned = true
            // No error code for this since it is a Warning

            var w = new Error(
              'Possible EventEmitter memory leak detected. ' +
                existing.length +
                ' ' +
                String(type) +
                ' listeners ' +
                'added. Use emitter.setMaxListeners() to ' +
                'increase limit',
            )
            w.name = 'MaxListenersExceededWarning'
            w.emitter = target
            w.type = type
            w.count = existing.length
            ProcessEmitWarning(w)
          }
        }

        return target
      }

      EventEmitter.prototype.addListener = function addListener(
        type,
        listener,
      ) {
        return _addListener(this, type, listener, false)
      }

      EventEmitter.prototype.on = EventEmitter.prototype.addListener

      EventEmitter.prototype.prependListener = function prependListener(
        type,
        listener,
      ) {
        return _addListener(this, type, listener, true)
      }

      function onceWrapper() {
        if (!this.fired) {
          this.target.removeListener(this.type, this.wrapFn)
          this.fired = true
          if (arguments.length === 0) return this.listener.call(this.target)
          return this.listener.apply(this.target, arguments)
        }
      }

      function _onceWrap(target, type, listener) {
        var state = {
          fired: false,
          wrapFn: undefined,
          target: target,
          type: type,
          listener: listener,
        }
        var wrapped = onceWrapper.bind(state)
        wrapped.listener = listener
        state.wrapFn = wrapped
        return wrapped
      }

      EventEmitter.prototype.once = function once(type, listener) {
        checkListener(listener)
        this.on(type, _onceWrap(this, type, listener))
        return this
      }

      EventEmitter.prototype.prependOnceListener = function prependOnceListener(
        type,
        listener,
      ) {
        checkListener(listener)
        this.prependListener(type, _onceWrap(this, type, listener))
        return this
      }

      // Emits a 'removeListener' event if and only if the listener was removed.
      EventEmitter.prototype.removeListener = function removeListener(
        type,
        listener,
      ) {
        var list, events, position, i, originalListener

        checkListener(listener)

        events = this._events
        if (events === undefined) return this

        list = events[type]
        if (list === undefined) return this

        if (list === listener || list.listener === listener) {
          if (--this._eventsCount === 0) this._events = Object.create(null)
          else {
            delete events[type]
            if (events.removeListener)
              this.emit('removeListener', type, list.listener || listener)
          }
        } else if (typeof list !== 'function') {
          position = -1

          for (i = list.length - 1; i >= 0; i--) {
            if (list[i] === listener || list[i].listener === listener) {
              originalListener = list[i].listener
              position = i
              break
            }
          }

          if (position < 0) return this

          if (position === 0) list.shift()
          else {
            spliceOne(list, position)
          }

          if (list.length === 1) events[type] = list[0]

          if (events.removeListener !== undefined)
            this.emit('removeListener', type, originalListener || listener)
        }

        return this
      }

      EventEmitter.prototype.off = EventEmitter.prototype.removeListener

      EventEmitter.prototype.removeAllListeners = function removeAllListeners(
        type,
      ) {
        var listeners, events, i

        events = this._events
        if (events === undefined) return this

        // not listening for removeListener, no need to emit
        if (events.removeListener === undefined) {
          if (arguments.length === 0) {
            this._events = Object.create(null)
            this._eventsCount = 0
          } else if (events[type] !== undefined) {
            if (--this._eventsCount === 0) this._events = Object.create(null)
            else delete events[type]
          }
          return this
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = Object.keys(events)
          var key
          for (i = 0; i < keys.length; ++i) {
            key = keys[i]
            if (key === 'removeListener') continue
            this.removeAllListeners(key)
          }
          this.removeAllListeners('removeListener')
          this._events = Object.create(null)
          this._eventsCount = 0
          return this
        }

        listeners = events[type]

        if (typeof listeners === 'function') {
          this.removeListener(type, listeners)
        } else if (listeners !== undefined) {
          // LIFO order
          for (i = listeners.length - 1; i >= 0; i--) {
            this.removeListener(type, listeners[i])
          }
        }

        return this
      }

      function _listeners(target, type, unwrap) {
        var events = target._events

        if (events === undefined) return []

        var evlistener = events[type]
        if (evlistener === undefined) return []

        if (typeof evlistener === 'function')
          return unwrap ? [evlistener.listener || evlistener] : [evlistener]

        return unwrap
          ? unwrapListeners(evlistener)
          : arrayClone(evlistener, evlistener.length)
      }

      EventEmitter.prototype.listeners = function listeners(type) {
        return _listeners(this, type, true)
      }

      EventEmitter.prototype.rawListeners = function rawListeners(type) {
        return _listeners(this, type, false)
      }

      EventEmitter.listenerCount = function (emitter, type) {
        if (typeof emitter.listenerCount === 'function') {
          return emitter.listenerCount(type)
        } else {
          return listenerCount.call(emitter, type)
        }
      }

      EventEmitter.prototype.listenerCount = listenerCount
      function listenerCount(type) {
        var events = this._events

        if (events !== undefined) {
          var evlistener = events[type]

          if (typeof evlistener === 'function') {
            return 1
          } else if (evlistener !== undefined) {
            return evlistener.length
          }
        }

        return 0
      }

      EventEmitter.prototype.eventNames = function eventNames() {
        return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : []
      }

      function arrayClone(arr, n) {
        var copy = new Array(n)
        for (var i = 0; i < n; ++i) copy[i] = arr[i]
        return copy
      }

      function spliceOne(list, index) {
        for (; index + 1 < list.length; index++) list[index] = list[index + 1]
        list.pop()
      }

      function unwrapListeners(arr) {
        var ret = new Array(arr.length)
        for (var i = 0; i < ret.length; ++i) {
          ret[i] = arr[i].listener || arr[i]
        }
        return ret
      }

      function once(emitter, name) {
        return new Promise(function (resolve, reject) {
          function errorListener(err) {
            emitter.removeListener(name, resolver)
            reject(err)
          }

          function resolver() {
            if (typeof emitter.removeListener === 'function') {
              emitter.removeListener('error', errorListener)
            }
            resolve([].slice.call(arguments))
          }

          eventTargetAgnosticAddListener(emitter, name, resolver, {
            once: true,
          })
          if (name !== 'error') {
            addErrorHandlerIfEventEmitter(emitter, errorListener, {
              once: true,
            })
          }
        })
      }

      function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
        if (typeof emitter.on === 'function') {
          eventTargetAgnosticAddListener(emitter, 'error', handler, flags)
        }
      }

      function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
        if (typeof emitter.on === 'function') {
          if (flags.once) {
            emitter.once(name, listener)
          } else {
            emitter.on(name, listener)
          }
        } else if (typeof emitter.addEventListener === 'function') {
          // EventTarget does not have `error` event semantics like Node
          // EventEmitters, we do not listen for `error` events here.
          emitter.addEventListener(name, function wrapListener(arg) {
            // IE does not have builtin `{ once: true }` support so we
            // have to do it manually.
            if (flags.once) {
              emitter.removeEventListener(name, wrapListener)
            }
            listener(arg)
          })
        } else {
          throw new TypeError(
            'The "emitter" argument must be of type EventEmitter. Received type ' +
              typeof emitter,
          )
        }
      }

      /***/
    },

    /******/
  }
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {}
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId]
    /******/ if (cachedModule !== undefined) {
      /******/ return cachedModule.exports
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/ exports: {},
      /******/
    })
    /******/
    /******/ // Execute the module function
    /******/ __webpack_modules__[moduleId](
      module,
      module.exports,
      __webpack_require__,
    )
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports
    /******/
  }
  /******/
  /************************************************************************/
  /******/ /* webpack/runtime/global */
  /******/ ;(() => {
    /******/ __webpack_require__.g = (function () {
      /******/ if (typeof globalThis === 'object') return globalThis
      /******/ try {
        /******/ return this || new Function('return this')()
        /******/
      } catch (e) {
        /******/ if (typeof window === 'object') return window
        /******/
      }
      /******/
    })()
    /******/
  })()
  /******/
  /************************************************************************/

  // EXTERNAL MODULE: ../../node_modules/events/events.js
  var events = __webpack_require__(46) // CONCATENATED MODULE: ../utils/src/typedEventEmitter.ts
  /*
Usage example:
type EventMap = {
    obj: { id: string };
    primitive: boolean | number | string | symbol;
    noArgs: undefined;
    multipleArgs: (a: number, b: string, c: boolean) => void;
    [type: `dynamic/${string}`]: boolean;
};
*/

  // NOTE: case 1. looks like case 4. but works differently. the order matters

  // 4. default

  class TypedEmitter extends events.EventEmitter {
    // implement at least one function
    listenerCount(eventName) {
      return super.listenerCount(eventName)
    }
  } // CONCATENATED MODULE: ../connect-common/src/storage.ts
  // https://github.com/trezor/connect/blob/develop/src/js/storage/index.js

  const storageVersion = 2
  const storageName = `storage_v${storageVersion}`

  /**
   * remembered:
   *  - physical device from webusb pairing dialogue
   *  - passphrase to be used
   */

  // TODO: move storage somewhere else. Having it here brings couple of problems:
  // - We can not import types from connect (would cause cyclic dependency)
  // - it has here dependency on window object, not good

  const getEmptyState = () => ({
    origin: {},
  })
  let memoryStorage = getEmptyState()
  const getPermanentStorage = () => {
    const ls = localStorage.getItem(storageName)
    return ls ? JSON.parse(ls) : getEmptyState()
  }
  class Storage extends TypedEmitter {
    save(getNewState, temporary = false) {
      if (temporary || !__webpack_require__.g.window) {
        memoryStorage = getNewState(memoryStorage)
        return
      }
      try {
        const newState = getNewState(getPermanentStorage())
        localStorage.setItem(storageName, JSON.stringify(newState))
        this.emit('changed', newState)
      } catch (err) {
        // memory storage is fallback of the last resort
        console.warn('long term storage not available')
        memoryStorage = getNewState(memoryStorage)
      }
    }
    saveForOrigin(getNewState, origin, temporary = false) {
      this.save(
        state => ({
          ...state,
          origin: {
            ...state.origin,
            [origin]: getNewState(state.origin?.[origin] || {}),
          },
        }),
        temporary,
      )
    }
    load(temporary = false) {
      if (temporary || !__webpack_require__.g?.window?.localStorage) {
        return memoryStorage
      }
      try {
        return getPermanentStorage()
      } catch (err) {
        // memory storage is fallback of the last resort
        console.warn('long term storage not available')
        return memoryStorage
      }
    }
    loadForOrigin(origin, temporary = false) {
      const state = this.load(temporary)
      return state.origin?.[origin] || {}
    }
  }
  const storage = new Storage() // CONCATENATED MODULE: ../utils/src/createDeferred.ts

  // unwrap promise response from Deferred

  const createDeferred = id => {
    let localResolve = () => {}
    let localReject = () => {}
    const promise = new Promise((resolve, reject) => {
      localResolve = resolve
      localReject = reject
    })
    return {
      id,
      resolve: localResolve,
      reject: localReject,
      promise,
    }
  } // CONCATENATED MODULE: ../utils/src/scheduleAction.ts
  // Ignored when attempts is AttemptParams[]

  const isArray = attempts => Array.isArray(attempts)
  const abortedBySignal = () => new Error('Aborted by signal')
  const abortedByDeadline = () => new Error('Aborted by deadline')
  const abortedByTimeout = () => new Error('Aborted by timeout')
  const resolveAfterMs = (ms, clear) =>
    new Promise((resolve, reject) => {
      if (clear.aborted) return reject()
      if (ms === undefined) return resolve()
      let timeout
      const onClear = () => {
        clearTimeout(timeout)
        clear.removeEventListener('abort', onClear)
        reject()
      }
      timeout = setTimeout(() => {
        clear.removeEventListener('abort', onClear)
        resolve()
      }, ms)
      clear.addEventListener('abort', onClear)
    })
  const rejectAfterMs = (ms, reason, clear) =>
    new Promise((_, reject) => {
      if (clear.aborted) return reject()
      let timeout
      const onClear = () => {
        clearTimeout(timeout)
        clear.removeEventListener('abort', onClear)
        reject()
      }
      timeout = setTimeout(() => {
        clear.removeEventListener('abort', onClear)
        reject(reason())
      }, ms)
      clear.addEventListener('abort', onClear)
    })
  const maybeRejectAfterMs = (ms, reason, clear) =>
    ms === undefined ? [] : [rejectAfterMs(ms, reason, clear)]
  const rejectWhenAborted = (signal, clear) =>
    new Promise((_, reject) => {
      if (clear.aborted) return reject()
      if (signal?.aborted) return reject(abortedBySignal())
      const onAbort = () => reject(abortedBySignal())
      signal?.addEventListener('abort', onAbort)
      const onClear = () => {
        signal?.removeEventListener('abort', onAbort)
        clear.removeEventListener('abort', onClear)
        reject()
      }
      clear.addEventListener('abort', onClear)
    })
  const resolveAction = async (action, clear) => {
    const aborter = new AbortController()
    if (clear.aborted) aborter.abort()
    const onClear = () => {
      clear.removeEventListener('abort', onClear)
      aborter.abort()
    }
    clear.addEventListener('abort', onClear)
    try {
      return await new Promise(resolve => resolve(action(aborter.signal)))
    } finally {
      if (!clear.aborted) clear.removeEventListener('abort', onClear)
    }
  }
  const attemptLoop = async (attempts, attempt, failure, clear) => {
    // Tries only (attempts - 1) times, because the last attempt throws its error
    for (let a = 0; a < attempts - 1; a++) {
      if (clear.aborted) break
      const aborter = new AbortController()
      const onClear = () => aborter.abort()
      clear.addEventListener('abort', onClear)
      try {
        return await attempt(a, aborter.signal)
      } catch (error) {
        onClear()
        await failure(a, error)
      } finally {
        clear.removeEventListener('abort', onClear)
      }
    }
    return clear.aborted ? Promise.reject() : attempt(attempts - 1, clear)
  }
  const scheduleAction = async (action, params) => {
    const {
      signal,
      delay,
      attempts,
      timeout,
      deadline,
      gap,
      attemptFailureHandler,
    } = params
    const deadlineMs = deadline && deadline - Date.now()
    const attemptCount = isArray(attempts)
      ? attempts.length
      : (attempts ?? (deadline ? Infinity : 1))
    const clearAborter = new AbortController()
    const clear = clearAborter.signal
    const getParams = isArray(attempts)
      ? attempt => attempts[attempt]
      : () => ({
          timeout,
          gap,
        })
    try {
      return await Promise.race([
        rejectWhenAborted(signal, clear),
        ...maybeRejectAfterMs(deadlineMs, abortedByDeadline, clear),
        resolveAfterMs(delay, clear).then(() =>
          attemptLoop(
            attemptCount,
            (attempt, abort) =>
              Promise.race([
                ...maybeRejectAfterMs(
                  getParams(attempt).timeout,
                  abortedByTimeout,
                  clear,
                ),
                resolveAction(action, abort),
              ]),
            (attempt, error) => {
              const errorHandlerResult = attemptFailureHandler?.(error)
              return errorHandlerResult
                ? Promise.reject(errorHandlerResult)
                : resolveAfterMs(getParams(attempt).gap ?? 0, clear)
            },
            clear,
          ),
        ),
      ])
    } finally {
      clearAborter.abort()
    }
  } // CONCATENATED MODULE: ../connect-common/src/messageChannel/abstract.ts
  /**
   * IMPORTS WARNING
   * this file is bundled into content script so be careful what you are importing not to bloat the bundle
   */

  // TODO: so logger should be probably moved to connect common, or this file should be moved to connect
  // import type { Log } from '@trezor/connect/src/utils/debug';

  /**
   * concepts:
   * - it handshakes automatically with the other side of the channel
   * - it queues messages fired before handshake and sends them after handshake is done
   */
  class AbstractMessageChannel extends TypedEmitter {
    messagePromises = {}
    /** queue of messages that were scheduled before handshake */
    messagesQueue = []
    messageID = 0
    isConnected = false
    handshakeMaxRetries = 5
    handshakeRetryInterval = 2000

    /**
     * function that passes data to the other side of the channel
     */

    /**
     * channel identifiers that pairs AbstractMessageChannel instances on sending and receiving end together
     */

    constructor({
      sendFn,
      channel,
      logger,
      lazyHandshake = false,
      legacyMode = false,
    }) {
      super()
      this.channel = channel
      this.sendFn = sendFn
      this.lazyHandshake = lazyHandshake
      this.legacyMode = legacyMode
      this.logger = logger
    }

    /**
     * initiates handshake sequence with peer. resolves after communication with peer is established
     */
    init() {
      if (!this.handshakeFinished) {
        this.handshakeFinished = createDeferred()
        if (this.legacyMode) {
          // Bypass handshake for communication with legacy components
          // We add a delay for enough time for the other side to be ready
          setTimeout(() => {
            this.handshakeFinished?.resolve()
          }, 500)
        }
        if (!this.lazyHandshake) {
          // When `lazyHandshake` handshakeWithPeer will start when received channel-handshake-request.
          this.handshakeWithPeer()
        }
      }
      return this.handshakeFinished.promise
    }

    /**
     * handshake between both parties of the channel.
     * both parties initiate handshake procedure and keep asking over time in a loop until they time out or receive confirmation from peer
     */
    handshakeWithPeer() {
      this.logger?.log(this.channel.here, 'handshake')
      return scheduleAction(
        async () => {
          this.postMessage(
            {
              type: 'channel-handshake-request',
              data: {
                success: true,
                payload: undefined,
              },
            },
            {
              usePromise: false,
              useQueue: false,
            },
          )
          await this.handshakeFinished?.promise
        },
        {
          attempts: this.handshakeMaxRetries,
          timeout: this.handshakeRetryInterval,
        },
      )
        .then(() => {
          this.logger?.log(this.channel.here, 'handshake confirmed')
          this.messagesQueue.forEach(message => {
            message.channel = this.channel
            this.sendFn(message)
          })
          this.messagesQueue = []
        })
        .catch(() => {
          this.handshakeFinished?.reject(new Error('handshake failed'))
          this.handshakeFinished = undefined
        })
    }

    /**
     * message received from communication channel in descendants of this class
     * should be handled by this common onMessage method
     */
    onMessage(_message) {
      // Older code used to send message as a data property of the message object.
      // This is a workaround to keep backward compatibility.
      let message = _message
      if (
        this.legacyMode &&
        message.type === undefined &&
        'data' in message &&
        typeof message.data === 'object' &&
        message.data !== null &&
        'type' in message.data &&
        typeof message.data.type === 'string'
      ) {
        // @ts-expect-error
        message = message.data
      }
      const { channel, id, type, payload, success } = message

      // Don't verify channel in legacy mode
      if (!this.legacyMode) {
        if (!channel?.peer || channel.peer !== this.channel.here) {
          // To wrong peer
          return
        }
        if (!channel?.here || this.channel.peer !== channel.here) {
          // From wrong peer
          return
        }
      }
      if (type === 'channel-handshake-request') {
        this.postMessage(
          {
            type: 'channel-handshake-confirm',
            data: {
              success: true,
              payload: undefined,
            },
          },
          {
            usePromise: false,
            useQueue: false,
          },
        )
        if (this.lazyHandshake) {
          // When received channel-handshake-request in lazyHandshake mode we start from this side.
          this.handshakeWithPeer()
        }
        return
      }
      if (type === 'channel-handshake-confirm') {
        this.handshakeFinished?.resolve(undefined)
        return
      }
      if (this.messagePromises[id]) {
        this.messagePromises[id].resolve({
          id,
          payload,
          success,
        })
        delete this.messagePromises[id]
      }
      const messagePromisesLength = Object.keys(this.messagePromises).length
      if (messagePromisesLength > 5) {
        this.logger?.warn(
          `too many message promises (${messagePromisesLength}). this feels unexpected!`,
        )
      }

      // @ts-expect-error TS complains for odd reasons
      this.emit('message', message)
    }

    // todo: outgoing messages should be typed
    postMessage(message, { usePromise = true, useQueue = true } = {}) {
      message.channel = this.channel
      if (!usePromise) {
        try {
          this.sendFn(message)
        } catch (err) {
          if (useQueue) {
            this.messagesQueue.push(message)
          }
        }
        return
      }
      this.messageID++
      message.id = this.messageID
      this.messagePromises[message.id] = createDeferred()
      try {
        this.sendFn(message)
      } catch (err) {
        if (useQueue) {
          this.messagesQueue.push(message)
        }
      }
      return this.messagePromises[message.id].promise
    }
    resolveMessagePromises(resolvePayload) {
      // This is used when we know that the connection has been interrupted but there might be something waiting for it.
      Object.keys(this.messagePromises).forEach(id =>
        this.messagePromises[id].resolve({
          id,
          payload: resolvePayload,
        }),
      )
    }
    clear() {
      this.handshakeFinished = undefined
    }
  } // CONCATENATED MODULE: ../connect-common/src/index.ts // CONCATENATED MODULE: ../connect-web/src/channels/window-serviceworker.ts
  /**
   * Communication channel between:
   * - here: chrome message port (in service worker)
   * - peer: window.onMessage in trezor-content-script
   */

  class WindowServiceWorkerChannel extends AbstractMessageChannel {
    constructor({ name, channel }) {
      super({
        channel,
        sendFn: message => {
          if (!this.port) throw new Error('port not assigned')
          this.port.postMessage(message)
        },
      })
      const port = chrome.runtime.connect({
        name,
      })
      this.port = port
      this.connect()
    }
    connect() {
      this.port?.onMessage.addListener(message => {
        if (message.channel.here === this.channel.here) return
        this.onMessage(message)
      })
      this.isConnected = true
    }
    disconnect() {
      if (!this.isConnected) return
      this.port?.disconnect()
      this.isConnected = false
    }
  } // CONCATENATED MODULE: ../connect/src/events/popup.ts
  const POPUP = {
    // Message called from popup.html inline script before "window.onload" event. This is first message from popup to window.opener.
    BOOTSTRAP: 'popup-bootstrap',
    // Message from popup.js to window.opener, called after "window.onload" event. This is second message from popup to window.opener.
    LOADED: 'popup-loaded',
    // Message from popup run in "core" mode. Connect core has been loaded, popup is ready to handle messages
    // This is similar to IFRAME.LOADED message which signals the same but core is loaded in different context
    CORE_LOADED: 'popup-core-loaded',
    // Message from window.opener to popup.js. Send settings to popup. This is first message from window.opener to popup.
    INIT: 'popup-init',
    // Error message from popup to window.opener. Could be thrown during popup initialization process (POPUP.INIT)
    ERROR: 'popup-error',
    // Message to webextensions, opens "trezor-usb-permission.html" within webextension
    EXTENSION_USB_PERMISSIONS: 'open-usb-permissions',
    // Message called from both [popup > iframe] then [iframe > popup] in this exact order.
    // Firstly popup call iframe to resolve popup promise in Core
    // Then iframe reacts to POPUP.HANDSHAKE message and sends ConnectSettings, transport information and requested method details back to popup
    HANDSHAKE: 'popup-handshake',
    // Event emitted from PopupManager at the end of popup closing process.
    // Sent from popup thru window.opener to an iframe because message channel between popup and iframe is no longer available
    CLOSED: 'popup-closed',
    // Message called from iframe to popup, it means that popup will not be needed (example: Blockchain methods are not using popup at all)
    // This will close active popup window and/or clear opening process in PopupManager (maybe popup wasn't opened yet)
    CANCEL_POPUP_REQUEST: 'ui-cancel-popup-request',
    // Message called from inline element in popup.html (window.closeWindow), this is used only with webextensions to properly handle popup close event
    CLOSE_WINDOW: 'window.close',
    // todo: shouldn't it be UI_RESPONSE?
    ANALYTICS_RESPONSE: 'popup-analytics-response',
    /** webextension injected content script and content script notified popup */
    CONTENT_SCRIPT_LOADED: 'popup-content-script-loaded',
    /** method.info async getter result passed from core to popup */
    METHOD_INFO: 'popup-method-info',
  }
  const createPopupMessage = (type, payload) => ({
    event: UI_EVENT,
    type,
    payload,
  }) // CONCATENATED MODULE: ../connect/src/data/version.ts
  const VERSION = '9.4.1'
  const versionN = VERSION.split('.').map(s => parseInt(s, 10))
  const isBeta = VERSION.includes('beta')
  const DEFAULT_DOMAIN =
    /* unused pure expression or super */ null &&
    (isBeta
      ? `https://connect.trezor.io/${VERSION}/`
      : `https://connect.trezor.io/${versionN[0]}/`)

  // Increment with content script changes
  const CONTENT_SCRIPT_VERSION = 1 // CONCATENATED MODULE: ./src/contentScript.ts
  function trezorContentScript() {
    // Check if extension ID matches the popup URL
    const urlParams = new URLSearchParams(window.location.search)
    const targetExtensionId = urlParams.get('extension-id')
    if (targetExtensionId && targetExtensionId !== chrome.runtime.id) {
      return
    }

    /**
     * communication between service worker and both webextension and popup manager
     */
    const channel = new WindowServiceWorkerChannel({
      name: 'trezor-connect',
      channel: {
        here: '@trezor/connect-content-script',
        peer: '@trezor/connect-webextension',
      },
    })

    /**
     * messages that were sent before the channel was initialized
     */
    const messagesQueue = []
    let channelReady = false

    /**
     * Firefox enforces some restrictions on the content script that force us to use clones of objects when passing them between the content script and the background script
     */
    function clone(obj) {
      return JSON.parse(JSON.stringify(obj))
    }

    /*
     * Passing messages from popup to service worker
     */
    window.addEventListener('message', event => {
      if (event.data?.channel?.here === '@trezor/connect-webextension') {
        return
      }
      if (event.data?.type === POPUP.LOADED) {
        window.postMessage(
          {
            type: POPUP.CONTENT_SCRIPT_LOADED,
            payload: {
              ...chrome.runtime.getManifest(),
              id: chrome.runtime.id,
              contentScriptVersion: CONTENT_SCRIPT_VERSION,
            },
          },
          window.location.origin,
        )
      }
      if (event.source === window && event.data) {
        if (channelReady) {
          channel.postMessage(clone(event.data), {
            usePromise: false,
          })
        } else {
          messagesQueue.push(event.data)
        }
      }
    })
    channel.init().then(() => {
      channelReady = true

      /**
       * Passing messages from service worker to popup
       */
      channel.on('message', message => {
        window.postMessage(clone(message), window.location.origin)
      })

      // Send messages that have gathered before the channel was initialized
      while (messagesQueue.length > 0) {
        const message = messagesQueue.shift()
        channel.postMessage(clone(message), {
          usePromise: false,
        })
      }
      window.addEventListener('beforeunload', () => {
        window.postMessage(
          {
            type: POPUP.CLOSED,
          },
          window.location.origin,
        )
      })
    })
  }
  trezorContentScript()
  /******/
})()
