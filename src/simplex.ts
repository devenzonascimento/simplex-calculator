// src/simplex.ts

import Fraction from 'fraction.js'

export type Direction = 'max' | 'min'
export type Sign = '<=' | '>=' | '='

export interface SimplexInput {
  n: number // número de variáveis de decisão
  m: number // número de restrições
  cs: Fraction[] // coeficientes da função-objetivo (length = n)
  A: Fraction[][] // matriz (m × n) de coeficientes das restrições
  b: Fraction[] // termos independentes (length = m)
  signs: Sign[] // sinais de cada restrição (length = m)
}

// Esta interface descreve o estado de um tableau em cada passo,
// incluindo qual pivô o levou a esse estado.
export interface TableauState {
  T: Fraction[][] // submatriz (m × (n+m)) – coeficientes + variáveis de folga
  B: Fraction[] // RHS (length = m)
  cost: Fraction[] // linha de custos (length = n+m)
  basic: number[] // índices das variáveis básicas atuais (length = m)
  pivotCol: number | null // índice da coluna pivô que resultou neste tableau (ou null para o inicial/final)
  pivotRow: number | null // índice da linha pivô que resultou neste tableau (ou null para o inicial/final)
}

// Constrói o tableau inicial (apenas para restrições “<=”).
// Retorna T (coef.), B (RHS), cost (linha-Z), basic (variáveis básicas iniciais).
export function buildTableau(
  n: number,
  m: number,
  cs: Fraction[],
  A: Fraction[][],
  b: Fraction[],
  signs: Sign[],
) {
  // Esta versão só suporta “<=”. Se houver “>=” ou “=”, abortamos.
  for (const s of signs) {
    if (s !== '<=') {
      throw new Error(
        "Somente restrições com '<=' são suportadas nesta versão.",
      )
    }
  }

  // Para cada uma das m restrições, criamos uma coluna de folga.
  // T será m × (n + m). As primeiras n colunas são A, as próximas m colunas formam
  // uma matriz identidade (variáveis de folga).
  const T: Fraction[][] = A.map((row, i) => {
    const slackCols = Array.from({ length: m }, (_, j) =>
      i === j ? new Fraction(1) : new Fraction(0),
    )
    return row.concat(slackCols)
  })

  const B = [...b] // RHS

  // Custo inicial é Z – ∑ c_j x_j = 0  ⇒ linha-Z = [–c₁, –c₂, …, –cₙ, 0,…,0]
  const cost = cs.map(c => c.neg()).concat(Array(m).fill(new Fraction(0)))

  // As m variáveis básicas iniciais são exatamente as folgas: índices n, n+1, …, n+m-1
  const basic = Array.from({ length: m }, (_, i) => n + i)

  return { T, B, cost, basic }
}

// Função que escolhe (pivotCol, pivotRow).
// Se nenhum custo negativo ⇒ ótimo (retorna { pivotCol: null, pivotRow: null }).
// Se ilimitado ⇒ pivotRow = null (com pivotCol ≠ null).
export function findPivot(
  cost: Fraction[],
  T: Fraction[][],
  B: Fraction[],
): { pivotCol: number | null; pivotRow: number | null } {
  // 1) coluna-pivô = índice do custo mais negativo
  let minIdx = 0
  for (let j = 1; j < cost.length; j++) {
    if (cost[j].compare(cost[minIdx]) < 0) {
      minIdx = j
    }
  }

  if (cost[minIdx].compare(0) >= 0) {
    // todos custos ≥ 0 ⇒ solução ótima
    return { pivotCol: null, pivotRow: null }
  }
  const pivotCol = minIdx

  // 2) Razões b[i] / T[i][pivotCol], somente onde T[i][pivotCol] > 0
  const candidates: { ratio: Fraction; row: number }[] = []
  for (let i = 0; i < T.length; i++) {
    const aij = T[i][pivotCol]
    if (aij.compare(0) > 0) {
      candidates.push({ ratio: B[i].div(aij), row: i })
    }
  }

  if (candidates.length === 0) {
    // Não há linha viável ⇒ problema ilimitado
    return { pivotCol, pivotRow: null }
  }

  // linha-pivô = a i cuja razão b[i]/aij seja a mínima
  let minRatio = candidates[0]
  for (let k = 1; k < candidates.length; k++) {
    if (candidates[k].ratio.compare(minRatio.ratio) < 0) {
      minRatio = candidates[k]
    }
  }
  return { pivotCol, pivotRow: minRatio.row }
}

