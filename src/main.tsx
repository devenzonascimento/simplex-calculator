import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import Fraction from 'fraction.js'
import { HistoryManager } from './components/history.tsx'
export const F = (val: number | string) => new Fraction(val)
// Função utilitária para renderizar uma Fraction como número com uma ou duas casas decimais
export const fmt = (f: Fraction) => {
  // Se for inteiro, mostra sem decimal; senão, com 2 casas
  return Number(f.d) === 1 ? f.n.toString() : f.valueOf().toFixed(2)
}

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <NewSimplex />
  </StrictMode>,
)

export type TableRow = {
  // variables
  v: number
  // restrictions
  r: number
  cells: Fraction[]
}
export type TableLine = {
  Z: Fraction
  Xs: Fraction[]
  XFs: Fraction[]
  B: Fraction
}

export type TableType = {
  tableRows: TableRow[]
  pivotColNumber: number
  pivotRowNumber: number
  pivotElement: Fraction
}

export type NlpType = {
  rowNumber: number
  pivotRow: TableRow
  newPivotRow: TableRow
  pivotElementToUse: Fraction
}

export type OtherLineType = {
  rowNumber: number
  newPivotRow: TableRow
  multipliedNewPivotRow: TableRow
  originalRow: TableRow
  resultRow: TableRow
  coefficient: Fraction
}

export type FinalTableType = {
  headers: string[]
  table: Fraction[][]
}

export type SolutionType = Record<string, Fraction>

export enum HistoryType {
  Table = 0,
  Nlp = 1,
  OtherLine = 2,
  FinalTable = 3,
  Solution = 4,
}

export type History =
  | {
      state: TableType
      type: HistoryType.Table
    }
  | {
      state: NlpType
      type: HistoryType.Nlp
    }
  | {
      state: OtherLineType
      type: HistoryType.OtherLine
    }
  | {
      state: FinalTableType
      type: HistoryType.FinalTable
    }
  | {
      state: SolutionType
      type: HistoryType.Solution
    }

const finalizeSimplex = (tableRows: TableRow[]) => {
  console.log(tableRows.map(r => r.cells.map(c => c.valueOf())))
  const objectiveRow = tableRows[0]

  if (objectiveRow.cells.every(c => c.gte(0))) {
    const result: Record<string, Fraction> = {}

    const tableCols = new Map<number, Fraction[]>()

    for (let i = 0; i < tableRows.length; i++) {
      const { cells } = tableRows[i]

      for (let j = 0; j < cells.length; j++) {
        const cell = cells[j]

        const colValues = tableCols.get(j)

        if (!colValues) {
          tableCols.set(j, [cell])
          continue
        }

        colValues?.push(cell)
      }
    }

    tableCols.forEach((col, key) =>
      console.log(
        key,
        ': ',
        col.map(c => c.valueOf()),
      ),
    )

    tableCols.forEach((cells, key) => {
      const bIndex = columnContainsOnlyOneNumberOne(cells)

      if (bIndex >= 0) {
        const row = tableRows[bIndex]
        const variableKey = getKey(tableRows[0], key)

        result[variableKey] = row.cells?.[row.cells.length - 1]
      }

      result[getKey(tableRows[0], key)] = F(0)
    })

    return result
  }
}

const getKey = (row: TableRow, cellIndex: number) => {
  if (cellIndex === 0) {
    return 'z'
  }

  if (cellIndex === row.cells.length - 1) {
    return 'b'
  }

  if (cellIndex > 0 && cellIndex <= row.v) {
    return `x${cellIndex}`
  }

  if (cellIndex > row.v && cellIndex <= row.v + row.r) {
    return `xf${cellIndex}`
  }

  return 'unknown'
}

const columnContainsOnlyOneNumberOne = (columnCells: Fraction[]) => {
  let numberOneIndex = -1

  for (let i = 0; i < columnCells.length; i++) {
    const cell = columnCells[i]

    if (!cell.equals(1)) {
      continue
    }

    if (numberOneIndex !== -1) {
      return -1
    }

    numberOneIndex = i
  }

  return numberOneIndex
}

