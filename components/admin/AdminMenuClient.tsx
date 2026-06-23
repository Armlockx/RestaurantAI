"use client";

import { useState } from "react";
import { formatPreco } from "@/lib/menu-data";
import type { MenuItem } from "@/lib/types";

const inputClass =
  "rounded-button border border-border px-3 py-2 text-sm outline-none focus:border-brand";
const labelClass = "flex flex-col gap-1.5 text-xs font-semibold text-text";

export function AdminMenuClient({ items }: { items: MenuItem[] }) {
  const [list, setList] = useState(items);
  const [editing, setEditing] = useState<MenuItem | null>(null);

  const save = async () => {
    if (!editing) return;
    const res = await fetch("/api/admin/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing.id,
        nome: editing.nome,
        descricao: editing.descricao,
        preco_centavos: editing.preco_centavos,
        ativo: editing.ativo,
      }),
    });
    if (res.ok) {
      setList((prev) =>
        prev.map((i) => (i.id === editing.id ? { ...editing } : i))
      );
      setEditing(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              <th className="px-3 py-2 text-left font-semibold text-text">Nome</th>
              <th className="px-3 py-2 text-left font-semibold text-text">Preço</th>
              <th className="px-3 py-2 text-left font-semibold text-text">Ativo</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id} className="border-b border-border">
                <td className="px-3 py-2">{item.nome}</td>
                <td className="px-3 py-2">{formatPreco(item.preco_centavos)}</td>
                <td className="px-3 py-2">{item.ativo ? "Sim" : "Não"}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="rounded-button border border-border px-3 py-1.5 text-xs font-semibold text-text transition-colors hover:bg-surface-muted"
                    onClick={() => setEditing({ ...item })}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-item-title"
        >
          <div className="flex w-full max-w-md flex-col gap-3 rounded-card bg-surface p-5 shadow-xl">
            <h2 id="edit-item-title" className="m-0 text-lg font-bold text-text">
              Editar item
            </h2>
            <label className={labelClass}>
              Nome
              <input
                value={editing.nome}
                onChange={(e) =>
                  setEditing({ ...editing, nome: e.target.value })
                }
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Descrição
              <textarea
                value={editing.descricao}
                onChange={(e) =>
                  setEditing({ ...editing, descricao: e.target.value })
                }
                rows={3}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Preço (centavos)
              <input
                type="number"
                value={editing.preco_centavos}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    preco_centavos: parseInt(e.target.value, 10) || 0,
                  })
                }
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-text">
              <input
                type="checkbox"
                checked={editing.ativo}
                onChange={(e) =>
                  setEditing({ ...editing, ativo: e.target.checked })
                }
              />
              Ativo
            </label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={save}
                className="rounded-button bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-neutral-800"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-button border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-surface-muted"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
