import ElectrumClient from 'electrum-client-browser';

type ElectrumClientInternals = ElectrumClient & {
  status: number;
  client: { connect: () => Promise<void> };
  persistencePolicy?: { maxRetry: number; callback: (() => void) | null };
  timeLastCall: number;
};

// Long enough for a slow network, short enough that a stalled socket does not
// hold back every call waiting on it.
const RECONNECT_TIMEOUT_MS = 15_000;

export default class FiroElectrumClient extends ElectrumClient {
  #clientName?: string;
  #protocolVersion?: string;
  #reconnecting: Promise<void> | null = null;

  async connect(
    clientName?: string,
    electrumProtocolVersion?: string,
    persistencePolicy?: { maxRetry: number; callback: (() => void) | null },
  ): Promise<void> {
    const self = this as unknown as ElectrumClientInternals;
    this.#clientName = clientName;
    this.#protocolVersion = electrumProtocolVersion;
    self.persistencePolicy = persistencePolicy ?? {
      maxRetry: 10,
      callback: null,
    };
    self.timeLastCall = 0;

    if (self.status !== 0) {
      return;
    }

    try {
      self.status = 1;
      await self.client.connect();

      if (clientName && electrumProtocolVersion) {
        // Sent past request() below, which waits for this same reconnect.
        const version = await super.request('server.version', [
          clientName,
          electrumProtocolVersion,
        ]);
        console.log(`Negotiated version: [${version}]`);
      }
    } catch (err) {
      self.status = 0;
      throw new Error(`failed to connect to electrum server: [${err}]`);
    }

    await this.keepAlive();
  }

  async request(method: string, params: any[]): Promise<any> {
    const self = this as unknown as ElectrumClientInternals;
    // The library never reopens a closed socket (server timeout, network
    // change, sleep), so every call after a drop failed until the popup was
    // reopened. Reconnect once here; calls made meanwhile wait for it.
    if (!this.#reconnecting && self.status === 0) {
      this.#reconnecting = this.#reconnect().finally(() => {
        this.#reconnecting = null;
      });
    }
    if (this.#reconnecting) await this.#reconnecting;
    return super.request(method, params);
  }

  async #reconnect(): Promise<void> {
    // A socket that never opens or closes would leave the waiting calls
    // hanging; closing it makes connect fail like any other drop.
    const timer = setTimeout(() => this.close(), RECONNECT_TIMEOUT_MS);
    try {
      await this.connect(this.#clientName, this.#protocolVersion);
    } finally {
      clearTimeout(timer);
    }
  }
}
