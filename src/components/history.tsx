import {
  fmt,
  HistoryType,
  type FinalTableType,
  type History,
  type NlpType,
  type OtherLineType,
  type SolutionType,
  type TableType,
} from '../main'
import { FinalTable } from './final-table'
import { Nlp } from './nlp'
import { OtherLine } from './other-line'
import { Solution } from './solution'
import { Table } from './table'

// export type History = {
//   state: TableType | NlpType | OtherLineType | FinalTableType | SolutionType
//   type:
//     | HistoryType.Table
//     | HistoryType.Nlp
//     | HistoryType.OtherLine
//     | HistoryType.FinalTable
//     | HistoryType.Solution
// }

export function HistoryManager({ state, type }: History) {
  switch (type) {
    case HistoryType.Table:
      return (
        <>
          <h2>{state.tableNumber}ª Tabela</h2>
          <Table data={state} />
        </>
      )
    case HistoryType.Nlp:
      return (
        <>
          <h2 className="px-2 flex items-center justify-between">
            <span>
              <strong>(NLP)</strong> Nova {state.rowNumber + 1}ª linha
            </span>
            <span>Dividindo pelo {fmt(state.pivotElementToUse)}</span>
          </h2>
          <Nlp data={state} />
        </>
      )
    case HistoryType.OtherLine:
      return (
        <>
          <h2 className="px-2 flex items-center justify-between">
            <span>Nova {state.rowNumber + 1}ª linha</span>

            <span>Multiplicando pelo coeficiente {fmt(state.coefficient)}</span>
          </h2>
          <OtherLine data={state} />
        </>
      )
    case HistoryType.FinalTable:
      return (
        <>
          <h2>Tabela final</h2>
          <FinalTable data={state} />
        </>
      )
    case HistoryType.Solution:
      return (
        <>
          <h2>Solução:</h2>
          <Solution data={state} />
        </>
      )
    default:
      break
  }
}
