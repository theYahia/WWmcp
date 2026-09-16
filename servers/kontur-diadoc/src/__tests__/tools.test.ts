import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getDocumentSchema,
  getOrganizationSchema,
  handleAuthenticate,
  handleGetDocument,
  handleGetOrganization,
  handleListCounterparties,
  handleListDocuments,
  handleListOrganizations,
  handleSendDocument,
  handleSignDocument,
  listDocumentsSchema,
  listOrganizationsSchema,
  sendDocumentSchema,
} from "../tools/documents.js";

vi.mock("../client.js", () => ({
  authenticate: vi.fn().mockResolvedValue("test-token-abc123def456"),
  diadocGet: vi
    .fn()
    .mockResolvedValue({ organizations: [{ name: "Test Org", inn: "1234567890" }] }),
  diadocPost: vi.fn().mockResolvedValue({ messageId: "msg-123", success: true }),
}));

import { diadocGet, diadocPost } from "../client.js";
const mockGet = vi.mocked(diadocGet);
const mockPost = vi.mocked(diadocPost);

beforeEach(() => {
  mockGet.mockClear();
  mockPost.mockClear();
});

describe("authenticate", () => {
  it("returns a token preview, never the full token", async () => {
    const parsed = JSON.parse(await handleAuthenticate());
    expect(parsed.status).toBe("authenticated");
    expect(parsed.token_preview).toContain("…");
    expect(parsed.token_preview).not.toContain("def456");
  });
});

describe("list_organizations", () => {
  it("accepts a valid 10-digit INN", () => {
    expect(listOrganizationsSchema.safeParse({ inn: "7707083893" }).success).toBe(true);
  });

  it("rejects a malformed INN", () => {
    expect(listOrganizationsSchema.safeParse({ inn: "123" }).success).toBe(false);
  });

  it("rejects a missing INN (required by the API)", () => {
    expect(listOrganizationsSchema.safeParse({ kpp: "770701001" }).success).toBe(false);
  });

  it("sends inn and kpp as separate params (not a combined innKpp)", async () => {
    await handleListOrganizations({ inn: "7707083893", kpp: "770701001" });
    expect(mockGet).toHaveBeenCalledWith("/GetOrganizationsByInnKpp", {
      inn: "7707083893",
      kpp: "770701001",
    });
  });
});

