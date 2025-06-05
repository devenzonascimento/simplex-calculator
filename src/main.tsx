import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Table } from './components/table.tsx'
import { Nlp } from './components/nlp.tsx'
import { OtherLine } from './components/other-line.tsx'
import { FinalTable } from './components/final-table.tsx'
import { Solution } from './components/solution.tsx'

// biome-ignore lint/style/noNonNullAssertion: <explanation>
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

export type TableType = {
  tableRows: TableLine[]
  pivotColNumber: number
  pivotRowNumber: number
  pivotElement: number
}

export type NlpType = {
  rowNumber: number
  pivotRow: TableLine
  newPivotRow: TableLine
  pivotElementToUse: number
}

export type OtherLineType = {
  rowNumber: number
  newPivotRow: TableLine
  multipliedNewPivotRow: TableLine
  originalRow: TableLine
  resultRow: TableLine
  coefficient: number
}

export type FinalTableType = {
  headers: string[]
  table: number[][]
}

export type SolutionType = Record<string, number>

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

    const firstTableRows = [objectiveLine, ...restrictionsLines]

    const firstTableData = generateTableAndPivots(firstTableRows)

    if (!firstTableData) {
      alert('deu ruim')
      return
    }

    const history: History[] = []

    history.push({ state: firstTableData, type: HistoryType.Table })

    let tableData: TableType | null = firstTableData
    // let tableRows: TableLine[] = []

    // setHistory(prev => [
    //   ...prev,
    //   { state: firstTableData, type: HistoryType.Table },
    // ])

    while (true) {
      const nlp = calculateNlp(
        tableData.tableRows[tableData.pivotRowNumber],
        tableData.pivotElement,
        tableData.pivotRowNumber,
      )

      history.push({ state: nlp, type: HistoryType.Nlp })

      const otherLines = calculateOthersLine(nlp.newPivotRow, tableData)

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
            headers: [
              'Z',
              ...tableRowsSorted[0].Xs.map((_, i) => `X${i + 1}`),
              ...tableRowsSorted[0].XFs.map((_, i) => `XF${i + 1}`),
              'B',
            ],
            table: tableRowsSorted.map(r => [r.Z, ...r.Xs, ...r.XFs, r.B]),
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

  const finalizeSimplex = (tableRows: TableLine[]) => {
    const objectiveLine = tableRows[0]

    if (
      objectiveLine.Z >= 0 &&
      objectiveLine.Xs.every(x => x >= 0) &&
      objectiveLine.XFs.every(xf => xf >= 0) &&
      objectiveLine.B >= 0
    ) {
      const map: Record<string, number[]> = {}

      for (const row of tableRows) {
        row.Xs.forEach((x, index) => {
          const key = `X${index + 1}`

          if (!map[key]) {
            map[key] = []
          }

          map[key].push(x)
        })

        row.XFs.forEach((xf, index) => {
          const key = `XF${index + 1}`

          if (!map[key]) {
            map[key] = []
          }

          map[key].push(xf)
        })
      }

      const variables: Record<string, number> = {}

      for (const key in map) {
        const value = map[key]

        variables[key] =
          value.reduce((acc, v) => acc + v) === 1
            ? tableRows[value.indexOf(1)].B
            : 0
      }
      return {
        maxLucro: objectiveLine.B,
        ...variables,
      }
    }
  }

  const generateTableAndPivots = (tableRows: TableLine[]): TableType | null => {
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
    newPivotRow: TableLine,
    tableData: TableType,
  ): OtherLineType[] => {
    const result: OtherLineType[] = []

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

      const otherLine: OtherLineType = {
        rowNumber: rowIndex,
        newPivotRow,
        multipliedNewPivotRow,
        originalRow: row,
        resultRow,
        coefficient: co,
      }

      // TODO: Verificar mais algumas regras de simplex para ter certeza sobre o calculo.
      // TODO: Criar um novo tipo chamado tabela final
      // TODO: Criar apresentação de solução com prova real
      // TODO: Componentizar e implementar o loop de soluções.

      result.push(otherLine)
    })

    return result
  }

  const calculatePivotCol = (firstLine: TableLine) => {
    let max = 0
    let index = 0
    let assign = false

    firstLine.Xs.forEach((x, i) => {
      if (max < Math.abs(x)) {
        max = Math.abs(x)
        assign = true
        index = i + 1
      }
    })

    return assign ? index : null
  }

  const calculatePivotRow = (
    tableRows: TableLine[],
    pivotColNumber: number,
  ) => {
    let min = Number.MAX_SAFE_INTEGER
    let index = 0
    let assign = false

    tableRows.forEach((row, rowIndex) => {
      if (rowIndex === 0) {
        return
      }

      const co = row.Xs?.[pivotColNumber - 1]

      const value = row.B / co

      if (min > value) {
        min = value
        assign = true
        index = rowIndex
      }
    })

    return assign ? index : null
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
    pivotRowNumber: number,
  ): NlpType => {
    const newPivotRow = {
      Z: pivotTableLine.Z / pivotElement,
      Xs: pivotTableLine.Xs.map(x => x / pivotElement),
      XFs: pivotTableLine.XFs.map(x => x / pivotElement),
      B: pivotTableLine.B / pivotElement,
    }

    return {
      rowNumber: pivotRowNumber,
      newPivotRow,
      pivotRow: pivotTableLine,
      pivotElementToUse: pivotElement,
    }
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
                <h2>
                  <strong>(NLP)</strong> Nova linha {state.rowNumber + 1}ª
                </h2>
                <Nlp data={state} />
              </div>
            )
          case HistoryType.OtherLine:
            return (
              <div className="flex flex-col">
                <h2>Nova linha {state.rowNumber + 1}ª</h2>
                <OtherLine data={state} />
              </div>
            )
          case HistoryType.FinalTable:
            return (
              <div className="flex flex-col">
                <h2>Tabela final</h2>
                <FinalTable data={state} />
              </div>
            )
          case HistoryType.Solution:
            return (
              <div className="flex flex-col">
                <h2>Solução:</h2>
                <Solution data={state} />
              </div>
            )
          default:
            break
        }
      })}
    </main>
  )
}
