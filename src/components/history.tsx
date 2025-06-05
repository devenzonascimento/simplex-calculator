import {
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
          <h2>Table</h2>
          <Table data={state} />
        </>
      )
    case HistoryType.Nlp:
      return (
        <>
          <h2>
            <strong>(NLP)</strong> Nova linha {state.rowNumber + 1}ª
          </h2>
          <Nlp data={state} />
        </>
      )
    case HistoryType.OtherLine:
      return (
        <>
          <h2>Nova linha {state.rowNumber + 1}ª</h2>
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
