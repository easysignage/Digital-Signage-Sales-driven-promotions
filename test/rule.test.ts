import { test } from "node:test";
import assert from "node:assert/strict";
import { decide } from "../src/rule.ts";

test("above the threshold turns the promo on", () => {
  assert.equal(decide(140, 100, false), "enable");
  assert.equal(decide(101, 100, null), "enable");
});

test("below the threshold turns the promo off", () => {
  assert.equal(decide(60, 100, true), "disable");
  assert.equal(decide(99, 100, null), "disable");
});

test("no call when the promo is already in the right state", () => {
  assert.equal(decide(150, 100, true), null);
  assert.equal(decide(10, 100, false), null);
});

test("exactly at the threshold changes nothing", () => {
  assert.equal(decide(100, 100, true), null);
  assert.equal(decide(100, 100, false), null);
  assert.equal(decide(100, 100, null), null);
});
