import { fmt, type OtherLineType } from '../main'

type OtherLineProps = {
  data: OtherLineType
}

export function OtherLine({ data }: OtherLineProps) {
  const {
    rowNumber,
    newPivotRow,
    multipliedNewPivotRow,
    originalRow,
    resultRow,
    coefficient,
  } = data

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 overflow-x-auto">
        <table className="min-w-full border-zinc-400 rounded-lg">
          <thead>
            <tr>
              <th className="px-3 py-2 border border-zinc-300 text-center bg-zinc-100">
                Origem
              </th>

              <th className="px-3 py-2 border border-zinc-300 text-center bg-zinc-100">
                Z
              </th>
              {newPivotRow.Xs.map((_, i) => (
                <th
                  key={i.toString()}
                  className="px-3 py-2 border border-zinc-300 text-center bg-zinc-100"
                >
                  X{i + 1}
                </th>
              ))}
              {newPivotRow.XFs.map((_, i) => (
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
            <tr>
              <td className="px-3 py-2 border border-zinc-300 text-center">
                Nova linha pivô
              </td>

              <td className="px-3 py-2 border border-zinc-300 text-center">
                {fmt(newPivotRow.Z)}
              </td>

              {newPivotRow.Xs.map((x, i) => (
                <td
                  key={`NLP-X-${i.toString()}`}
                  className="px-3 py-2 border border-zinc-300 text-center"
                >
                  {fmt(x)}
                </td>
              ))}

              {newPivotRow.XFs.map((xf, i) => (
                <td
                  key={`NLP-XF-${i.toString()}`}
                  className="px-3 py-2 border border-zinc-300 text-center"
                >
                  {fmt(xf)}
                </td>
              ))}

              <td className="px-3 py-2 border border-zinc-300 text-center">
                {fmt(newPivotRow.B)}
              </td>
            </tr>

            <tr>
              <td className="px-3 py-2 border border-zinc-300 text-center">
                Multiplicou: {fmt(coefficient)}
              </td>

              <td className="px-3 py-2 border border-zinc-300 text-center">
                {fmt(multipliedNewPivotRow.Z)}
              </td>

              {multipliedNewPivotRow.Xs.map((x, i) => (
                <td
                  key={`MULT-X-${i.toString()}`}
                  className="px-3 py-2 border border-zinc-300 text-center"
                >
                  {fmt(x)}
                </td>
              ))}

              {multipliedNewPivotRow.XFs.map((xf, i) => (
                <td
                  key={`MULT-XF-${i.toString()}`}
                  className="px-3 py-2 border border-zinc-300 text-center"
                >
                  {fmt(xf)}
                </td>
              ))}

              <td className="px-3 py-2 border border-zinc-300 text-center">
                {fmt(multipliedNewPivotRow.B)}
              </td>
            </tr>

            <tr>
              <td className="px-3 py-2 border border-zinc-300 text-center">
                Linha original
              </td>

              <td className="px-3 py-2 border border-zinc-300 text-center">
                {fmt(originalRow.Z)}
              </td>

              {originalRow.Xs.map((x, i) => (
                <td
                  key={`ORIGINAL-X-${i.toString()}`}
                  className="px-3 py-2 border border-zinc-300 text-center"
                >
                  {fmt(x)}
                </td>
              ))}

              {originalRow.XFs.map((xf, i) => (
                <td
                  key={`ORIGINAL-XF-${i.toString()}`}
                  className="px-3 py-2 border border-zinc-300 text-center"
                >
                  {fmt(xf)}
                </td>
              ))}

              <td className="px-3 py-2 border border-zinc-300 text-center">
                {fmt(originalRow.B)}
              </td>
            </tr>

            <tr>
              <td className="px-3 py-2 border border-zinc-300 text-center">
                Nova {rowNumber + 1}ª linha
              </td>

              <td className="px-3 py-2 border border-zinc-300 text-center">
                {fmt(resultRow.Z)}
              </td>

              {resultRow.Xs.map((x, i) => (
                <td
                  key={`RESULT-X-${i.toString()}`}
                  className="px-3 py-2 border border-zinc-300 text-center"
                >
                  {fmt(x)}
                </td>
              ))}

              {resultRow.XFs.map((xf, i) => (
                <td
                  key={`RESULT-XF-${i.toString()}`}
                  className="px-3 py-2 border border-zinc-300 text-center"
                >
                  {fmt(xf)}
                </td>
              ))}

              <td className="px-3 py-2 border border-zinc-300 text-center">
                {fmt(resultRow.B)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* <div className="flex flex-col">
        <div className="mb-6 flex items-center justify-center gap-1">
          <div className="size-4 flex flex-col items-center justify-center gap-0.5 font-bold">
            X
          </div>
          <span className="font-bold text-lg">{fmt(coefficient)}</span>
        </div>

        <div className="flex items-center justify-center gap-1">
          <div className="size-4 flex flex-col items-center justify-center gap-0.5 font-bold">
            Soma
          </div>
        </div>
      </div> */}
    </div>
  )
}