export const generateTableHeaders = (tableRows: TableRow[]) => {
  return tableRows[0].cells.map((_, i) => getKey(tableRows[0], i))
}

const generateTableAndPivots = (tableRows: TableRow[]): TableType | null => {
  const pivotColNumber = calculatePivotCol(tableRows[0])

  if (!pivotColNumber) return null

  const pivotRowNumber = calculatePivotRow(tableRows, pivotColNumber)

  if (!pivotRowNumber) return null

  const pivotElement = calculatePivotElement(
    tableRows,
    pivotColNumber,
    pivotRowNumber,
  )

  return {
    pivotColNumber,
    pivotRowNumber,
    pivotElement,
    tableRows,
  }
}

const calculateOthersLine = (
  { tableRows, pivotColNumber, pivotRowNumber }: TableType,
  newPivotRow: TableRow,
): OtherLineType[] => {
  const result: OtherLineType[] = []

  tableRows.forEach((row, rowIndex) => {
    // Não recalcula a NLP
    if (rowIndex === pivotRowNumber) {
      return
    }

    const coefficient = row.cells[pivotColNumber].neg()

    const multipliedNewPivotRow: TableRow = {
      ...newPivotRow,
      cells: newPivotRow.cells.map(x => x.mul(coefficient)),
    }

    const resultRow: TableRow = {
      ...newPivotRow,
      cells: multipliedNewPivotRow.cells.map((c, i) => c.add(row.cells?.[i])),
    }

    result.push({
      rowNumber: rowIndex,
      newPivotRow,
      multipliedNewPivotRow,
      originalRow: row,
      resultRow,
      coefficient: coefficient,
    })
  })

  return result
}

const calculatePivotCol = (firstLine: TableRow) => {
  let max = F(0)
  let index = 0
  let assign = false

  firstLine.cells.forEach((x, i) => {
    if (x.lt(max)) {
      max = x
      index = i
      assign = true
    }
  })

  return assign ? index : null
}

const calculatePivotRow = (tableRows: TableRow[], pivotColNumber: number) => {
  let min = F(Number.MAX_SAFE_INTEGER)
  let index = 0
  let assign = false

  tableRows.forEach((row, rowIndex) => {
    // Pula a função objetivo
    if (rowIndex === 0) {
      return
    }

    const coefficient = row.cells?.[pivotColNumber]

    if (coefficient.equals(0)) {
      return
    }

    const result = row.cells?.[row.cells.length - 1]?.div(coefficient)

    if (min.gt(result)) {
      min = result
      assign = true
      index = rowIndex
    }
  })

  return assign ? index : null
}

const calculatePivotElement = (
  tableRows: TableRow[],
  pivotColNumber: number,
  pivotRowNumber: number,
) => {
  const Table2D = tableRows.map(r => r.cells)

  return Table2D[pivotRowNumber][pivotColNumber]
}

const calculateNlp = ({
  tableRows,
  pivotRowNumber,
  pivotElement,
}: TableType): NlpType => {
  const pivotRow = tableRows?.[pivotRowNumber]

  const newPivotRow = {
    ...pivotRow,
    cells: pivotRow.cells.map(c => c.div(pivotElement)),
  }

  return {
    rowNumber: pivotRowNumber,
    newPivotRow,
    pivotRow,
    pivotElementToUse: pivotElement,
  }
}

