"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Input, Select, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button as UiButton } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import {
  createAdminMessage,
  listAdminMessages,
  listAdminUsers,
  messageStatusLabel,
  previewAdminMessageAudience,
  type AdminAudienceRecipient,
  type AdminMessageAudienceMode,
  type AdminMessageCampaign,
  type AdminMessageChannel,
  type AdminMessagePayload,
  type AdminMessageRole,
  type AdminUser,
} from "@/lib/api/admin";
import { formatDateShort, formatRelativeTime } from "@/lib/format";

function statusTag(status: string) {
  const styles: Record<string, { bg: string; color: string }> = {
    pending: { bg: "#eff6ff", color: "#1d4ed8" },
    sent: { bg: "#f0fdf4", color: "#15803d" },
    failed: { bg: "#fef2f2", color: "#b91c1c" },
  };
  const tone = styles[status] ?? { bg: "#f5f5f5", color: "#525252" };
  return (
    <Tag
      variant="filled"
      style={{
        background: tone.bg,
        color: tone.color,
        marginInlineEnd: 0,
        fontWeight: 500,
      }}
    >
      {messageStatusLabel(status)}
    </Tag>
  );
}

function Step({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[#f0f0f0] pt-5 first:border-0 first:pt-0">
      <div className="mb-3 flex items-start gap-3">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          style={{ background: "#171717", color: "#fff" }}
        >
          {n}
        </span>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#171717" }}>
            {title}
          </p>
          {hint ? (
            <p className="mt-0.5 text-xs" style={{ color: "#737373" }}>
              {hint}
            </p>
          ) : null}
        </div>
      </div>
      <div className="pl-9">{children}</div>
    </div>
  );
}

function MessagesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelFilter = searchParams.get("channel") || "";
  const roleFilter = searchParams.get("role") || "";
  const statusFilter = searchParams.get("status") || "";

  const [role, setRole] = useState<AdminMessageRole>("traveler");
  const [channel, setChannel] = useState<AdminMessageChannel>("sms");
  const [mode, setMode] = useState<AdminMessageAudienceMode>("everyone");
  const [status, setStatus] = useState("");
  const [isVerified, setIsVerified] = useState<"" | "true" | "false">("");
  const [onboardingCompleted, setOnboardingCompleted] = useState<
    "" | "true" | "false"
  >("");
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [userHits, setUserHits] = useState<AdminUser[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  const [preview, setPreview] = useState<AdminAudienceRecipient[]>([]);
  const [previewCounts, setPreviewCounts] = useState({
    total: 0,
    sendable: 0,
    skipped: 0,
  });
  const [truncated, setTruncated] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);

  const [sending, setSending] = useState(false);
  const idempotencyKey = useRef("");

  const [campaigns, setCampaigns] = useState<AdminMessageCampaign[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const peopleWord = role === "organizer" ? "organizers" : "travelers";
  const channelWord = channel === "email" ? "email" : "text";

  useEffect(() => {
    if (role === "traveler" && channel === "email") setChannel("sms");
  }, [role, channel]);

  useEffect(() => {
    setSelectedUsers([]);
    setUserQuery("");
    setUserHits([]);
    setStatus("");
    setIsVerified("");
    setOnboardingCompleted("");
    setMode("everyone");
  }, [role]);

  const selectedIds = useMemo(
    () => selectedUsers.map((u) => u.id),
    [selectedUsers]
  );

  const buildAudience = useCallback((): AdminMessagePayload["audience"] => {
    if (mode === "specific") {
      return { mode: "specific", userIds: selectedIds };
    }
    if (mode === "filter") {
      return {
        mode: "filter",
        status: role === "organizer" && status ? status : undefined,
        isVerified: isVerified === "" ? undefined : isVerified === "true",
        onboardingCompleted:
          role === "organizer" && onboardingCompleted !== ""
            ? onboardingCompleted === "true"
            : undefined,
      };
    }
    return { mode: "everyone" };
  }, [isVerified, mode, onboardingCompleted, role, selectedIds, status]);

  const canPreview = mode !== "specific" || selectedIds.length > 0;

  const loadPreview = useCallback(async () => {
    if (!canPreview) {
      setPreview([]);
      setPreviewCounts({ total: 0, sendable: 0, skipped: 0 });
      setPreviewTotal(0);
      setTruncated(false);
      setPreviewError(null);
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const audience = buildAudience();
      const res = await previewAdminMessageAudience({
        role,
        channel,
        mode: audience.mode,
        status: audience.status,
        isVerified: audience.isVerified,
        onboardingCompleted: audience.onboardingCompleted,
        userIds: audience.userIds,
        page: previewPage,
        limit: 8,
      });
      const data = res.data;
      setPreview(data?.recipients ?? []);
      setPreviewCounts(data?.counts ?? { total: 0, sendable: 0, skipped: 0 });
      setTruncated(Boolean(data?.truncated));
      setPreviewTotal(data?.pagination.total ?? 0);
    } catch (err) {
      setPreviewError(
        err instanceof ApiError ? err.message : "Could not load who this will go to."
      );
    } finally {
      setPreviewLoading(false);
    }
  }, [buildAudience, canPreview, channel, previewPage, role]);

  useEffect(() => {
    setPreviewPage(1);
  }, [role, channel, mode, status, isVerified, onboardingCompleted, selectedIds]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  useEffect(() => {
    const q = userQuery.trim();
    if (q.length < 2) {
      setUserHits([]);
      return;
    }
    const handle = window.setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await listAdminUsers({ role, q, page: 1, limit: 8 });
        const picked = new Set(selectedIds);
        setUserHits((res.data?.users ?? []).filter((u) => !picked.has(u.id)));
      } catch {
        setUserHits([]);
      } finally {
        setSearchingUsers(false);
      }
    }, 280);
    return () => window.clearTimeout(handle);
  }, [role, selectedIds, userQuery]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await listAdminMessages({
        page,
        limit: pageSize,
        channel: channelFilter || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      setCampaigns(res.data?.messages ?? []);
      setTotal(res.data?.pagination.total ?? 0);
    } catch (err) {
      setHistoryError(
        err instanceof ApiError ? err.message : "Could not load past messages."
      );
    } finally {
      setHistoryLoading(false);
    }
  }, [channelFilter, page, pageSize, roleFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [channelFilter, roleFilter, statusFilter]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const setHistoryParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    const qs = next.toString();
    router.replace(`/admin-portal/messages${qs ? `?${qs}` : ""}`);
  };

  const onSend = async () => {
    if (!message.trim()) {
      toast.error("Write the message first.");
      return;
    }
    if (channel === "email" && !subject.trim()) {
      toast.error("Add a subject for the email.");
      return;
    }
    if (mode === "specific" && selectedIds.length === 0) {
      toast.error("Pick at least one person.");
      return;
    }
    if (previewCounts.sendable < 1) {
      toast.error(
        channel === "sms"
          ? "Nobody in this group has a valid phone number."
          : "Nobody in this group has an email address."
      );
      return;
    }

    setSending(true);
    idempotencyKey.current =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    try {
      const res = await createAdminMessage(
        {
          role,
          channel,
          message: message.trim(),
          subject: channel === "email" ? subject.trim() : undefined,
          audience: buildAudience(),
        },
        idempotencyKey.current
      );
      toast.success(
        channel === "email" ? "Email is going out." : "Text is going out."
      );
      const id = res.data?.message.id;
      if (id) router.push(`/admin-portal/messages/${id}`);
      else void loadHistory();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not send the message."
      );
    } finally {
      setSending(false);
    }
  };

  const previewColumns: ColumnsType<AdminAudienceRecipient> = [
    {
      title: "Name",
      dataIndex: "fullName",
      render: (name: string) => name || "—",
    },
    {
      title: channel === "sms" ? "Phone" : "Email",
      key: "contact",
      render: (_, row) =>
        channel === "sms" ? row.phone || "—" : row.email || "—",
    },
    {
      title: "",
      width: 180,
      render: (_, row) =>
        row.sendable ? (
          <span className="text-xs" style={{ color: "#15803d" }}>
            Will get it
          </span>
        ) : (
          <span className="text-xs" style={{ color: "#c2410c" }}>
            {row.skipReason || "Left out"}
          </span>
        ),
    },
  ];

  const historyColumns: ColumnsType<AdminMessageCampaign> = [
    {
      title: "What you sent",
      key: "preview",
      render: (_, row) => (
        <Link href={`/admin-portal/messages/${row.id}`} className="block min-w-0">
          <span className="block font-medium" style={{ color: "var(--text)" }}>
            {row.subject || row.preview || "Message"}
          </span>
          <span className="block text-xs" style={{ color: "var(--text-tertiary)" }}>
            {row.snippet}
          </span>
        </Link>
      ),
    },
    {
      title: "To",
      dataIndex: "audience",
      width: 200,
    },
    {
      title: "Via",
      dataIndex: "channel",
      width: 90,
      render: (value: string) => (
        <span className="text-xs font-medium">
          {value === "email" ? "Email" : "Text"}
        </span>
      ),
    },
    {
      title: "People",
      dataIndex: "recipients",
      width: 90,
      render: (value: number) => <span className="tabular-nums">{value}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 110,
      render: (value: string) => statusTag(value),
    },
    {
      title: "When",
      key: "sent",
      width: 140,
      render: (_, row) => {
        const at = row.sentAt || row.createdAt;
        return at ? (
          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            <div>{formatRelativeTime(at)}</div>
            <div>{formatDateShort(at)}</div>
          </div>
        ) : (
          "—"
        );
      },
    },
  ];

  const sendLabel =
    previewCounts.sendable > 0
      ? `Send ${channelWord} to ${previewCounts.sendable} ${peopleWord}`
      : `Send ${channelWord}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 lg:hidden">
        <h1
          className="font-display text-2xl font-bold tracking-tight"
          style={{ color: "var(--text)" }}
        >
          Messages
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Text travelers, or text / email organizers
        </p>
      </div>

      <section
        className="rounded-2xl bg-white p-5 sm:p-6"
        style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
      >
        <h2
          className="mb-5 font-display text-base font-semibold tracking-tight"
          style={{ color: "#171717" }}
        >
          Write a new message
        </h2>

        <div className="space-y-5">
          <Step n={1} title="Who is this for?" hint="Pick travelers or organizers first.">
            <Space wrap>
              <Button
                type={role === "traveler" ? "primary" : "default"}
                onClick={() => setRole("traveler")}
              >
                Travelers
              </Button>
              <Button
                type={role === "organizer" ? "primary" : "default"}
                onClick={() => setRole("organizer")}
              >
                Organizers
              </Button>
            </Space>
            <div className="mt-3">
              <Space wrap>
                <Button
                  type={mode === "everyone" ? "primary" : "default"}
                  onClick={() => setMode("everyone")}
                >
                  Everyone
                </Button>
                <Button
                  type={mode === "filter" ? "primary" : "default"}
                  onClick={() => setMode("filter")}
                >
                  A group
                </Button>
                <Button
                  type={mode === "specific" ? "primary" : "default"}
                  onClick={() => setMode("specific")}
                >
                  Specific people
                </Button>
              </Space>
            </div>

            {mode === "filter" ? (
              <div className="mt-3">
                <p className="mb-2 text-xs" style={{ color: "#737373" }}>
                  Only include people who match:
                </p>
                <Space wrap>
                  {role === "organizer" ? (
                    <Select
                      allowClear
                      placeholder="Approval status"
                      value={status || undefined}
                      onChange={(value) => setStatus(value || "")}
                      style={{ minWidth: 170 }}
                      options={[
                        { value: "pending", label: "Waiting for approval" },
                        { value: "approved", label: "Approved" },
                        { value: "rejected", label: "Rejected" },
                      ]}
                    />
                  ) : null}
                  <Select
                    allowClear
                    placeholder="Phone / email verified"
                    value={isVerified || undefined}
                    onChange={(value) => setIsVerified(value || "")}
                    style={{ minWidth: 180 }}
                    options={[
                      { value: "true", label: "Verified" },
                      { value: "false", label: "Not verified" },
                    ]}
                  />
                  {role === "organizer" ? (
                    <Select
                      allowClear
                      placeholder="Profile setup"
                      value={onboardingCompleted || undefined}
                      onChange={(value) => setOnboardingCompleted(value || "")}
                      style={{ minWidth: 170 }}
                      options={[
                        { value: "true", label: "Setup complete" },
                        { value: "false", label: "Setup not finished" },
                      ]}
                    />
                  ) : null}
                </Space>
              </div>
            ) : null}

            {mode === "specific" ? (
              <div className="mt-3">
                <Input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search by name, email, or phone"
                  allowClear
                  suffix={
                    searchingUsers ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : null
                  }
                />
                {userHits.length > 0 ? (
                  <ul
                    className="mt-2 divide-y rounded-xl"
                    style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
                  >
                    {userHits.map((user) => (
                      <li key={user.id}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[#fafafa]"
                          onClick={() => {
                            setSelectedUsers((prev) => [...prev, user]);
                            setUserQuery("");
                            setUserHits([]);
                          }}
                        >
                          <span>
                            <span className="font-medium">
                              {user.fullName || user.businessName || user.email}
                            </span>
                            <span className="ml-2 text-xs" style={{ color: "#a3a3a3" }}>
                              {user.email}
                            </span>
                          </span>
                          <span className="text-xs" style={{ color: "#737373" }}>
                            Add
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {selectedUsers.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <span
                        key={user.id}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium"
                        style={{ background: "#f5f5f5", color: "#171717" }}
                      >
                        {user.fullName || user.businessName || user.email}
                        <button
                          type="button"
                          aria-label="Remove"
                          onClick={() =>
                            setSelectedUsers((prev) =>
                              prev.filter((u) => u.id !== user.id)
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs" style={{ color: "#a3a3a3" }}>
                    Type a name to add people.
                  </p>
                )}
              </div>
            ) : null}
          </Step>

          <Step
            n={2}
            title="How should they get it?"
            hint={
              role === "traveler"
                ? "Travelers only get a text message."
                : "Organizers can get a text or an email."
            }
          >
            <Space wrap>
              <Button
                type={channel === "sms" ? "primary" : "default"}
                onClick={() => setChannel("sms")}
              >
                Text message
              </Button>
              <Button
                type={channel === "email" ? "primary" : "default"}
                disabled={role === "traveler"}
                onClick={() => setChannel("email")}
              >
                Email
              </Button>
            </Space>
          </Step>

          <Step
            n={3}
            title="Write the message"
            hint='Type {FirstName} and each person sees their own name.'
          >
            <div className="space-y-3">
              {channel === "email" ? (
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line"
                  maxLength={200}
                />
              ) : null}
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                maxLength={channel === "sms" ? 1600 : 10000}
                placeholder={
                  channel === "sms"
                    ? "Hi {FirstName}, new trips just dropped on VaybeEx."
                    : "Hi {FirstName},\n\nPlease keep trip details up to date before publishing."
                }
              />
              <p className="text-xs" style={{ color: "#a3a3a3" }}>
                {channel === "sms" ? `${message.length}/1600` : `${message.length} characters`}
              </p>
            </div>
          </Step>

          <div className="border-t border-[#f0f0f0] pt-5">
            <div className="rounded-xl px-4 py-3" style={{ background: "#fafafa" }}>
              {previewLoading ? (
                <p className="text-sm" style={{ color: "#737373" }}>
                  Checking who this will go to…
                </p>
              ) : previewError ? (
                <Alert
                  type="error"
                  showIcon
                  message={previewError}
                  action={
                    <Button size="small" onClick={() => void loadPreview()}>
                      Retry
                    </Button>
                  }
                />
              ) : truncated ? (
                <p className="text-sm" style={{ color: "#b45309" }}>
                  Too many people in this group. Narrow it or pick specific people.
                </p>
              ) : (
                <p className="text-sm" style={{ color: "#171717" }}>
                  {previewCounts.sendable === 0
                    ? mode === "specific" && selectedIds.length === 0
                      ? "Add people above, then send."
                      : channel === "sms"
                        ? "No one in this group has a phone number we can text."
                        : "No one in this group has an email we can use."
                    : previewCounts.skipped > 0
                      ? `This will go to ${previewCounts.sendable} ${peopleWord}. ${previewCounts.skipped} will be left out (no ${channel === "sms" ? "phone" : "email"}).`
                      : `This will go to ${previewCounts.sendable} ${peopleWord}.`}
                </p>
              )}
              {previewCounts.total > 0 ? (
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium"
                  style={{ color: "#525252" }}
                  onClick={() => setShowList((open) => !open)}
                >
                  {showList ? (
                    <>
                      Hide list <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      See who <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              ) : null}
            </div>

            {showList ? (
              <div className="mt-3">
                <Table<AdminAudienceRecipient>
                  className="admin-antd-table"
                  rowKey="id"
                  size="small"
                  columns={previewColumns}
                  dataSource={preview}
                  loading={previewLoading}
                  pagination={{
                    current: previewPage,
                    pageSize: 8,
                    total: previewTotal,
                    showSizeChanger: false,
                    onChange: (next) => setPreviewPage(next),
                  }}
                  locale={{ emptyText: "No one matches yet." }}
                />
              </div>
            ) : null}

            <div className="mt-4 flex justify-end">
              <UiButton
                className="bg-[#171717] text-white hover:bg-neutral-800"
                disabled={sending || previewLoading || previewCounts.sendable < 1}
                onClick={() => void onSend()}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {sendLabel}
              </UiButton>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2
          className="mb-1 font-display text-xl font-bold tracking-tight"
          style={{ color: "#171717" }}
        >
          Past messages
        </h2>
        <p className="mb-4 text-sm" style={{ color: "#737373" }}>
          Tap a row to see who got it.
        </p>
        <Space wrap className="mb-4">
          <Button
            type={!channelFilter ? "primary" : "default"}
            onClick={() => setHistoryParams({ channel: null })}
          >
            All
          </Button>
          <Button
            type={channelFilter === "sms" ? "primary" : "default"}
            onClick={() => setHistoryParams({ channel: "sms" })}
          >
            Texts
          </Button>
          <Button
            type={channelFilter === "email" ? "primary" : "default"}
            onClick={() => setHistoryParams({ channel: "email" })}
          >
            Emails
          </Button>
          <Select
            allowClear
            placeholder="Sent to"
            value={roleFilter || undefined}
            onChange={(value) => setHistoryParams({ role: value || null })}
            style={{ minWidth: 140 }}
            options={[
              { value: "traveler", label: "Travelers" },
              { value: "organizer", label: "Organizers" },
            ]}
          />
          <Select
            allowClear
            placeholder="Status"
            value={statusFilter || undefined}
            onChange={(value) => setHistoryParams({ status: value || null })}
            style={{ minWidth: 130 }}
            options={[
              { value: "pending", label: "Sending" },
              { value: "sent", label: "Sent" },
              { value: "failed", label: "Failed" },
            ]}
          />
        </Space>

        {historyError && !historyLoading ? (
          <Alert
            className="mb-4"
            type="error"
            showIcon
            message={historyError}
            action={
              <Button size="small" onClick={() => void loadHistory()}>
                Retry
              </Button>
            }
          />
        ) : null}

        <Table<AdminMessageCampaign>
          className="admin-antd-table"
          rowKey="id"
          columns={historyColumns}
          dataSource={campaigns}
          loading={historyLoading}
          pagination={
            {
              current: page,
              pageSize,
              total,
              showSizeChanger: false,
              showTotal: (t) => `${t} message${t === 1 ? "" : "s"}`,
              onChange: (next) => setPage(next),
            } satisfies TablePaginationConfig
          }
          scroll={{ x: 860 }}
          locale={{ emptyText: "Nothing sent yet." }}
          onRow={(row) => ({
            style: { cursor: "pointer" },
            onClick: () => router.push(`/admin-portal/messages/${row.id}`),
          })}
        />
      </section>
    </div>
  );
}

export default function AdminMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          Loading…
        </div>
      }
    >
      <MessagesInner />
    </Suspense>
  );
}
