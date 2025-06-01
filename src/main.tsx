import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <NewSimplex />
  </StrictMode>,
)

type TableLine = {
  Z: number
  Xs: number[]
  XFs: number[]
  B: number
}

export function NewSimplex() {
  const [tableData, setTableData] = useState<TableLine[]>([])
  const [objective, setObjective] = useState('5x1 + 2x2')
  const [restrictions, setRestrictions] = useState<string[]>([
    '10x1 + 12x2 <= 60',
    '2x1 + x2 <= 6',
  ])

  const handleRestrictionChange = (index: number, restriction: string) => {
    setRestrictions(prev =>
      prev.map((r, i) => {
        if (i === index) {
          return restriction
        }

        return r
      }),
    )
  }

  const handleAddRestriction = () => {
    if (restrictions[restrictions.length - 1] === '') {
      return
    }

    setRestrictions(prev => [...prev, ''])
  }

  const handleRemoveRestriction = (index: number) => {
    setRestrictions(prev => prev.filter((_, i) => i !== index))
  }

  const extractObjectiveCOs = (exp: string) => {
    const parts = exp.split(' ')

    const result = []

    for (const part of parts) {
      const xIndex = part.indexOf('x')

      if (xIndex === -1) {
        continue
      }

      const co = part.slice(0, xIndex)

      const value = co === '' ? 1 : Number(co)

      result.push(value * -1)
    }

    return result
  }

  const extractRestrictionCOs = (exp: string): TableLine => {
    const parts = exp.split(' ')

    const Xs = []
    const XFs = []
    let B = 0

    for (const part of parts) {
      if (part === '<=') {
        // result.push(part)
        continue
      }

      const xIndex = part.indexOf('x')

      if (xIndex === -1) {
        B = Number(B)
        continue
      }

      const co = part.slice(0, xIndex)

      Xs.push(co === '' ? 1 : Number(co))
      XFs.push(0)
    }

    return {
      Z: 0,
      Xs,
      XFs,
      B,
    }
  }

  const handleSubmit = () => {
    // Fazer o parser da função objetivo
    const coefficients = extractObjectiveCOs(objective)

    const objectiveLine: TableLine = {
      Z: 1,
      Xs: coefficients.map(Number),
      XFs: Array.from({ length: coefficients.length }, () => 0),
      B: 0,
    }

    const restrictionsLines: TableLine[] = []

    restrictions.forEach((restriction, index) => {
      const line = extractRestrictionCOs(restriction)

      restrictionsLines.push({
        ...line,
        XFs: line.XFs.map((_, i) => (i === index ? 1 : 0)),
      })
    })

    setTableData([objectiveLine, ...restrictionsLines])
  }

  return (
    <main className="max-w-[550px] m-4 p-4 flex flex-col gap-3 border border-zinc-400 rounded-xl">
      <fieldset className="flex flex-col">
        <label htmlFor="objective">Função objetivo:</label>
        <input
          id="objective"
          type="text"
          className="text-sm p-1 border border-zinc-400 rounded-lg"
          value={objective}
          onChange={e => setObjective(e.target.value)}
        />
      </fieldset>

      <fieldset className="flex flex-col">
        <div className="mb-1 flex items-center justify-between">
          <span>Restrições:</span>
          <button
            type="button"
            className="text-sm py-1 px-2 border border-zinc-400 rounded-md"
            onClick={handleAddRestriction}
          >
            Adicionar restrição
          </button>
        </div>

        {restrictions.map((restriction, index) => (
          <div
            key={index.toString()}
            className="w-full flex items-center gap-2"
          >
            <input
              type="text"
              className="flex-1 text-sm p-1 border border-zinc-400 rounded-lg"
              value={restriction}
              onChange={e => handleRestrictionChange(index, e.target.value)}
            />

            <button
              type="button"
              className="text-sm py-1 px-2 border border-zinc-400 rounded-md"
              onClick={() => handleRemoveRestriction(index)}
            >
              Remover
            </button>
          </div>
        ))}
      </fieldset>

      <button
        type="button"
        className="mx-auto text py-1 px-2 border border-zinc-400 rounded-md"
        onClick={handleSubmit}
      >
        Gerar tabela
      </button>

      {tableData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-zinc-400 rounded-lg mt-4">
            <thead>
              <tr>
                <th className="px-3 py-2 border border-zinc-300 text-center bg-zinc-100">
                  Z
                </th>
                {tableData?.[0].Xs.map((_, i) => (
                  <th
                    key={i.toString()}
                    className="px-3 py-2 border border-zinc-300 text-center bg-zinc-100"
                  >
                    X{i + 1}
                  </th>
                ))}
                {tableData?.[0].XFs.map((_, i) => (
                  <th
                    key={i.toString()}
                    className="px-3 py-2 border border-zinc-300 text-center bg-zinc-100"
                  >
                    XF{i + 1}
                  </th>
                ))}
                <th className="px-3 py-2 border border-zinc-300 text-center bg-zinc-100">
                  B
                </th>
              </tr>
            </thead>

            <tbody>
              {tableData.map((line, lineIndex) => (
                <tr key={lineIndex.toString()}>
                  <td className="px-3 py-2 border border-zinc-300 text-center">
                    {line.Z}
                  </td>
                  {line.Xs.map((x, i) => (
                    <td
                      key={i.toString()}
                      className="px-3 py-2 border border-zinc-300 text-center"
                    >
                      {x}
                    </td>
                  ))}
                  {line.XFs.map((xf, i) => (
                    <td
                      key={i.toString()}
                      className="px-3 py-2 border border-zinc-300 text-center"
                    >
                      {xf}
                    </td>
                  ))}
                  <td className="px-3 py-2 border border-zinc-300 text-center">
                    {line.B}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
