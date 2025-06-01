// src/App.tsx

import React, { useEffect, useState } from 'react'
import Fraction from 'fraction.js'
import {
  simplex,
  type Direction,
  type Sign,
  type SimplexInput,
  type TableauState,
} from './simplex'
import { TableauDisplay } from './components/tableau-display'

export const App: React.FC = () => {
  // 1. Estados básicos
  const [direction, setDirection] = useState<Direction>('max')
  const [n, setN] = useState<number>(2)
  const [m, setM] = useState<number>(2)

  // 2. Coeficientes da FO e restrições como strings (input masks)
  const [cs, setCs] = useState<string[]>([])
  const [A, setA] = useState<string[][]>([])
  const [b, setB] = useState<string[]>([])
  const [signs, setSigns] = useState<Sign[]>([])

  // 3. Resultado do simplex
  const [history, setHistory] = useState<TableauState[] | null>(null)
  const [zOpt, setZOpt] = useState<Fraction | null>(null)
  const [solOpt, setSolOpt] = useState<Fraction[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Sempre que “n” mudar, ajustamos o tamanho de “cs”
  useEffect(() => {
    setCs(prev => {
      const arr = Array(n).fill('0')
      for (let i = 0; i < Math.min(prev.length, n); i++) {
        arr[i] = prev[i]
      }
      return arr
    })
  }, [n])

  // Sempre que “m” ou “n” mudarem, ajustamos “A”, “b” e “signs”
  useEffect(() => {
    // Ajusta A para ter m linhas e n colunas
    setA(prev => {
      const novo: string[][] = []
      for (let i = 0; i < m; i++) {
        const row = Array(n).fill('0')
        if (i < prev.length) {
          for (let j = 0; j < Math.min(prev[i].length, n); j++) {
            row[j] = prev[i][j]
          }
        }
        novo.push(row)
      }
      return novo
    })

    // Ajusta b para ter m entradas
    setB(prev => {
      const arr = Array(m).fill('0')
      for (let i = 0; i < Math.min(prev.length, m); i++) {
        arr[i] = prev[i]
      }
      return arr
    })

    // Ajusta signs para ter m entradas (sempre "<=" nesta versão)
    setSigns(Array(m).fill('<='))
  }, [m, n])

  // Manipuladores de input
  const handleCsChange = (idx: number, value: string) => {
    setCs(prev => {
      const arr = [...prev]
      arr[idx] = value
      return arr
    })
  }

  const handleAChange = (i: number, j: number, value: string) => {
    setA(prev => {
      const mat = prev.map(row => [...row])
      mat[i][j] = value
      return mat
    })
  }

  const handleBChange = (i: number, value: string) => {
    setB(prev => {
      const arr = [...prev]
      arr[i] = value
      return arr
    })
  }

  // Quando clica “Resolver”
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      // 1) Monta objetos Fraction a partir das strings
      const csFrac = cs.map(s => new Fraction(s))
      const AFrac: Fraction[][] = A.map(row => row.map(s => new Fraction(s)))
      const bFrac = b.map(s => new Fraction(s))
      const signsArr: Sign[] = signs

      // 2) Se “min”, inverter sinais de cs
      if (direction === 'min') {
        for (let i = 0; i < csFrac.length; i++) {
          csFrac[i] = csFrac[i].neg()
        }
      }

      const inputData: SimplexInput = {
        n,
        m,
        cs: csFrac,
        A: AFrac,
        b: bFrac,
        signs: signsArr,
      }

      // 3) Chama o simplex e obtém histórico + solução
      const { history, zOpt, solOpt } = simplex(inputData)
      console.log(zOpt)
      setHistory(history)
      setZOpt(zOpt)
      setSolOpt(solOpt)
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido')
      setHistory(null)
      setZOpt(null)
      setSolOpt(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Solver Simplex (React + TS)</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        {/* 1) Direção */}
        <div>
          <label htmlFor="direction" className="mr-2 font-medium">
            Tipo:
          </label>
          <select
            id="direction"
            value={direction}
            onChange={e => setDirection(e.target.value as Direction)}
            className="border px-2 py-1"
          >
            <option value="max">Maximizar</option>
            <option value="min">Minimizar</option>
          </select>
        </div>

        {/* 2) n e m */}
        <div className="flex space-x-4">
          <div>
            <label htmlFor="n-variables" className="block font-medium">
              Variáveis (n):
            </label>
            <input
              id="n-variables"
              type="number"
              min={1}
              value={n}
              onChange={e => setN(Number.parseInt(e.target.value) || 1)}
              className="border px-2 py-1 w-20"
            />
          </div>
          <div>
            <label htmlFor="m-restrictions" className="block font-medium">
              Restrições (m):
            </label>
            <input
              id="m-restrictions"
              type="number"
              min={1}
              value={m}
              onChange={e => setM(Number.parseInt(e.target.value) || 1)}
              className="border px-2 py-1 w-20"
            />
          </div>
        </div>

        {/* 3) Coeficientes da Função-Objetivo (array de n campos) */}
        <div>
          <span className="block font-medium mb-1">
            Coeficientes da FO (n = {n}):
          </span>
          <div className="grid grid-cols- min-w-fit gap-2">
            {cs.map((val, idx) => (
              <input
                key={idx.toString()}
                type="text"
                value={val}
                onChange={e => handleCsChange(idx, e.target.value)}
                className="border px-2 py-1 w-16 text-center"
              />
            ))}
          </div>
        </div>

        {/* 4) Cada restrição: n coef. + sinal (fixo "<=") + RHS */}
        <div>
          <span className="block font-medium mb-1">
            Restrições (cada linha = {n} coeficientes + "≤" + RHS):
          </span>
          <div className="space-y-2">
            {Array.from({ length: m }).map((_, i) => (
              <div key={i.toString()} className="flex items-center space-x-2">
                {/* coeficientes */}
                {Array.from({ length: n }).map((_, j) => (
                  <input
                    key={`${i.toString()}-${j.toString()}`}
                    type="text"
                    value={A?.[i]?.[j]}
                    onChange={e => handleAChange(i, j, e.target.value)}
                    className="border px-2 py-1 w-12 text-center"
                  />
                ))}

                {/* sinal fixo */}
                <span className="font-medium px-2">≤</span>

                {/* RHS */}
                <input
                  type="text"
                  value={b[i]}
                  onChange={e => handleBChange(i, e.target.value)}
                  className="border px-2 py-1 w-16 text-center"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Botão Resolver */}
        <div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Resolver Simplex
          </button>
        </div>

        {/* Mensagem de erro, se houver */}
        {error && <div className="text-red-600 font-medium">⚠️ {error}</div>}
      </form>

      {/* 5) Se já tiver historial, exibe todos os tableaux */}
      {history && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Histórico de Tableaux</h2>
          {history.map((state, idx) => (
            <TableauDisplay key={idx.toString()} state={state} step={idx} />
          ))}

          {/* 6) Exibe solução ótima abaixo dos tableaux */}
          {zOpt && solOpt && (
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Solução Ótima</h3>
              <ul className="list-disc list-inside">
                {solOpt.map((x, j) => (
                  <li key={j.toString()}>
                    x{j + 1} ={' '}
                    {Number(x.d) === 1 ? x.n.toString() : x.valueOf().toFixed(2)}
                  </li>
                ))}
                <li>
                  Z ={' '}
                  {zOpt.n}
                  {Number(zOpt.d) === 1 ? zOpt.n.toString() : zOpt.valueOf().toFixed(2)}
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
