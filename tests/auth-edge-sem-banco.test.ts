// tests/auth-edge-sem-banco.test.ts
//
// O que o edge NAO pode importar: banco.
//
// Em 17/08/2026 o deploy quebrou porque proxy.ts importava `auth` de lib/auth.ts,
// que importa `db` → `neon()` no escopo do modulo. O bundler da edge function
// avalia o modulo, nao havia connection string naquele contexto, e o build do
// Netlify falhava com "No database connection string was provided to neon()".
// O projeto ficou indeployavel — o ultimo deploy no ar era de 14/07.
//
// Este teste e estatico de proposito: nao importa os modulos (importar
// lib/auth.ts aqui abriria conexao), so le o codigo e segue a cadeia de imports
// relativos ao projeto.
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const RAIZ = resolve(__dirname, '..')

/** Resolve '@/lib/x' e './x' para um arquivo .ts/.tsx real, ou null se for pacote. */
function resolverImport(spec: string, deQuemImporta: string): string | null {
  let base: string
  if (spec.startsWith('@/')) base = resolve(RAIZ, spec.slice(2))
  else if (spec.startsWith('.')) base = resolve(dirname(deQuemImporta), spec)
  else return null // pacote de node_modules: fora do escopo deste guard
  for (const cand of [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (existsSync(cand)) return cand
  }
  return null
}

/** Todos os arquivos do projeto alcancaveis a partir de `entrada`. */
function cadeiaDeImports(entrada: string): string[] {
  const vistos = new Set<string>()
  const fila = [resolve(RAIZ, entrada)]
  while (fila.length) {
    const atual = fila.pop()!
    if (vistos.has(atual) || !existsSync(atual)) continue
    vistos.add(atual)
    const src = readFileSync(atual, 'utf8')
    for (const m of src.matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)) {
      const alvo = resolverImport(m[1], atual)
      if (alvo) fila.push(alvo)
    }
  }
  return [...vistos]
}

describe('bundle do edge (proxy.ts)', () => {
  it('nao alcanca lib/db nem lib/auth por nenhum caminho de import', () => {
    const cadeia = cadeiaDeImports('proxy.ts').map((f) => f.replace(RAIZ + '/', ''))

    const proibidos = cadeia.filter(
      (f) => f === 'lib/db.ts' || f.startsWith('lib/db/') || f === 'lib/auth.ts'
    )

    expect(proibidos, `proxy.ts nao pode alcancar: ${proibidos.join(', ')}`).toEqual([])
    // sanity: o guard esta de fato seguindo a cadeia, nao devolvendo lista vazia
    expect(cadeia).toContain('lib/auth.config.ts')
  })
})
