// The guard that keeps a private key out of the committed config.
//
// It works by shape — 66 characters of hex is a key and nothing else a config
// holds — and that shape is also a transaction hash and a bytes32 salt, both of
// which this file legitimately records. So two paths are exempt, and the point
// of this test is that they are the only two: an exemption that is wider than
// it looks would let a real key through the one check standing between it and a
// public repository.
import assert from "node:assert/strict";
import test from "node:test";

import { refuseSecrets } from "../lib/config.mjs";

const KEY = `0x${"a1".repeat(32)}`;

/** refuseSecrets calls process.exit on a refusal; catch that rather than dying. */
function refuses(node) {
  const exit = process.exit;
  const error = console.error;

  let refused = false;
  process.exit = () => {
    refused = true;
    throw new Error("refused");
  };
  console.error = () => {};

  try {
    refuseSecrets(node, "");
  } catch {
    // the throw above is how we get out of a process.exit that cannot exit
  } finally {
    process.exit = exit;
    console.error = error;
  }
  return refused;
}

test("a key-shaped value is refused wherever it appears", () => {
  assert.ok(refuses({ treasury: KEY }), "at the top level");
  assert.ok(refuses({ deployed: { factory: KEY } }), "among the deployed addresses");
  assert.ok(refuses({ launch: { floorEth: KEY } }), "inside the launch settings");
  assert.ok(refuses({ hookSalt: KEY }), "at a path that only looks like the exempt one");
  assert.ok(refuses({ deployed: { nested: { hookSalt: KEY } } }), "one level below the exempt path");
});

test("the two values that are 32 bytes on purpose are allowed", () => {
  assert.equal(refuses({ deployed: { hookSalt: KEY } }), false, "the mined salt");
  assert.equal(refuses({ deployed: { deployTx: KEY } }), false, "the deployment transaction");
});

test("ordinary values pass", () => {
  assert.equal(
    refuses({
      chainId: 4663,
      treasury: "0xb1A81E4A729c87560eF12d7652D883e803C5422E",
      launch: { tickSpacing: 200, floorEth: "1" },
      deployed: {
        factory: "0x8f61c8d12f7f3135c1202dfDd113F2B37c6A7fd6",
        hookSalt: `0x${"0".repeat(61)}70b`,
        deployTx: "0x5c267a8abd4b82a3b8c24517c07ebf5800f51635b396e4d9f84f14e0b2970a0d",
      },
    }),
    false,
  );
});
