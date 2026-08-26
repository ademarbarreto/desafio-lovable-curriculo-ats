import {
  AlignmentType,
  Document,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { jsPDF } from "jspdf";

export type CurriculoAts = {
  nome: string;
  titulo: string;
  contato: string[];
  resumo: string;
  experiencias: { cargo: string; empresa: string; periodo: string; bullets: string[] }[];
  formacao: string[];
  certificacoes: string[];
  habilidades: string[];
};

const MESES: Record<string, string> = {
  jan: "01",
  fev: "02",
  mar: "03",
  abr: "04",
  mai: "05",
  jun: "06",
  jul: "07",
  ago: "08",
  set: "09",
  out: "10",
  nov: "11",
  dez: "12",
};

/** Normaliza uma data solta para MM/AAAA (regra de compatibilidade ATS). */
export function normalizarData(valor: string): string {
  const bruto = (valor ?? "").trim();
  if (!bruto) return "";
  const minusculo = bruto.toLowerCase();
  if (/^(atual|presente|hoje|em andamento|current)$/.test(minusculo)) return "atual";

  let m = bruto.match(/^(\d{4})-(\d{1,2})/); // 2021-03 / 2021-03-01
  if (m) return `${m[2]!.padStart(2, "0")}/${m[1]}`;
  m = bruto.match(/^(\d{1,2})[/-](\d{4})$/); // 3/2021
  if (m) return `${m[1]!.padStart(2, "0")}/${m[2]}`;
  m = bruto.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/); // 01/03/2021
  if (m) return `${m[2]!.padStart(2, "0")}/${m[3]}`;
  m = minusculo.match(/^([a-zç]{3})[a-zç]*\.?\s*(?:de\s*)?(\d{4})$/); // mar/2021, março de 2021
  if (m && MESES[m[1]!]) return `${MESES[m[1]!]}/${m[2]}`;
  m = bruto.match(/^(\d{4})$/); // 2021
  if (m) return `01/${m[1]}`;
  return bruto;
}

/** Normaliza períodos "inicio — fim" para "MM/AAAA - MM/AAAA". */
export function normalizarPeriodo(inicio: string, fim?: string): string {
  if (fim === undefined) {
    const partes = (inicio ?? "").split(/\s*(?:—|–|-|a|até|to)\s*/i).filter(Boolean);
    if (partes.length >= 2)
      return `${normalizarData(partes[0]!)} - ${normalizarData(partes[partes.length - 1]!)}`;
    return normalizarData(inicio ?? "");
  }
  const i = normalizarData(inicio);
  const f = normalizarData(fim) || "atual";
  return i ? `${i} - ${f}` : f;
}

