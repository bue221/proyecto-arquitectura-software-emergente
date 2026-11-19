import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, getJson, readApiError, sendJson } from "@/lib/api/http";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("readApiError", () => {
  it("parses problem JSON bodies", async () => {
    const res = new Response(JSON.stringify({ message: "Nope", code: "bad_request" }), {
      status: 400,
    });
    const err = await readApiError(res);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe("Nope");
    expect(err.status).toBe(400);
    expect(err.code).toBe("bad_request");
  });

  it("falls back when the body is not JSON", async () => {
    const res = new Response("plain", { status: 502 });
    const err = await readApiError(res);
    expect(err.message).toBe("Request failed (502)");
    expect(err.status).toBe(502);
  });
});

describe("getJson / sendJson", () => {
  it("returns parsed JSON on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    await expect(getJson<{ ok: boolean }>("/api")).resolves.toEqual({ ok: true });
  });

  it("throws ApiError on non-OK responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Unauthorized", code: "unauthorized" }), {
          status: 401,
        }),
      ),
    );
    await expect(getJson("/api")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      code: "unauthorized",
    });
  });

  it("returns void on 204", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );
    await expect(sendJson("/api", "DELETE")).resolves.toBeUndefined();
  });
});
