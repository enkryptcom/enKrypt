import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const base = vi.hoisted(() => ({
  request: vi.fn(),
  socketConnect: vi.fn(),
  close: vi.fn(),
}));

// Stands in for electrum-client-browser: status 0 means the socket is closed,
// and request() fails then, like the library does.
vi.mock('electrum-client-browser', () => ({
  default: class {
    status = 0;
    client = { connect: () => base.socketConnect() };

    request(method: string, params: unknown[]) {
      if (this.status === 0) throw new Error('connection not established');
      return base.request(method, params);
    }

    keepAlive() {
      return Promise.resolve();
    }

    close() {
      base.close();
      this.status = 0;
    }
  },
}));

import FiroElectrumClient from '../firo-electrum-client';

type Status = { status: number };

const connectedClient = async () => {
  const client = new FiroElectrumClient('host', 50004, 'wss');
  await client.connect('enkrypt', '1.4');
  base.request.mockClear();
  base.socketConnect.mockClear();
  return client;
};

const dropConnection = (client: FiroElectrumClient) => {
  (client as unknown as Status).status = 0;
};

const sentMethods = () => base.request.mock.calls.map(([method]) => method);

describe('FiroElectrumClient reconnect', () => {
  beforeEach(() => {
    base.request.mockReset().mockResolvedValue('ok');
    base.socketConnect.mockReset().mockResolvedValue(undefined);
    base.close.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sends straight through while connected', async () => {
    const client = await connectedClient();

    await expect(client.request('blockchain.test', [])).resolves.toBe('ok');

    expect(base.socketConnect).not.toHaveBeenCalled();
    expect(sentMethods()).toEqual(['blockchain.test']);
  });

  it('reconnects with the same version after the socket closed', async () => {
    const client = await connectedClient();
    dropConnection(client);

    await expect(client.request('blockchain.test', [1])).resolves.toBe('ok');

    expect(base.socketConnect).toHaveBeenCalledTimes(1);
    expect(base.request.mock.calls).toEqual([
      ['server.version', ['enkrypt', '1.4']],
      ['blockchain.test', [1]],
    ]);
  });

  it('shares one reconnect between calls made at the same time', async () => {
    const client = await connectedClient();
    dropConnection(client);

    await Promise.all([
      client.request('a', []),
      client.request('b', []),
      client.request('c', []),
    ]);

    expect(base.socketConnect).toHaveBeenCalledTimes(1);
    expect(sentMethods()).toEqual(['server.version', 'a', 'b', 'c']);
  });

  it('fails the call when the reconnect fails and tries again on the next', async () => {
    const client = await connectedClient();
    dropConnection(client);
    base.socketConnect.mockRejectedValueOnce(new Error('offline'));

    await expect(client.request('a', [])).rejects.toThrow(
      'failed to connect to electrum server',
    );
    expect(sentMethods()).toEqual([]);

    await expect(client.request('b', [])).resolves.toBe('ok');
    expect(base.socketConnect).toHaveBeenCalledTimes(2);
    expect(sentMethods()).toEqual(['server.version', 'b']);
  });

  it('gives up on a reconnect that hangs', async () => {
    vi.useFakeTimers();
    const client = await connectedClient();
    dropConnection(client);
    // Like the real socket: closing it while it opens rejects the connect.
    base.socketConnect.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          base.close.mockImplementationOnce(() => reject(new Error('closed')));
        }),
    );

    const call = client.request('a', []);
    const failed = expect(call).rejects.toThrow(
      'failed to connect to electrum server',
    );
    await vi.advanceTimersByTimeAsync(15_000);
    await failed;

    expect(base.close).toHaveBeenCalledTimes(1);
    expect(sentMethods()).toEqual([]);
  });

  it('does not retry a request that failed', async () => {
    const client = await connectedClient();
    base.request.mockRejectedValueOnce(new Error('close connect'));

    await expect(client.request('a', [])).rejects.toThrow('close connect');

    expect(base.request).toHaveBeenCalledTimes(1);
    expect(base.socketConnect).not.toHaveBeenCalled();
  });
});
