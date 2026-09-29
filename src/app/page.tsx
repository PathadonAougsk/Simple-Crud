"use client";

import { useEffect, useMemo, useState } from "react";

type Row = Record<string, any>;
type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "checkbox" | "select";
  options?: string[];
  step?: string;
  req?: boolean;
};
type Res = { label: string; path: string; id: string; fields: Field[] };

const RES: Record<string, Res> = {
  customers: {
    label: "Customers",
    path: "/api/customers",
    id: "customer_id",
    fields: [
      { key: "full_name", label: "Full name", req: true },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
    ],
  },
  employees: {
    label: "Employees",
    path: "/api/employees",
    id: "employee_id",
    fields: [
      { key: "full_name", label: "Full name", req: true },
      { key: "role", label: "Role", type: "select", options: ["Barista", "Cashier", "Manager"] },
      { key: "hire_date", label: "Hire date", type: "date", req: true },
    ],
  },
  menu: {
    label: "Menu",
    path: "/api/menu-items",
    id: "item_id",
    fields: [
      { key: "item_name", label: "Item name", req: true },
      { key: "category", label: "Category", type: "select", options: ["Coffee", "Tea", "Pastry", "Dessert"] },
      { key: "price", label: "Price", type: "number", step: "0.01", req: true },
      { key: "is_available", label: "Available", type: "checkbox" },
    ],
  },
};

async function api(url: string, method = "GET", body?: unknown) {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 204) return null;
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error(d?.error ?? "Request failed");
  return d;
}

const match = (r: Row, q: string) => JSON.stringify(r).toLowerCase().includes(q.trim().toLowerCase());
const money = (n: number) => n.toFixed(2);

const inputCls =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";
const btn = "rounded-md px-3 py-1.5 text-sm font-medium transition";
const primary = `${btn} bg-emerald-800 text-white hover:bg-emerald-900`;
const ghost = `${btn} text-stone-600 hover:bg-stone-100`;
const danger = `${btn} text-red-700 hover:bg-red-50`;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-stone-900">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-stone-700">
      <span className="mb-1 block font-medium">{text}</span>
      {children}
    </label>
  );
}

function Spinner() {
  return <span aria-hidden className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
}

function ConfirmDelete({ what, onConfirm, onCancel }: { what: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal title="Delete this record?" onClose={onCancel}>
      <p className="text-sm text-stone-600">
        You are about to delete <span className="font-medium text-stone-900">{what}</span>. This can't be undone.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button className={ghost} onClick={onCancel} autoFocus>
          Keep it
        </button>
        <button className={`${btn} bg-red-700 text-white hover:bg-red-800`} onClick={onConfirm}>
          Delete
        </button>
      </div>
    </Modal>
  );
}

function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty: boolean }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">{children}</tbody>
      </table>
      {empty && <p className="px-4 py-8 text-center text-stone-500">Nothing here yet. Add a record or change your search.</p>}
    </div>
  );
}

