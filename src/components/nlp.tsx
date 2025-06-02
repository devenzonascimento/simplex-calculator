import type { NlpType as NlpType } from '../main'

type NlpProps = {
  data: NlpType
}

export function Nlp({ data }: NlpProps) {
  const { pivotRow, newPivotRow, pivotElementToUse } = data
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
              {pivotRow.Xs.map((_, i) => (
                <th
                  key={i.toString()}
                  className="px-3 py-2 border border-zinc-300 text-center bg-zinc-100"
                >
                  X{i + 1}
                </th>
              ))}
              {pivotRow.XFs.map((_, i) => (
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
                Linha pivô
              </td>

              <td className="px-3 py-2 border border-zinc-300 text-center">
                {pivotRow.Z}
              </td>

              {pivotRow.Xs.map((x, i) => (
                <td
                  key={`X-${i.toString}`}
                  className="px-3 py-2 border border-zinc-300 text-center"
                >
                  {x}
                </td>
              ))}

              {pivotRow.XFs.map((xf, i) => (
                <td
                  key={`XF-${i.toString}`}
                  className="px-3 py-2 border border-zinc-300 text-center"
                >
                  {xf}
                </td>
              ))}

              <td className="px-3 py-2 border border-zinc-300 text-center">
                {pivotRow.B}
              </td>
            </tr>

            <tr>
              <td className="px-3 py-2 border border-zinc-300 text-center">
                Nova linha pivô
              </td>

              <td className="px-3 py-2 border border-zinc-300 text-center">
                {newPivotRow.Z}
              </td>

              {newPivotRow.Xs.map((x, i) => (
                <td
                  key={`X-${i.toString}`}
                  className="px-3 py-2 border border-zinc-300 text-center"
                >
                  {x}
                </td>
              ))}

              {newPivotRow.XFs.map((xf, i) => (
                <td
                  key={`XF-${i.toString}`}
                  className="px-3 py-2 border border-zinc-300 text-center"
                >
                  {xf}
                </td>
              ))}

              <td className="px-3 py-2 border border-zinc-300 text-center">
                {newPivotRow.B}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-14 flex items-center justify-center gap-1">
        <div className="size-4 flex flex-col items-center justify-center gap-0.5">
          <div className="h-1 w-1 rounded-full bg-black" />
          <div className="h-0.5 w-full rounded-full bg-black" />
          <div className="h-1 w-1 rounded-full bg-black" />
        </div>
        <span className='font-bold text-lg'>{pivotElementToUse}</span>
      </div>
    </div>
  )
}