// Opera o pivot (Gauss-Jordan) em (pivotRow, pivotCol), atualizando T, B, cost e basic.
export function pivotOperation(
  T: Fraction[][],
  B: Fraction[],
  cost: Fraction[],
  basic: number[],
  pivotCol: number,
  pivotRow: number,
) {
  const m = T.length
  const nPlus = T[0].length // n + m

  // 1) Dividir toda a linha pivotRow por T[pivotRow][pivotCol]
  const pivotVal = T[pivotRow][pivotCol]
  for (let j = 0; j < nPlus; j++) {
    T[pivotRow][j] = T[pivotRow][j].div(pivotVal)
  }
  B[pivotRow] = B[pivotRow].div(pivotVal)

  // 2) Para cada outra linha i ≠ pivotRow, zerar a coluna pivotCol
  for (let i = 0; i < m; i++) {
    if (i === pivotRow) continue
    const factor = T[i][pivotCol]
    for (let j = 0; j < nPlus; j++) {
      T[i][j] = T[i][j].sub(factor.mul(T[pivotRow][j]))
    }
    B[i] = B[i].sub(factor.mul(B[pivotRow]))
  }

  // 3) Atualizar linha de custos (linha-Z):   cost[j] ← cost[j] – zFactor × T[pivotRow][j]
  const zFactor = cost[pivotCol]
  for (let j = 0; j < cost.length; j++) {
    cost[j] = cost[j].sub(zFactor.mul(T[pivotRow][j]))
  }

  // 4) A variável básica da linha pivotRow passa a ser a pivotCol
  basic[pivotRow] = pivotCol
}

// Extrai a solução final (array de length totalVars) a partir de “basic” e B.
export function extractSolution(
  basic: number[],
  B: Fraction[],
  totalVars: number,
): Fraction[] {
  const sol: Fraction[] = Array(totalVars)
    .fill(null)
    .map(() => new Fraction(0))

  for (let i = 0; i < basic.length; i++) {
    sol[basic[i]] = B[i]
  }
  return sol
}

// Função principal do Simplex: retorna todo o histórico de tableaux
// incluindo o inicial (pivotCol=null) e cada iteração após pivot.
export function simplex(input: SimplexInput): {
  history: TableauState[]
  zOpt: Fraction
  solOpt: Fraction[]
} {
  const { n, m, cs, A, b, signs } = input

  const {
    T: T0,
    B: B0,
    cost: cost0,
    basic: basic0,
  } = buildTableau(n, m, cs, A, b, signs)

  // Clonando arrays para não mutar o original
  const T: Fraction[][] = T0.map(row => row.map(v => v.clone()))
  const B: Fraction[] = B0.map(v => v.clone())
  const cost: Fraction[] = cost0.map(v => v.clone())
  const basic: number[] = basic0.slice()

  // Histórico de tableaux
  const history: TableauState[] = []

  // 1) Empurrar o tableau inicial (antes de qualquer pivô), com pivotCol=null
  history.push({
    T: T.map(row => row.map(v => v.clone())),
    B: B.map(v => v.clone()),
    cost: cost.map(v => v.clone()),
    basic: basic.slice(),
    pivotCol: null,
    pivotRow: null,
  })

  // 2) Loop principal
  while (true) {
    const { pivotCol, pivotRow } = findPivot(cost, T, B)

    if (pivotCol === null) {
      // não há custo negativo → ótimo alcançado
      break
    }
    if (pivotRow === null) {
      throw new Error('Problema ilimitado')
    }

    // Realiza pivot
    pivotOperation(T, B, cost, basic, pivotCol, pivotRow)

    // Empurra o estado após pivot
    history.push({
      T: T.map(row => row.map(v => v.clone())),
      B: B.map(v => v.clone()),
      cost: cost.map(v => v.clone()),
      basic: basic.slice(),
      pivotCol,
      pivotRow,
    })
  }

  // 3) Extrai solução ótima
  const totalVars = n + m
  const solOpt = extractSolution(basic, B, totalVars)
  // valor de Z: soma c_j * x_j (apenas as n primeiras variáveis de decisão)
  let zOpt = new Fraction(0)
  for (let j = 0; j < n; j++) {
    zOpt = zOpt.add(cs[j].mul(solOpt[j]))
  }

  return { history, zOpt, solOpt }
}
