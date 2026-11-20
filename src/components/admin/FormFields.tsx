"use client";

import { useId } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { emptyRecord, type FieldDef } from "@/lib/fields";
import { LocalImageField } from "./LocalImageField";
import { inputCls } from "./ui";

type Rec = Record<string, unknown>;

/** Renders any FieldDef[] as a form. The same definitions validate on the server. */
export function FormFields({ fields, value, onChange }: { fields: FieldDef[]; value: Rec; onChange: (next: Rec) => void }) {
  return (
    <div className="space-y-5">
      {fields.map((f) => (
        <Field key={f.name} def={f} value={value?.[f.name]} onChange={(v) => onChange({ ...value, [f.name]: v })} />
      ))}
    </div>
  );
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-wide text-white/80">
      {children}
      {required && <span className="text-brand"> *</span>}
    </label>
  );
}

function Help({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={id} className="mt-1 text-xs text-muted">
      {text}
    </p>
  ) : null;
}

function Field({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const id = useId();
  const helpId = `${id}-help`;
  const str = typeof value === "string" ? value : value == null ? "" : String(value);
  const required = "required" in def && def.required;

  switch (def.type) {
    case "text":
    case "link":
    case "email":
    case "phone":
      return (
        <div>
          <Label htmlFor={id} required={required}>
            {def.label}
          </Label>
          <input
            id={id}
            type={def.type === "email" ? "email" : def.type === "phone" ? "tel" : "text"}
            value={str}
            maxLength={"max" in def ? def.max : 500}
            placeholder={def.type === "link" ? "/contact, #section or https://…" : undefined}
            onChange={(e) => onChange(e.target.value)}
            aria-describedby={def.help ? helpId : undefined}
            className={inputCls}
          />
          <Help id={helpId} text={def.help} />
        </div>
      );
    case "textarea":
      return (
        <div>
          <Label htmlFor={id} required={required}>
            {def.label}
          </Label>
          <textarea
            id={id}
            rows={def.rows ?? 4}
            value={str}
            maxLength={def.max}
            onChange={(e) => onChange(e.target.value)}
            aria-describedby={def.help ? helpId : undefined}
            className={inputCls}
          />
          <div className="mt-1 flex justify-between gap-2">
            <Help id={helpId} text={def.help} />
            {def.max && <span className="ml-auto text-[0.7rem] text-muted">{str.length}/{def.max}</span>}
          </div>
        </div>
      );
    case "number":
      return (
        <div>
          <Label htmlFor={id} required={required}>
            {def.label}
          </Label>
          <input
            id={id}
            type="number"
            value={value === null || value === undefined ? "" : String(value)}
            min={def.min}
            max={def.max}
            step="any"
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            className={`${inputCls} max-w-48`}
          />
          <Help id={helpId} text={def.help} />
        </div>
      );
    case "toggle":
      return (
        <label htmlFor={id} className="flex cursor-pointer items-center gap-3 text-sm text-white">
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-[#FFD900]" />
          {def.label}
        </label>
      );
    case "select":
      return (
        <div>
          <Label htmlFor={id}>{def.label}</Label>
          <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className={`${inputCls} max-w-xs`}>
            {def.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "stringList": {
      const list = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          <Label htmlFor={id}>{def.label}</Label>
          <textarea
            id={id}
            rows={Math.max(3, list.length + 1)}
            value={list.join("\n")}
            onChange={(e) => onChange(e.target.value.split("\n"))}
            onBlur={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
            aria-describedby={helpId}
            className={inputCls}
          />
          <Help id={helpId} text={`${def.help ? `${def.help} ` : ""}One item per line.`} />
        </div>
      );
    }
    case "image":
      return <LocalImageField label={def.label} value={str} onChange={onChange} folder={def.folder ?? "pages"} help={def.help} />;
    case "group":
      return (
        <fieldset className="border border-white/10 p-4 sm:p-5">
          <legend className="px-2 font-condensed text-sm font-bold uppercase tracking-widest text-brand">{def.label}</legend>
          {def.help && <p className="mb-3 text-xs text-muted">{def.help}</p>}
          <FormFields fields={def.fields} value={(value as Rec) ?? {}} onChange={onChange} />
        </fieldset>
      );
    case "list": {
      const items = Array.isArray(value) ? (value as Rec[]) : [];
      const move = (i: number, d: -1 | 1) => {
        const next = [...items];
        [next[i], next[i + d]] = [next[i + d], next[i]];
        onChange(next);
      };
      return (
        <fieldset className="border border-white/10 p-4 sm:p-5">
          <legend className="px-2 font-condensed text-sm font-bold uppercase tracking-widest text-brand">{def.label}</legend>
          <ol className="space-y-4">
            {items.map((item, i) => (
              <li key={i} className="border-l-2 border-brand/50 bg-black/30 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="font-condensed text-xs font-bold uppercase tracking-widest text-white/70">
                    {def.itemLabel ?? "Item"} {i + 1}
                  </span>
                  <div className="flex gap-1">
                    <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowUp className="size-4" />
                    </IconBtn>
                    <IconBtn label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                      <ArrowDown className="size-4" />
                    </IconBtn>
                    <IconBtn label="Remove" danger onClick={() => onChange(items.filter((_, k) => k !== i))}>
                      <Trash2 className="size-4" />
                    </IconBtn>
                  </div>
                </div>
                <FormFields fields={def.fields} value={item} onChange={(v) => onChange(items.map((x, k) => (k === i ? v : x)))} />
              </li>
            ))}
          </ol>
          {items.length < (def.maxItems ?? 30) && (
            <button
              type="button"
              onClick={() => onChange([...items, emptyRecord(def.fields)])}
              className="mt-4 inline-flex items-center gap-1.5 border border-dashed border-white/25 px-3 py-2 font-condensed text-xs font-bold uppercase text-white hover:border-brand hover:text-brand"
            >
              <Plus className="size-4" aria-hidden="true" /> Add {def.itemLabel ?? "item"}
            </button>
          )}
        </fieldset>
      );
    }
  }
}

function IconBtn({ children, label, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex size-8 items-center justify-center border border-white/15 disabled:opacity-30 ${danger ? "text-red-300 hover:bg-red-500/10" : "text-white hover:border-brand hover:text-brand"}`}
    >
      {children}
    </button>
  );
}
