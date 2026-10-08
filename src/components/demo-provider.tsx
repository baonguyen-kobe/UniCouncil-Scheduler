"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  accounts,
  Locale,
  Role,
  MeetingRequest,
  visibleRequests,
} from "@/lib/model";
import { createFixtures } from "@/lib/fixtures";
type Account = (typeof accounts)[number];
type DemoContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (vi: string, en: string) => string;
  role: Role;
  switchRole: (r: Role) => void;
  account: Account;
  switchAccount: (id: string) => void;
  requests: MeetingRequest[];
  visible: MeetingRequest[];
  updateRequest: (
    id: string,
    patch: Partial<MeetingRequest>,
    event: { vi: string; en: string },
    note?: string,
    internal?: boolean,
  ) => void;
  addRequest: (r: MeetingRequest) => void;
  selectedId: string | null;
  openRequest: (id: string) => void;
  closeRequest: () => void;
  dirty: boolean;
  setDirty: (v: boolean) => void;
  navigate: (path: string) => void;
  notice: string;
  notify: (vi: string, en: string) => void;
  reset: () => void;
};
const Context = createContext<DemoContextValue | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("vi");
  const [role, setRole] = useState<Role>("REQUESTER");
  const [account, setAccount] = useState(accounts[0]);
  const [requests, setRequests] = useState<MeetingRequest[]>(createFixtures);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<{ vi: string; en: string } | null>(null);
  const t = useCallback(
    (vi: string, en: string) => (locale === "vi" ? vi : en),
    [locale],
  );
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 6500);
    return () => clearTimeout(id);
  }, [notice]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function allowLeave() {
    return (
      !dirty ||
      window.confirm(
        t(
          "Nội dung chưa gửi sẽ bị mất. Bạn muốn rời trang?",
          "Unsaved changes will be lost. Leave this page?",
        ),
      )
    );
  }
  function navigate(path: string) {
    if (!allowLeave()) return;
    setDirty(false);
    setSelectedId(null);
    router.push(path);
  }
  function switchRole(next: Role) {
    if (!account.roles.includes(next) || !allowLeave()) return;
    setRole(next);
    setSelectedId(null);
    setDirty(false);
    router.push(next === "ADMIN" ? "/admin" : "/requests");
  }
  function switchAccount(id: string) {
    const next = accounts.find((a) => a.id === id);
    if (!next || !allowLeave()) return;
    setAccount(next);
    setRole(next.roles.includes(role) ? role : next.roles[0]);
    setSelectedId(null);
    setDirty(false);
    router.push(
      next.roles.includes(role) && role === "ADMIN" ? "/admin" : "/requests",
    );
  }
  function updateRequest(
    id: string,
    patch: Partial<MeetingRequest>,
    event: { vi: string; en: string },
    note?: string,
    internal = false,
  ) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id !== id
          ? r
          : {
              ...r,
              ...patch,
              version: r.version + 1,
              updatedAt: new Date().toISOString(),
              history: [
                ...r.history,
                {
                  id: crypto.randomUUID(),
                  at: new Date().toISOString(),
                  actor: account.name,
                  label: event,
                  note,
                  internal,
                },
              ],
            },
      ),
    );
    setNotice({
      vi: "Thay đổi mẫu đã áp dụng — chỉ lưu trong phiên này.",
      en: "Demo change applied — stored only in this session.",
    });
  }
  return (
    <Context.Provider
      value={{
        locale,
        setLocale,
        t,
        role,
        switchRole,
        account,
        switchAccount,
        requests,
        visible: visibleRequests(requests, role, account.id),
        updateRequest,
        addRequest: (r) => setRequests((prev) => [r, ...prev]),
        selectedId,
        openRequest: setSelectedId,
        closeRequest: () => setSelectedId(null),
        dirty,
        setDirty,
        navigate,
        notice: notice?.[locale] ?? "",
        notify: (vi, en) => setNotice({ vi, en }),
        reset: () => {
          if (!allowLeave()) return;
          setRequests(createFixtures());
          setDirty(false);
          setSelectedId(null);
          setNotice({
            vi: "Dữ liệu mẫu đã được đặt lại.",
            en: "Demo fixtures reset.",
          });
        },
      }}
    >
      {children}
      {notice && (
        <div className="toast" role="status">
          {notice[locale]}
          <button
            aria-label={t("Đóng thông báo", "Dismiss notification")}
            onClick={() => setNotice(null)}
          >
            <XMarkIcon />
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("DemoProvider missing");
  return value;
}