function semAcento(v: string) {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** Nome_Sobrenome_Cargo_Empresa */
export function nomeArquivoAts(nome: string, cargo: string, empresa: string): string {
  const partes = [semAcento(nome) || "Curriculo", semAcento(cargo), semAcento(empresa)].filter(
    Boolean,
  );
  return partes.join("_");
}

function baixar(blob: Blob, arquivo: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = arquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const TITULOS = {
  resumo: "Resumo Profissional",
  experiencia: "Experiência Profissional",
  formacao: "Formação Acadêmica",
  habilidades: "Habilidades",
  certificacoes: "Certificações",
};

// ---------------------------------------------------------------- DOCX

export async function exportarDocx(cv: CurriculoAts, arquivo: string) {
  const p = (texto: string, opts: { bold?: boolean; size?: number; espaco?: number } = {}) =>
    new Paragraph({
      spacing: { after: opts.espaco ?? 60 },
      children: [
        new TextRun({ text: texto, bold: opts.bold ?? false, size: opts.size ?? 22, font: "Arial" }),
      ],
    });

  const secao = (titulo: string) =>
    new Paragraph({
      spacing: { before: 240, after: 100 },
      children: [new TextRun({ text: titulo.toUpperCase(), bold: true, size: 24, font: "Arial" })],
    });

  const bullet = (texto: string) =>
    new Paragraph({
      numbering: { reference: "ats-bullets", level: 0 },
      spacing: { after: 40 },
      children: [new TextRun({ text: texto, size: 22, font: "Arial" })],
    });

  const corpo: Paragraph[] = [];

  corpo.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [new TextRun({ text: cv.nome, bold: true, size: 32, font: "Arial" })],
    }),
  );
  if (cv.titulo) corpo.push(p(cv.titulo, { bold: true }));
  for (const linha of cv.contato) if (linha) corpo.push(p(linha));

  if (cv.resumo) {
    corpo.push(secao(TITULOS.resumo));
    corpo.push(p(cv.resumo));
  }

  if (cv.experiencias.length) {
    corpo.push(secao(TITULOS.experiencia));
    for (const e of cv.experiencias) {
      corpo.push(p(`${e.cargo} — ${e.empresa}`, { bold: true, espaco: 0 }));
      if (e.periodo) corpo.push(p(e.periodo));
      for (const b of e.bullets) if (b) corpo.push(bullet(b));
    }
  }

  if (cv.formacao.length) {
    corpo.push(secao(TITULOS.formacao));
    for (const f of cv.formacao) corpo.push(p(f));
  }

  if (cv.certificacoes.length) {
    corpo.push(secao(TITULOS.certificacoes));
    for (const c of cv.certificacoes) corpo.push(p(c));
  }

  if (cv.habilidades.length) {
    corpo.push(secao(TITULOS.habilidades));
    for (const h of cv.habilidades) corpo.push(bullet(h));
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
    numbering: {
      config: [
        {
          reference: "ats-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "-",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 180 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
          },
        },
        children: corpo,
      },
    ],
  });

  baixar(await Packer.toBlob(doc), `${arquivo}.docx`);
}

// ---------------------------------------------------------------- PDF

export function exportarPdf(cv: CurriculoAts, arquivo: string) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margem = 54;
  const largura = doc.internal.pageSize.getWidth() - margem * 2;
  const alturaPagina = doc.internal.pageSize.getHeight();
  let y = margem;

  const quebra = (altura: number) => {
    if (y + altura > alturaPagina - margem) {
      doc.addPage();
      y = margem;
    }
  };

  const escrever = (
    texto: string,
    opts: { size?: number; bold?: boolean; indent?: number; espaco?: number } = {},
  ) => {
    const size = opts.size ?? 11;
    const indent = opts.indent ?? 0;
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    const linhas = doc.splitTextToSize(texto, largura - indent) as string[];
    const alturaLinha = size * 1.35;
    for (const linha of linhas) {
      quebra(alturaLinha);
      doc.text(linha, margem + indent, y + size);
      y += alturaLinha;
    }
    y += opts.espaco ?? 3;
  };

  const secao = (titulo: string) => {
    y += 10;
    quebra(24);
    escrever(titulo.toUpperCase(), { size: 12, bold: true, espaco: 2 });
    quebra(6);
    doc.setDrawColor(120);
    doc.line(margem, y, margem + largura, y);
    y += 8;
  };

  escrever(cv.nome, { size: 17, bold: true, espaco: 2 });
  if (cv.titulo) escrever(cv.titulo, { size: 11, bold: true, espaco: 2 });
  for (const linha of cv.contato) if (linha) escrever(linha, { size: 10, espaco: 0 });

  if (cv.resumo) {
    secao(TITULOS.resumo);
    escrever(cv.resumo);
  }

  if (cv.experiencias.length) {
    secao(TITULOS.experiencia);
    for (const e of cv.experiencias) {
      escrever(`${e.cargo} — ${e.empresa}`, { bold: true, espaco: 0 });
      if (e.periodo) escrever(e.periodo, { size: 10, espaco: 2 });
      for (const b of e.bullets) if (b) escrever(`- ${b}`, { indent: 12, espaco: 1 });
      y += 6;
    }
  }

  if (cv.formacao.length) {
    secao(TITULOS.formacao);
    for (const f of cv.formacao) escrever(f);
  }

  if (cv.certificacoes.length) {
    secao(TITULOS.certificacoes);
    for (const c of cv.certificacoes) escrever(c);
  }

  if (cv.habilidades.length) {
    secao(TITULOS.habilidades);
    for (const h of cv.habilidades) escrever(`- ${h}`, { indent: 12, espaco: 1 });
  }

  doc.save(`${arquivo}.pdf`);
}
