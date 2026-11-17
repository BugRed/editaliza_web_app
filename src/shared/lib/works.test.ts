import { countByFilter, filterWorks, parseTagList } from "@/shared/lib/works";

const works = [
  { id: "a", kind: "IMAGEM" as const },
  { id: "b", kind: "FOTOGRAFIA" as const },
  { id: "c", kind: "VIDEO" as const },
  { id: "d", kind: "AUDIO" as const },
  { id: "e" },
];

describe("filterWorks", () => {
  it("imagens incluem fotografia e obra antiga sem tipo", () => {
    expect(filterWorks(works, "IMAGEM").map((w) => w.id)).toEqual(["a", "b", "e"]);
  });

  it("vídeo, áudio e todas", () => {
    expect(filterWorks(works, "VIDEO").map((w) => w.id)).toEqual(["c"]);
    expect(filterWorks(works, "AUDIO").map((w) => w.id)).toEqual(["d"]);
    expect(filterWorks(works, "TODAS")).toHaveLength(5);
  });

  it("não altera a ordem da galeria", () => {
    expect(filterWorks(works, "TODAS").map((w) => w.id)).toEqual(["a", "b", "c", "d", "e"]);
  });
});

describe("countByFilter", () => {
  it("conta por aba", () => {
    expect(countByFilter(works)).toEqual({ TODAS: 5, IMAGEM: 3, VIDEO: 1, AUDIO: 1 });
  });
});

describe("parseTagList", () => {
  it("tira vazios e repetidos, mantém a ordem", () => {
    expect(parseTagList("retrato, memória , retrato,, ")).toEqual(["retrato", "memória"]);
    expect(parseTagList("")).toEqual([]);
  });

  it("limita a 12 temas", () => {
    const many = Array.from({ length: 20 }, (_, i) => `t${i}`).join(",");
    expect(parseTagList(many)).toHaveLength(12);
  });
});
