import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/stations.js';

function request(query = {}, method = 'GET') {
  const response = {
    code: 0, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader() {}
  };
  return handler({ method, query }, response).then(() => response);
}

test('rejects invalid requests without contacting external services', async () => {
  const previousKey = process.env.TANKERKOENIG_API_KEY;
  const previousFetch = globalThis.fetch;
  let calls = 0;
  process.env.TANKERKOENIG_API_KEY = 'test-key';
  globalThis.fetch = async () => { calls++; throw new Error('Unexpected network request'); };
  try {
    assert.equal((await request({}, 'POST')).code, 405);
    for (const query of [{ fuel: 'invalid' }, { radius: 26 }, { radius: -1 }, { radius: 'abc' }, { location: 'x' }, { lat: 49 }, { lat: 0, lng: 8 }]) {
      assert.equal((await request(query)).code, 400, JSON.stringify(query));
    }
    delete process.env.TANKERKOENIG_API_KEY;
    assert.equal((await request()).code, 503);
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.TANKERKOENIG_API_KEY;
    else process.env.TANKERKOENIG_API_KEY = previousKey;
  }
});