export function NewSimplex() {
  const [history, setHistory] = useState<History[]>([])
  // const [objective, setObjective] = useState('5x1 + 2x2')
  // const [restrictions, setRestrictions] = useState<string[]>([
  //   '10x1 + 12x2 <= 60',
  //   '2x1 + x2 <= 6',
  // ])
  const [objective, setObjective] = useState('10x1 + 12x2')
  const [restrictions, setRestrictions] = useState<string[]>([
    'x1 + x2 <= 100',
    'x1 + 3x2 <= 270',
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

  const extractObjectiveCOs = (exp: string): Fraction[] => {
    const parts = exp.split(' ')
    const result: Fraction[] = []

    for (const part of parts) {
      const xIndex = part.indexOf('x')
      if (xIndex === -1) continue

      const co = part.slice(0, xIndex)
      const value = co === '' ? F(-1) : F(co).neg()
      result.push(value)
    }

    return result
  }

  const extractRestrictionCOs = (exp: string): Fraction[] => {
    const parts = exp.split(' ')

    const variablesCounter: Fraction[] = []

    for (const part of parts) {
      if (part === '<=' || part === '+' || part === '') continue

      const xIndex = part.indexOf('x')

      if (xIndex === -1) {
        variablesCounter.push(F(part))
        continue
      }

      const co = part.slice(0, xIndex)
      variablesCounter.push(co === '' ? F(1) : F(co))
    }

    return variablesCounter
  }

  const handleSubmit = () => {
    const restrictionRows: TableRow[] = restrictions.map(
      (restriction, index) => {
        const coefficients = extractRestrictionCOs(restriction)

        const b = coefficients.pop() as Fraction

        const xs = coefficients

        const xfs = restrictions.map((_, i) => (i === index ? F(1) : F(0)))

        return {
          v: xs.length,
          r: restrictions.length,
          cells: [F(0), ...xs, ...xfs, b],
        }
      },
    )

    const coefficients = extractObjectiveCOs(objective)

    const objectiveRow: TableRow = {
      v: coefficients.length,
      r: restrictions.length,
      cells: [
        F(1),
        ...coefficients,
        ...Array.from({ length: restrictions.length }, () => F(0)),
        F(0),
      ],
    }

    const firstTableRows = [objectiveRow, ...restrictionRows]

    const firstTableData = generateTableAndPivots(firstTableRows)

    if (!firstTableData) {
      alert('deu ruim')
      return
    }

    const history: History[] = []

    history.push({ state: firstTableData, type: HistoryType.Table })

    let tableData: TableType | null = firstTableData

    while (true) {
      const nlp = calculateNlp(tableData)

      history.push({ state: nlp, type: HistoryType.Nlp })

      const otherLines = calculateOthersLine(tableData, nlp.newPivotRow)

      // biome-ignore lint/complexity/noForEach: <explanation>
      otherLines.forEach(otherLine => {
        history.push({ state: otherLine, type: HistoryType.OtherLine })
      })

      const tempTableRows = [
        { index: nlp.rowNumber, newLine: nlp.newPivotRow },
        ...otherLines.map(o => ({ index: o.rowNumber, newLine: o.resultRow })),
      ]

      const tableRowsSorted = tempTableRows
        .sort((a, b) => a.index - b.index)
        .map(t => t.newLine)

      const result = finalizeSimplex(tableRowsSorted)

      if (result) {
        history.push({
          state: {
            headers: generateTableHeaders(tableRowsSorted),
            table: tableRowsSorted.map(r => r.cells),
          },
          type: HistoryType.FinalTable,
        })
        history.push({ state: result, type: HistoryType.Solution })
        break
      }

      tableData = generateTableAndPivots(tableRowsSorted)

      if (!tableData) {
        alert('deu ruim')
        return
      }

      history.push({ state: tableData, type: HistoryType.Table })
    }

    setHistory(history)
  }

  return (
    <main className="w-full m-4 p-4 flex flex-col items-center gap-3 border border-zinc-400 rounded-xl">
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

      {history.map(({ state, type }, index) => (
        <div key={`${type}-${index.toString()}`} className="flex flex-col">
          {/* @ts-ignore */}
          <HistoryManager state={state} type={type} />
        </div>
      ))}
    </main>
  )
}
