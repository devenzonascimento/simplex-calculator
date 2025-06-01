# simplex_cli.py

from fractions import Fraction
import sys

def parse_input():
    print("=== Simplex CLI ===\n")
    direction = input("Maximizar ou Minimizar? [max/min]: ").strip().lower()
    if direction not in ("max", "min"):
        print("Escolha inválida. Use 'max' ou 'min'.")
        sys.exit(1)
    n = int(input("Número de variáveis de decisão (n): "))
    cs = list(map(Fraction, input(f"Coeficientes da função-objetivo c (separados por espaço, {n} valores): ").split()))
    if len(cs) != n:
        print("Número de coeficientes diferente de n.")
        sys.exit(1)

    m = int(input("Número de restrições (m): "))
    A = []
    b = []
    signs = []
    for i in range(m):
        parts = input(f"Restrição {i+1} (ex: '2 1 <= 6' para n={n}): ").split()
        if len(parts) != n + 2:
            print("Formato inválido.")
            sys.exit(1)
        row = list(map(Fraction, parts[:n]))
        sign = parts[n]
        rhs = Fraction(parts[n+1])
        if sign not in ("<=", ">=", "="):
            print("Sinal inválido (use <=, >= ou =).")
            sys.exit(1)
        A.append(row)
        b.append(rhs)
        signs.append(sign)

    # Se for minimizar, basta inverter os sinais de cs
    if direction == "min":
        cs = [-c for c in cs]

    return n, m, cs, A, b, signs

def build_tableau(n, m, cs, A, b, signs):
    # só lidamos com restrições <=: adiciona variável de folga
    # Caso >= ou =, seria necessário fase 1 ou variável artificial (não implementado aqui)
    for s in signs:
        if s != "<=":
            print("Apenas restrições <= são suportadas nesta versão.")
            sys.exit(1)

    # Matriz A com folgas: cada restrição ganha uma coluna de folga
    total_vars = n + m
    T = [row[:] + [Fraction(1) if i==j else Fraction(0) for j in range(m)] for i, row in enumerate(A)]
    # RHS
    B = b[:]
    # custo: Z - Σc_j x_j = 0 → coeficientes de x_j na linha-Z são -c_j
    cost = [ -c for c in cs ] + [Fraction(0)] * m

    # variáveis básicas: inicialmente as folgas (índices n .. n+m-1)
    basic = [n + i for i in range(m)]

    return T, B, cost, basic

def print_tableau(T, B, cost, basic, step):
    m = len(T)
    total_vars = len(cost)
    headers = [f"x{j+1}" for j in range(total_vars)] + ["b"]
    print(f"\nTableau {step}:")
    print(" Basic | " + "  ".join(f"{h:>6}" for h in headers))
    print("-" * (9 + 8 * len(headers)))
    for i in range(m):
        row = T[i] + [B[i]]
        print(f" x{basic[i]+1:<3}| " + "  ".join(f"{float(v):6.1f}" for v in row))
    print("-" * (9 + 8 * len(headers)))
    # linha-Z
    print("       | " + "  ".join(f"{float(v):6.1f}" for v in cost) + f"  {0.0:6.1f}")

def find_pivot(cost, T, B):
    # coluna pivô: custo negativo mais “negativo”
    min_cost = min(cost)
    if min_cost >= 0:
        return None, None  # ótimo
    pivot_col = cost.index(min_cost)

    # razões b[i] / T[i][pivot_col]
    ratios = []
    for i, row in enumerate(T):
        aij = row[pivot_col]
        if aij > 0:
            ratios.append((B[i] / aij, i))
    if not ratios:
        return pivot_col, None  # ilimitado
    _, pivot_row = min(ratios, key=lambda x: (x[0], x[1]))
    return pivot_col, pivot_row

def pivot_operation(T, B, cost, basic, pivot_col, pivot_row):
    m = len(T)
    # 1) normalize row
    piv_val = T[pivot_row][pivot_col]
    T[pivot_row] = [v / piv_val for v in T[pivot_row]]
    B[pivot_row] /= piv_val

    # 2) zerar outras linhas
    for i in range(m):
        if i == pivot_row:
            continue
        factor = T[i][pivot_col]
        T[i] = [T[i][j] - factor * T[pivot_row][j] for j in range(len(T[0]))]
        B[i] -= factor * B[pivot_row]

    # 3) atualizar linha-Z
    zfact = cost[pivot_col]
    cost[:] = [ cost[j] - zfact * T[pivot_row][j] for j in range(len(cost)) ]

    # 4) variável básica troca para pivot_col
    basic[pivot_row] = pivot_col

def extract_solution(basic, B, total_vars):
    sol = [Fraction(0)] * total_vars
    for i, bv in enumerate(basic):
        sol[bv] = B[i]
    return sol

def simplex(n, m, cs, A, b, signs):
    T, B, cost, basic = build_tableau(n, m, cs, A, b, signs)
    step = 0
    print_tableau(T, B, cost, basic, step)

    # iterar pivôs
    while True:
        pivot_col, pivot_row = find_pivot(cost, T, B)
        if pivot_col is None:
            print("\n--- Otimização concluída: solução ótima encontrada. ---")
            break
        if pivot_row is None:
            print("\n*** Problema ilimitado! ***")
            sys.exit(1)

        print(f"\n>>> Escolhendo pivot: coluna x{pivot_col+1}, linha {pivot_row+1}")
        pivot_operation(T, B, cost, basic, pivot_col, pivot_row)
        step += 1
        print_tableau(T, B, cost, basic, step)

    total_vars = n + m
    sol = extract_solution(basic, B, total_vars)
    z_val = sum(cs[j] * sol[j] for j in range(n))  # se min, já invertemos cs
    return sol, z_val

def main():
    n, m, cs, A, b, signs = parse_input()
    sol, z = simplex(n, m, cs, A, b, signs)
    print("\n== Solução Ótima ==")
    for j, xj in enumerate(sol):
        print(f"x{j+1} = {float(xj):.1f}")
    print(f"Z = {float(z):.1f}")

# if __name__ == "__main__":
#     main()


def calculator():
  z = {
    "x1": 5,
    "x2": 2,
  }
  
  restrictions = [
    {
      "x1": 10,
      "x2": 12,
      # "operator": "<=",
      "B": 60,
    },
    {
      "x1": 2,
      "x2": 1,
      # "operator": "<=",
      "B": 6
    },
  ]
  
  print([" Z ", ""])
  
  for restriction in restrictions:
    print(restriction.)

calculator()