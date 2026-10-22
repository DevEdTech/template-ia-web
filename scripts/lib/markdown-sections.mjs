// Edição de documentação por seção, com âncora obrigatória.
//
// O setup reescreve trechos de `AGENTS.md` e de `docs/` quando uma capacidade
// é ligada ou desligada. Fazer isso com `replace` solto deixa documento
// parcialmente errado quando o texto muda de lugar. Aqui a âncora é o título
// `##`: se ele não existir, a operação falha alto, e a transação do setup
// restaura tudo.

/** Encontra os limites de uma seção `## Título` (do título ao próximo `## `). */
function sectionBounds(text, heading) {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return null;
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith('## ')) {
      end = index;
      break;
    }
  }
  return { lines, start, end };
}

/**
 * Substitui uma seção inteira pelo conteúdo informado.
 * @param {string} text documento completo.
 * @param {string} heading título da seção, sem `## `.
 * @param {string} replacement novo conteúdo, já incluindo o título.
 * @returns {string}
 */
export function replaceSection(text, heading, replacement) {
  const bounds = sectionBounds(text, heading);
  if (!bounds) throw new Error(`Seção "## ${heading}" não encontrada.`);
  const { lines, start, end } = bounds;
  const body = replacement.replace(/\n+$/, '').split('\n');
  return [...lines.slice(0, start), ...body, '', ...lines.slice(end)].join('\n');
}

/**
 * Remove uma seção inteira do documento.
 * @param {string} text documento completo.
 * @param {string} heading título da seção, sem `## `.
 * @returns {string}
 */
export function removeSection(text, heading) {
  const bounds = sectionBounds(text, heading);
  if (!bounds) throw new Error(`Seção "## ${heading}" não encontrada.`);
  const { lines, start, end } = bounds;
  return [...lines.slice(0, start), ...lines.slice(end)].join('\n');
}

/**
 * Insere uma seção antes de outra, para manter a ordem de leitura.
 * @param {string} text documento completo.
 * @param {string} beforeHeading título que deve vir depois do novo conteúdo.
 * @param {string} section conteúdo novo, já incluindo o título.
 * @returns {string}
 */
export function insertSectionBefore(text, beforeHeading, section) {
  const bounds = sectionBounds(text, beforeHeading);
  if (!bounds) throw new Error(`Seção "## ${beforeHeading}" não encontrada.`);
  const { lines, start } = bounds;
  const body = section.replace(/\n+$/, '').split('\n');
  return [...lines.slice(0, start), ...body, '', ...lines.slice(start)].join('\n');
}

/**
 * Troca um trecho exato, exigindo que ele exista.
 * @param {string} text documento ou código.
 * @param {string} search trecho atual.
 * @param {string} replacement trecho novo.
 * @param {string} label nome do arquivo, para a mensagem de erro.
 * @returns {string}
 */
export function replaceExact(text, search, replacement, label) {
  if (!text.includes(search)) {
    throw new Error(`${label}: trecho esperado não encontrado:\n${search}`);
  }
  return text.split(search).join(replacement);
}
