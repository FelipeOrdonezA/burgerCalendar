import { testDataDirectory } from "./test-environment";
import assert from "node:assert/strict";
import { readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { BlobError, BlobPreconditionFailedError } from "@vercel/blob";
import { BlobJsonRepository, type BlobClient } from "../repositories/blob-json.repository";
import { JsonFileRepository } from "../repositories/json-file.repository";
import { StorageConflictError, StorageError } from "../repositories/repository";
import { storageDriver } from "../repositories/storage-config";
import app from "../utils/app";

async function testLocal(): Promise<void> {
  const first = new JsonFileRepository<{ id: string }>("test.json");
  const second = new JsonFileRepository<{ id: string }>("test.json");
  assert.deepEqual(await first.readSnapshot(), { items: [], version: null });
  const outcomes = await Promise.allSettled([
    first.saveAll([{ id: "a" }], null),
    second.saveAll([{ id: "b" }], null),
  ]);
  assert.equal(outcomes.filter((result) => result.status === "fulfilled").length, 1);
  const rejection = outcomes.find((result) => result.status === "rejected");
  assert.ok(rejection?.status === "rejected" && rejection.reason instanceof StorageConflictError);

  const snapshot = await first.readSnapshot();
  await second.saveAll([{ id: "new" }], snapshot.version);
  await assert.rejects(first.saveAll([], snapshot.version), StorageConflictError);
  assert.deepEqual(await first.findAll(), [{ id: "new" }]);

  const path = resolve(testDataDirectory, "test.json");
  await writeFile(path, "broken JSON");
  await assert.rejects(first.findAll(), StorageError);
  await assert.rejects(first.saveAll([], null), StorageError);
  assert.equal(await readFile(path, "utf8"), "broken JSON");
}

async function testBlob(): Promise<void> {
  let body: string | null = null;
  let version = 0;
  let failReads = false;
  const client: BlobClient = {
    get: async (pathname, options) => {
      assert.equal(pathname, "data/test.json");
      assert.equal(options.access, "private");
      assert.equal(options.useCache, false);
      if (failReads) throw new Error("offline");
      if (body === null) return null;
      return {
        statusCode: 200,
        stream: new Response(body).body,
        blob: { etag: String(version) },
      } as Awaited<ReturnType<BlobClient["get"]>>;
    },
    put: async (pathname, value, options) => {
      assert.equal(pathname, "data/test.json");
      assert.equal(options.access, "private");
      assert.equal(options.addRandomSuffix, false);
      assert.equal(options.contentType, "application/json");
      if (body !== null && !options.allowOverwrite) throw new BlobError("Already exists");
      if (options.allowOverwrite && options.ifMatch !== String(version)) {
        throw new BlobPreconditionFailedError();
      }
      body = String(value);
      version++;
      return { etag: String(version) } as Awaited<ReturnType<BlobClient["put"]>>;
    },
  };
  const first = new BlobJsonRepository<{ id: string }>("test.json", client);
  const second = new BlobJsonRepository<{ id: string }>("test.json", client);
  assert.deepEqual(await first.readSnapshot(), { items: [], version: null });
  await first.saveAll([{ id: "a" }], null);
  await assert.rejects(second.saveAll([{ id: "b" }], null), StorageConflictError);
  const snapshot = await first.readSnapshot();
  await second.saveAll([{ id: "b" }], snapshot.version);
  await assert.rejects(first.saveAll([{ id: "lost" }], snapshot.version), StorageConflictError);
  assert.deepEqual(await first.findAll(), [{ id: "b" }]);
  failReads = true;
  await assert.rejects(first.findAll(), StorageError);
  failReads = false;
  body = "invalid";
  await assert.rejects(first.findAll(), StorageError);
}

async function testHttp(): Promise<void> {
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}/api`;
  try {
    assert.equal((await fetch(`${url}/health`)).status, 200);
    const created = await fetch(`${url}/tasks`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Prueba HTTP" }),
    });
    assert.equal(created.status, 201);
    assert.equal(created.headers.get("cache-control"), "no-store");
    const invalid = await fetch(`${url}/tasks`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{",
    });
    assert.equal(invalid.status, 400);
    await writeFile(resolve(testDataDirectory, "tasks.json"), "invalid");
    assert.equal((await fetch(`${url}/tasks`)).status, 503);
    const failedWrite = await fetch(`${url}/tasks`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Prueba" }),
    });
    assert.equal(failedWrite.status, 503);
    assert.equal((await fetch(`${url}/missing`)).status, 404);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

async function run(): Promise<void> {
  try {
    assert.equal(storageDriver(), "local");
    process.env.VERCEL = "1";
    process.env.VERCEL_ENV = "production";
    assert.throws(storageDriver, /requieren STORAGE_DRIVER=blob/);
    delete process.env.STORAGE_DRIVER;
    assert.equal(storageDriver(), "blob");
    process.env.VERCEL_ENV = "preview";
    assert.equal(storageDriver(), "blob");
    process.env.VERCEL_ENV = "development";
    assert.equal(storageDriver(), "local");
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    process.env.STORAGE_DRIVER = "local";
    await testLocal();
    await testBlob();
    await testHttp();
    console.log("Storage and HTTP tests passed (local files and simulated Blob).");
  } finally {
    await rm(testDataDirectory, { recursive: true, force: true });
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
