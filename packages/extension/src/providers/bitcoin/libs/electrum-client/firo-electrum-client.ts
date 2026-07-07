import ElectrumClient from 'electrum-client-browser';

type ElectrumClientInternals = ElectrumClient & {
  status: number;
  client: { connect: () => Promise<void> };
  persistencePolicy?: { maxRetry: number; callback: (() => void) | null };
  timeLastCall: number;
};


export default class FiroElectrumClient extends ElectrumClient {
  async connect(
    clientName?: string,
    electrumProtocolVersion?: string,
    persistencePolicy?: { maxRetry: number; callback: (() => void) | null },
  ): Promise<void> {
    const self = this as unknown as ElectrumClientInternals;
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
        const version = await this.server_version(
          clientName,
          electrumProtocolVersion,
        );
        console.log(`Negotiated version: [${version}]`);
      }
    } catch (err) {
      self.status = 0;
      throw new Error(`failed to connect to electrum server: [${err}]`);
    }

    await this.keepAlive();
  }
}
