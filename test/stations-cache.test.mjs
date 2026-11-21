import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/stations.js';

test('reuses a successful tank station lookup from cache', async () => {
  const previousKey = process.env.TANKERKOENIG_API_KEY;
  const previousFetch = globalThis.fetch;
  let calls = 0;
  process.env.TANKERKOENIG_API_KEY = 'test-key';
  globalThis.fetch = async url => {
    calls++;
    assert.equal(new URL(url).hostname, 'creativecommons.tankerkoenig.de');
    return {
      ok: true,
      async json() {
        return { ok: true, stations: [{
          id: 'station-1', name: 'Testtankstelle', brand: 'Test',
          street: 'Teststraße', houseNumber: '1', postCode: '76133',
          place: 'Karlsruhe', dist: 1.2, price: 1.65,
          isOpen: true, lat: 49.01, lng: 8.4
        }] };
      }
    };
  };

  async function lookup() {
    const response = {
      code: null, body: null, headers: {},
      status(code) { this.code = code; return this; },
      json(body) { this.body = body; return this; },
      setHeader(name, value) { this.headers[name] = value; }
    };
    await handler({
      method: 'GET',
      query: { lat: '49.01001', lng: '8.40001', radius: '3', fuel: 'diesel' }
    }, response);
    return response;
  }

  try {
    const first = await lookup();
    const second = await lookup();
    assert.equal(first.code, 200);
    assert.equal(second.code, 200);
    assert.equal(calls, 1);
    assert.deepEqual(second.body, first.body);
    assert.equal(first.body.stations[0].name, 'Testtankstelle');
    assert.equal(first.body.fuel, 'diesel');
    assert.equal(first.body.radius, 3);
    assert.ok(Number.isFinite(Date.parse(first.body.updatedAt)));
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.TANKERKOENIG_API_KEY;
    else process.env.TANKERKOENIG_API_KEY = previousKey;
  }
});