/* ---------- Generic CRUD for customers / employees / menu ---------- */
function Crud({ res, q, onError }: { res: Res; q: string; onError: (m: string) => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState<Row | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const load = () => api(res.path).then(setRows).catch((e) => onError(e.message));
  useEffect(() => {
    load();
  }, [res.path]);

  const shown = useMemo(() => rows.filter((r) => match(r, q)), [rows, q]);

  const open = (r?: Row) => {
    setEditId(r ? r[res.id] : null);
    setForm(
      Object.fromEntries(
        res.fields.map((f) => [
          f.key,
          r
            ? f.type === "date"
              ? String(r[f.key]).slice(0, 10)
              : r[f.key] ?? (f.type === "checkbox" ? false : "")
            : f.type === "checkbox"
            ? true
            : f.options?.[0] ?? "",
        ])
      )
    );
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form! };
    res.fields.forEach((f) => f.type === "number" && (body[f.key] = Number(body[f.key])));
    try {
      await api(editId !== null ? `${res.path}/${editId}` : res.path, editId !== null ? "PATCH" : "POST", body);
      setForm(null);
      load();
    } catch (err: any) {
      onError(err.message);
    }
  };

  const [toDelete, setToDelete] = useState<Row | null>(null);
  const del = async () => {
    const r = toDelete!;
    setToDelete(null);
    try {
      await api(`${res.path}/${r[res.id]}`, "DELETE");
      load();
    } catch (err: any) {
      onError(err.message);
    }
  };

  const show = (f: Field, v: any) =>
    f.type === "checkbox" ? (v ? "Yes" : "No") : f.type === "date" ? String(v).slice(0, 10) : v ?? "—";

  return (
    <>
      <div className="mb-3 flex justify-end">
        <button className={primary} onClick={() => open()}>
          Add {res.label.replace(/s$/, "").toLowerCase()}
        </button>
      </div>
      <Table head={["ID", ...res.fields.map((f) => f.label), ""]} empty={shown.length === 0}>
        {shown.map((r) => (
          <tr key={r[res.id]} className="hover:bg-stone-50">
            <td className="px-4 py-2.5 text-stone-500">{r[res.id]}</td>
            {res.fields.map((f) => (
              <td key={f.key} className="px-4 py-2.5">
                {show(f, r[f.key])}
              </td>
            ))}
            <td className="whitespace-nowrap px-4 py-2.5 text-right">
              <button className={ghost} onClick={() => open(r)}>
                Edit
              </button>
              <button className={danger} onClick={() => setToDelete(r)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </Table>

      {form && (
        <Modal title={editId !== null ? `Edit ${res.label.replace(/s$/, "").toLowerCase()}` : `New ${res.label.replace(/s$/, "").toLowerCase()}`} onClose={() => setForm(null)}>
          <form onSubmit={save} className="space-y-3">
            {res.fields.map((f) => (
              <Label key={f.key} text={f.label}>
                {f.type === "select" ? (
                  <select className={inputCls} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                    {f.options!.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : f.type === "checkbox" ? (
                  <input type="checkbox" className="h-4 w-4 accent-emerald-800" checked={!!form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} />
                ) : (
                  <input
                    className={inputCls}
                    type={f.type ?? "text"}
                    step={f.step}
                    required={f.req}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                )}
              </Label>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={ghost} onClick={() => setForm(null)}>
                Cancel
              </button>
              <button className={primary}>Save changes</button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDelete
          what={String(toDelete[res.fields[0].key])}
          onConfirm={del}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}

/* ---------- Orders ---------- */
type Line = { item_id: string; quantity: number };

function Orders({ q, onError }: { q: string; onError: (m: string) => void }) {
  const [orders, setOrders] = useState<Row[]>([]);
  const [customers, setCustomers] = useState<Row[]>([]);
  const [employees, setEmployees] = useState<Row[]>([]);
  const [menu, setMenu] = useState<Row[]>([]);
  const [form, setForm] = useState<{ employee_id: string; customer_id: string; lines: Line[] } | null>(null);

  const load = () => api("/api/orders").then(setOrders).catch((e) => onError(e.message));
  useEffect(() => {
    load();
    Promise.all([api("/api/customers"), api("/api/employees"), api("/api/menu-items")])
      .then(([c, e, m]) => {
        setCustomers(c);
        setEmployees(e);
        setMenu(m);
      })
      .catch((e) => onError(e.message));
  }, []);

  const shown = useMemo(() => orders.filter((o) => match(o, q)), [orders, q]);
  const total = (o: Row) => o.order_items.reduce((s: number, i: Row) => s + Number(i.unit_price) * i.quantity, 0);

  const setLine = (i: number, patch: Partial<Line>) =>
    setForm((f) => f && { ...f, lines: f.lines.map((l, n) => (n === i ? { ...l, ...patch } : l)) });

  const [saving, setSaving] = useState(false);
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const f = form!;
    const items = f.lines.filter((l) => l.item_id).map((l) => ({ item_id: Number(l.item_id), quantity: l.quantity }));
    setSaving(true);
    try {
      await api("/api/orders", "POST", {
        employee_id: Number(f.employee_id),
        customer_id: f.customer_id ? Number(f.customer_id) : null,
        items,
      });
      await load();
      setForm(null);
    } catch (err: any) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (id: number, status: string) => {
    try {
      await api(`/api/orders/${id}`, "PATCH", { status });
      load();
    } catch (err: any) {
      onError(err.message);
    }
  };

  const [toDelete, setToDelete] = useState<number | null>(null);
  const del = async () => {
    const id = toDelete!;
    setToDelete(null);
    try {
      await api(`/api/orders/${id}`, "DELETE");
      load();
    } catch (err: any) {
      onError(err.message);
    }
  };

  const badge: Record<string, string> = {
    Open: "bg-amber-100 text-amber-800",
    Paid: "bg-emerald-100 text-emerald-800",
    Cancelled: "bg-stone-200 text-stone-600",
  };

  return (
    <>
      <div className="mb-3 flex justify-end">
        <button
          className={primary}
          onClick={() => setForm({ employee_id: String(employees[0]?.employee_id ?? ""), customer_id: "", lines: [{ item_id: "", quantity: 1 }] })}
        >
          Add order
        </button>
      </div>
      <Table head={["Order", "Date", "Customer", "Served by", "Items", "Total", "Status", ""]} empty={shown.length === 0}>
        {shown.map((o) => (
          <tr key={o.order_id} className="align-top hover:bg-stone-50">
            <td className="px-4 py-2.5 text-stone-500">#{o.order_id}</td>
            <td className="px-4 py-2.5">{String(o.order_date).slice(0, 10)}</td>
            <td className="px-4 py-2.5">{o.customer?.full_name ?? "Walk-in"}</td>
            <td className="px-4 py-2.5">{o.employee?.full_name}</td>
            <td className="px-4 py-2.5">
              {o.order_items.map((i: Row) => (
                <div key={i.item_id}>
                  {i.quantity} × {i.item?.item_name}
                </div>
              ))}
            </td>
            <td className="px-4 py-2.5 tabular-nums">{money(total(o))}</td>
            <td className="px-4 py-2.5">
              <select
                className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${badge[o.status]}`}
                value={o.status}
                onChange={(e) => setStatus(o.order_id, e.target.value)}
              >
                {["Open", "Paid", "Cancelled"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </td>
            <td className="px-4 py-2.5 text-right">
              <button className={danger} onClick={() => setToDelete(o.order_id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </Table>

      {form && (
        <Modal title="New order" onClose={() => setForm(null)}>
          <form onSubmit={create} className="space-y-3">
            <Label text="Served by">
              <select className={inputCls} required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
                {employees.map((e) => (
                  <option key={e.employee_id} value={e.employee_id}>
                    {e.full_name}
                  </option>
                ))}
              </select>
            </Label>
            <Label text="Customer">
              <select className={inputCls} value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                <option value="">Walk-in</option>
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </Label>
            <div>
              <span className="mb-1 block text-sm font-medium text-stone-700">Items</span>
              <div className="space-y-2">
                {form.lines.map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <select className={inputCls} value={l.item_id} onChange={(e) => setLine(i, { item_id: e.target.value })}>
                      <option value="">Choose an item</option>
                      {menu
                        .filter((m) => m.is_available)
                        .map((m) => (
                          <option key={m.item_id} value={m.item_id}>
                            {m.item_name} ({m.price})
                          </option>
                        ))}
                    </select>
                    <input
                      className={`${inputCls} !w-20`}
                      type="number"
                      min={1}
                      value={l.quantity}
                      onChange={(e) => setLine(i, { quantity: Number(e.target.value) })}
                    />
                    <button
                      type="button"
                      className={danger}
                      disabled={form.lines.length === 1}
                      onClick={() => setForm({ ...form, lines: form.lines.filter((_, n) => n !== i) })}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className={`${ghost} mt-2`} onClick={() => setForm({ ...form, lines: [...form.lines, { item_id: "", quantity: 1 }] })}>
                Add another item
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={ghost} onClick={() => setForm(null)}>
                Cancel
              </button>
              <button className={`${primary} inline-flex items-center gap-2 disabled:opacity-70`} disabled={saving}>
                {saving && <Spinner />}
                {saving ? "Creating order…" : "Create order"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete !== null && (
        <ConfirmDelete
          what={`order #${toDelete} and its items`}
          onConfirm={del}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}

const TABS = ["orders", "menu", "customers", "employees"] as const;

export default function Page() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("orders");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(t);
  }, [error]);

  return (
    <main className="min-h-screen w-full bg-stone-50 px-6 py-6 text-stone-900 lg:px-10">
      <h1 className="mb-5 text-2xl font-semibold tracking-tight">Cafe(?) Management System</h1>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex gap-1 rounded-lg bg-stone-200/70 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setQ("");
              }}
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium capitalize transition ${
                tab === t ? "bg-white text-emerald-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {t === "orders" ? "Orders" : RES[t].label}
            </button>
          ))}
        </nav>
        <input
          className={`${inputCls} !w-64`}
          placeholder={`Search ${tab}`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search"
        />
      </div>

      {error && (
        <div role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {tab === "orders" ? <Orders key="orders" q={q} onError={setError} /> : <Crud key={tab} res={RES[tab]} q={q} onError={setError} />}
    </main>
  );
}
