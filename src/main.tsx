import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Table } from './components/table.tsx'
import { Nlp } from './components/nlp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <NewSimplex />
  </StrictMode>,
)

export type TableLine = {
  Z: number
  Xs: number[]
  XFs: number[]
  B: number
}

export type Table = {
  tableRows: TableLine[]
  pivotColNumber: number
  pivotRowNumber: number
  pivotElement: number
}

export type Nlp = {
  pivotRow: TableLine
  newPivotRow: TableLine
  pivotElementToUse: number
}

export type OtherLine = {
  newPivotRow: TableLine
  multipliedNewPivotRow: TableLine
  originalRow: TableLine
  resultRow: TableLine
}

export enum HistoryType {
  Table = 0,
  Nlp = 1,
  OtherLine = 2,
}

export type History =
  | {
      state: Table
      type: HistoryType.Table
    }
  | {
      state: Nlp
      type: HistoryType.Nlp
    }
  | {
      state: OtherLine
      type: HistoryType.OtherLine
    }

export function NewSimplex() {
  const [history, setHistory] = useState<History[]>([])
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
      if (part === '<=' || part === '+') {
        // result.push(part)
        continue
      }

      const xIndex = part.indexOf('x')

      if (xIndex === -1) {
        B = Number(part)
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

    const tableRows = [objectiveLine, ...restrictionsLines]

    const pivotColNumber = calculatePivotCol(objectiveLine)

    const pivotRowNumber = calculatePivotRow(tableRows, pivotColNumber)

    const pivotElement = calculatePivotElement(
      tableRows,
      pivotColNumber,
      pivotRowNumber,
    )

    const firstTableData = {
      pivotColNumber,
      pivotRowNumber,
      pivotElement,
      tableRows,
    }

    const history: History[] = []

    history.push({ state: firstTableData, type: HistoryType.Table })

    // setHistory(prev => [
    //   ...prev,
    //   { state: firstTableData, type: HistoryType.Table },
    // ])

    while (true) {
      const nlp = calculateNlp(tableRows[pivotRowNumber], pivotElement)

      history.push({ state: nlp, type: HistoryType.Nlp })

      const otherLines = calculateOthersLine(nlp.newPivotRow, firstTableData)
      // TODO: Terminar de calcular as outras linhas, jogar elas no historico e identificar elas para não repetir e depois montar a nova tabela e assim segue em loop infinito
      break
    }

    setHistory(history)
  }

  const calculateOthersLine = (
    newPivotRow: TableLine,
    tableData: Table,
  ): OtherLine[] => {
    const result: OtherLine[] = []

    tableData.tableRows.forEach((row, rowIndex) => {
      // Se for a NLP retorna
      if (rowIndex === tableData.pivotRowNumber) {
        return
      }

      const co = row.Xs[tableData.pivotColNumber - 1] * -1

      const multipliedNewPivotRow = {
        Z: newPivotRow.Z * co,
        Xs: newPivotRow.Xs.map(x => x * co),
        XFs: newPivotRow.XFs.map(x => x * co),
        B: newPivotRow.B * co,
      }

      const resultRow = {
        Z: multipliedNewPivotRow.Z + row.Z,
        Xs: multipliedNewPivotRow.Xs.map((x, i) => x + row.Xs[i]),
        XFs: multipliedNewPivotRow.XFs.map((xf, i) => xf + row.XFs[i]),
        B: multipliedNewPivotRow.B + row.B,
      }

      const otherLine: OtherLine = {
        newPivotRow,
        multipliedNewPivotRow,
        originalRow: row,
        resultRow,
      }

      result.push(otherLine)
    })

    return result
  }

  const calculatePivotCol = (firstLine: TableLine) => {
    let max = 0
    let index = 0

    firstLine.Xs.forEach((x, i) => {
      if (max < Math.abs(x)) {
        max = Math.abs(x)
        index = i + 1
      }
    })

    return index
  }

  const calculatePivotRow = (
    tableRows: TableLine[],
    pivotColNumber: number,
  ) => {
    let min = Number.MAX_SAFE_INTEGER
    let index = 0

    tableRows.forEach((row, rowIndex) => {
      if (rowIndex === 0) {
        return
      }

      const co = row.Xs?.[pivotColNumber - 1]

      const value = row.B / co

      if (min > value) {
        min = value
        index = rowIndex
      }
    })

    return index
  }

  const calculatePivotElement = (
    tableRows: TableLine[],
    pivotColNumber: number,
    pivotRowNumber: number,
  ) => {
    const Table2D = tableRows.map(r => [r.Z, ...r.Xs, ...r.XFs, r.B])

    return Table2D[pivotRowNumber][pivotColNumber]
  }

  const calculateNlp = (
    pivotTableLine: TableLine,
    pivotElement: number,
  ): Nlp => {
    const newPivotRow = {
      Z: pivotTableLine.Z / pivotElement,
      Xs: pivotTableLine.Xs.map(x => x / pivotElement),
      XFs: pivotTableLine.XFs.map(x => x / pivotElement),
      B: pivotTableLine.B / pivotElement,
    }

    return {
      newPivotRow,
      pivotRow: pivotTableLine,
      pivotElementToUse: pivotElement,
    }
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

      {history.map(({ state, type }) => {
        switch (type) {
          case HistoryType.Table:
            return (
              <div className="flex flex-col">
                <h2>Table</h2>
                <Table data={state} />
              </div>
            )
          case HistoryType.Nlp:
            return (
              <div className="flex flex-col">
                <h2>NLP</h2>
                <Nlp data={state} />
              </div>
            )
          case HistoryType.OtherLine:
            return <div>Outra linha</div>

          default:
            break
        }
      })}
    </main>
  )
}
