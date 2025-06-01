// src/components/TableauDisplay.tsx

import React from 'react'
import Fraction from 'fraction.js'
import type { TableauState } from '../simplex'

interface Props {
  state: TableauState
  step: number
}

export const TableauDisplay: React.FC<Props> = ({ state, step }) => {
  const { T, B, cost, basic, pivotCol, pivotRow } = state
  const m = T.length
  const totalVars = cost.length // é igual a n + m

  // Gera cabeçalhos: x1, x2, …, x_{totalVars}, depois “b”
  const varHeaders = Array.from({ length: totalVars }, (_, j) => `x${j + 1}`)

  // Função utilitária para renderizar uma Fraction como número com uma ou duas casas decimais
  const fmt = (f: Fraction) => {
    // Se for inteiro, mostra sem decimal; senão, com 2 casas
    return f.d === 1 ? f.n.toString() : f.valueOf().toFixed(2)
  }

  return (
    <div className="border rounded-md p-4 mb-6">
      {step === 0 ? (
        <h3 className="font-semibold text-gray-800 mb-2">Tableau Inicial</h3>
      ) : (
        <h3 className="font-semibold text-gray-800 mb-2">
          Tableau {step} – pivot em coluna{' '}
          <span className="font-medium">x{pivotCol! + 1}</span>, linha{' '}
          <span className="font-medium">{pivotRow! + 1}</span>
        </h3>
      )}

      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1">Basic</th>
            {varHeaders.map(h => (
              <th key={h} className="border px-2 py-1">
                {h}
              </th>
            ))}
            <th className="border px-2 py-1">b</th>
          </tr>
        </thead>
        <tbody>
          {T.map((row, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">x{basic[i] + 1}</td>
              {row.map((v, j) => (
                <td key={j} className="border px-2 py-1 text-right">
                  {fmt(v)}
                </td>
              ))}
              <td className="border px-2 py-1 text-right">{fmt(B[i])}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="border px-2 py-1"></td>
            {cost.map((c, j) => (
              <td key={j} className="border px-2 py-1 text-right">
                {fmt(c)}
              </td>
            ))}
            <td className="border px-2 py-1 text-right">0</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
