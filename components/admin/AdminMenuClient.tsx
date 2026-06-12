"use client";

import { useState } from "react";
import { formatPreco } from "@/lib/menu-data";
import type { MenuItem } from "@/lib/types";

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
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Preço</th>
            <th>Ativo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <tr key={item.id}>
              <td>{item.nome}</td>
              <td>{formatPreco(item.preco_centavos)}</td>
              <td>{item.ativo ? "Sim" : "Não"}</td>
              <td>
                <button type="button" onClick={() => setEditing({ ...item })}>
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="admin-edit-modal">
          <h2>Editar item</h2>
          <label>
            Nome
            <input
              value={editing.nome}
              onChange={(e) =>
                setEditing({ ...editing, nome: e.target.value })
              }
            />
          </label>
          <label>
            Descrição
            <textarea
              value={editing.descricao}
              onChange={(e) =>
                setEditing({ ...editing, descricao: e.target.value })
              }
            />
          </label>
          <label>
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
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={editing.ativo}
              onChange={(e) =>
                setEditing({ ...editing, ativo: e.target.checked })
              }
            />
            Ativo
          </label>
          <div className="admin-edit-actions">
            <button type="button" onClick={save}>
              Salvar
            </button>
            <button type="button" onClick={() => setEditing(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