describe("get_organization", () => {
  it("rejects a call with no identifier", async () => {
    await expect(handleGetOrganization({})).rejects.toThrow(/идентификатор/);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("accepts a valid identifier in the schema", () => {
    expect(getOrganizationSchema.safeParse({ org_id: "org-1" }).success).toBe(true);
  });

  it("uses orgId when provided", async () => {
    await handleGetOrganization({ org_id: "org-123" });
    expect(mockGet).toHaveBeenCalledWith("/GetOrganization", { orgId: "org-123" });
  });

  it("falls back to boxId, then inn+kpp", async () => {
    await handleGetOrganization({ box_id: "box-123" });
    expect(mockGet).toHaveBeenCalledWith("/GetOrganization", { boxId: "box-123" });

    await handleGetOrganization({ inn: "7707083893", kpp: "770701001" });
    expect(mockGet).toHaveBeenCalledWith("/GetOrganization", {
      inn: "7707083893",
      kpp: "770701001",
    });
  });
});

describe("list_documents", () => {
  it("defaults filterCategory and count", async () => {
    const parsed = listDocumentsSchema.parse({ box_id: "box-123" });
    expect(parsed.filter_category).toBe("Any.InboundNotFinished");
    expect(parsed.count).toBe(100);
  });

  it("rejects count > 100", () => {
    expect(listDocumentsSchema.safeParse({ box_id: "b", count: 250 }).success).toBe(false);
  });

  it("converts ISO timestamps to .NET ticks and uses cursor pagination", async () => {
    await handleListDocuments({
      box_id: "box-123",
      filter_category: "Any.Inbound",
      timestamp_from: "1970-01-01T00:00:00Z",
      count: 50,
      after_index_key: "cursor-xyz",
    });
    const [path, query] = mockGet.mock.calls[0];
    expect(path).toBe("/V3/GetDocuments");
    expect(query).toMatchObject({
      boxId: "box-123",
      filterCategory: "Any.Inbound",
      timestampFromTicks: "621355968000000000",
      count: "50",
      afterIndexKey: "cursor-xyz",
    });
    expect(query).not.toHaveProperty("offset");
    expect(query).not.toHaveProperty("timestampedFrom");
  });
});

describe("get_document", () => {
  it("validates schema and forwards injectEntityContent", async () => {
    expect(
      getDocumentSchema.safeParse({ box_id: "b", message_id: "m", entity_id: "e" }).success,
    ).toBe(true);
    await handleGetDocument({
      box_id: "b",
      message_id: "m",
      entity_id: "e",
      inject_entity_content: false,
    });
    expect(mockGet).toHaveBeenCalledWith("/V3/GetDocument", {
      boxId: "b",
      messageId: "m",
      entityId: "e",
      injectEntityContent: "false",
    });
  });
});

describe("send_document", () => {
  it("validates the new schema shape", () => {
    const result = sendDocumentSchema.safeParse({
      from_box_id: "b1",
      to_box_id: "b2",
      type_named_id: "Nonformalized",
      content_base64: "dGVzdA==",
    });
    expect(result.success).toBe(true);
  });

  it("builds a MessageToPost with DocumentAttachments/SignedContent", async () => {
    await handleSendDocument({
      from_box_id: "b1",
      to_box_id: "b2",
      type_named_id: "Nonformalized",
      content_base64: "dGVzdA==",
      signature_base64: "c2ln",
      file_name: "doc.xml",
    });
    const [path, body] = mockPost.mock.calls[0] as [string, Record<string, unknown>];
    expect(path).toBe("/V3/PostMessage");
    expect(body.FromBoxId).toBe("b1");
    expect(body.ToBoxId).toBe("b2");
    const attachments = body.DocumentAttachments as Record<string, unknown>[];
    expect(attachments[0].TypeNamedId).toBe("Nonformalized");
    expect(attachments[0].SignedContent).toEqual({ Content: "dGVzdA==", Signature: "c2ln" });
    expect(attachments[0].Metadata).toEqual([{ Key: "FileName", Value: "doc.xml" }]);
  });

  it("omits Signature when sending unsigned content", async () => {
    await handleSendDocument({
      from_box_id: "b1",
      to_box_id: "b2",
      type_named_id: "Nonformalized",
      content_base64: "dGVzdA==",
    });
    const body = mockPost.mock.calls[0][1] as Record<string, unknown>;
    const attachments = body.DocumentAttachments as Record<string, unknown>[];
    expect(attachments[0].SignedContent).toEqual({ Content: "dGVzdA==" });
  });
});

describe("sign_document", () => {
  it("rejects signing without a signature or test flag", async () => {
    await expect(
      handleSignDocument({ box_id: "b", message_id: "m", entity_id: "e" }),
    ).rejects.toThrow(/signature/);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("sends Signatures[] and puts boxId/messageId in the query", async () => {
    await handleSignDocument({
      box_id: "b",
      message_id: "m",
      entity_id: "e",
      sign_with_test_signature: true,
    });
    const [path, body, params] = mockPost.mock.calls[0] as [
      string,
      Record<string, unknown>,
      Record<string, string>,
    ];
    expect(path).toBe("/V3/PostMessagePatch");
    const signatures = body.Signatures as Record<string, unknown>[];
    expect(signatures[0]).toEqual({ ParentEntityId: "e", SignWithTestSignature: true });
    expect(params).toEqual({ boxId: "b", messageId: "m" });
  });
});

describe("list_counterparties", () => {
  it("calls GetCounteragents with myBoxId (not myOrgId)", async () => {
    await handleListCounterparties({ box_id: "box-123" });
    expect(mockGet).toHaveBeenCalledWith("/GetCounteragents", { myBoxId: "box-123" });
  });

  it("forwards optional filters", async () => {
    await handleListCounterparties({
      box_id: "box-123",
      counteragent_status: "IsMyCounteragent",
      page_size: 50,
    });
    expect(mockGet).toHaveBeenCalledWith("/GetCounteragents", {
      myBoxId: "box-123",
      counteragentStatus: "IsMyCounteragent",
      pageSize: "50",
    });
  });
});
