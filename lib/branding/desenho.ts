/**
 * O DESENHO da marca do produto — símbolo e logotipo — como geometria pura.
 *
 * Mora aqui, e não num `.svg` em `public/`, por duas razões que a doutrina de
 * marca própria já paga:
 *
 *  1. `public/` é servido a todo mundo, sempre. Um arquivo fixo ali seria a
 *     marca do PRODUTO na instalação de um revendedor que configurou a dele —
 *     é exatamente o vazamento que `tests/unit/branding.test.ts` vigia. Como
 *     geometria, o desenho só aparece onde um componente decide que a marca em
 *     vigor é a padrão (`marcaEhADoProduto`, em `lib/branding.ts`).
 *  2. O favicon (`app/icon.tsx`) é gerado em runtime pelo `ImageResponse`, que
 *     aceita SVG inline mas não lê arquivo do disco. Um único desenho alimenta
 *     a tela e o ícone — dois arquivos divergiriam na primeira revisão da marca.
 *
 * As cores NÃO estão aqui de propósito: quem desenha escolhe (a tela lê os
 * tokens do tema; o favicon lê a régua do produto). A fonte deste arquivo são
 * os SVGs em `docs/brand/`; ao trocar a arte, regenere os dois lados a partir
 * deles.
 */

/** Glifo com a transformação que o posiciona no `viewBox` do logotipo. */
export type Glifo = { readonly transform: string; readonly d: string };

const N_GEOMETRICO =
  "M36 176V40c0-6 4-10 10-10h28c6 0 10 4 10 10v76l62-82c4-5 9-8 16-8h24c6 0 10 4 10 10v140c0 6-4 10-10 10h-28c-6 0-10-4-10-10V96l-62 82c-4 5-9 8-16 8H46c-6 0-10-4-10-10Z";

/** O símbolo: um N geométrico de precisão com módulo de realce destacado. Quadrado de 216. */
export const SIMBOLO = {
  viewBox: "0 0 216 216",
  transform: "translate(0.5 2)",
  d: N_GEOMETRICO,
  modulo: { x: 172, y: 30, width: 24, height: 24, rx: 4 },
} as const;

/**
 * O logotipo: símbolo + "NOVA" + "CRM", com o texto já convertido em
 * caminhos — não depende de fonte instalada nem de `@font-face`.
 */
export const LOGOTIPO = {
  viewBox: "51 25 732 211",
  /** Proporção largura/altura do `viewBox`, para dimensionar por altura. */
  proporcao: 732 / 211,
  simbolo: { transform: "translate(44 19) scale(1.05)", d: N_GEOMETRICO, modulo: SIMBOLO.modulo },
  nome: [
    // N
    {
      transform: "translate(268 151) scale(0.05 -0.05)",
      d: "M150 0V1446H390L920 450V1446H1160V0H920L390 996V0Z",
    },
    // O
    {
      transform: "translate(345 151) scale(0.05 -0.05)",
      d: "M650 1446C1010 1446 1280 1140 1280 723C1280 306 1010 0 650 0C290 0 20 306 20 723C20 1140 290 1446 650 1446ZM650 1232C420 1232 260 1010 260 723C260 436 420 214 650 214C880 214 1040 436 1040 723C1040 1010 880 1232 650 1232Z",
    },
    // V
    {
      transform: "translate(425 151) scale(0.05 -0.05)",
      d: "M100 1446H360L650 350L940 1446H1200L780 0H520Z",
    },
    // A
    {
      transform: "translate(500 151) scale(0.05 -0.05)",
      d: "M520 1446H760L1220 0H960L830 380H450L320 0H60ZM640 1020L510 610H770Z",
    },
  ] as readonly Glifo[],
  sufixo: [
    {
      transform: "translate(273 191) scale(0.01171875 -0.01171875)",
      d: "M1073 53Q996 12 915.0 -8.5Q834 -29 743 -29Q456 -29 297.5 174.0Q139 377 139 745Q139 1111 298.5 1315.5Q458 1520 743 1520Q834 1520 915.0 1499.5Q996 1479 1073 1438V1231Q999 1292 914.0 1324.0Q829 1356 743 1356Q546 1356 448.0 1204.0Q350 1052 350 745Q350 439 448.0 287.0Q546 135 743 135Q831 135 915.5 167.0Q1000 199 1073 260Z",
    },
    {
      transform: "translate(292.4492 191) scale(0.01171875 -0.01171875)",
      d: "M760 705Q838 685 893.0 629.5Q948 574 1030 408L1233 0H1016L838 377Q761 538 699.5 584.5Q638 631 539 631H346V0H143V1493H559Q805 1493 936.0 1382.0Q1067 1271 1067 1061Q1067 913 986.5 819.5Q906 726 760 705ZM346 1327V797H567Q712 797 783.0 862.0Q854 927 854 1061Q854 1190 778.5 1258.5Q703 1327 559 1327Z",
    },
    {
      transform: "translate(311.8984 191) scale(0.01171875 -0.01171875)",
      d: "M86 1493H356L614 733L874 1493H1145V0H958V1319L692 532H539L272 1319V0H86Z",
    },
  ] as readonly Glifo[],
} as const;

/**
 * As cores da marca do produto, por tema — os mesmos graus da régua
 * (`regua-do-produto.ts`): sálvia 600/400 para o símbolo, neutro 900/0 para
 * o nome e neutro 600/300 para o "CRM". Copiadas dos SVGs de `docs/brand/`.
 */
export const CORES_DA_MARCA = {
  claro: { simbolo: "#1c1a16", nome: "#1c1a16", sufixo: "#5d594f" },
  escuro: { simbolo: "#f5f4ef", nome: "#f5f4ef", sufixo: "#8e8b7f" },
} as const;
