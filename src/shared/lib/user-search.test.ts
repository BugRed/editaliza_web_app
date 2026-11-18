import { filterUsers } from "@/shared/lib/user-search";

const users = [
  { name: "Ana Souza", handle: "@ana", tags: ["Pintura"], city: "Recife", state: "PE" },
  { name: "Bruno Lima", handle: "@bruno", tags: ["Música"], city: "Olinda", state: "PE" },
  { name: "Carla Dias", handle: "@carla", tags: ["Teatro"], city: "Salvador", state: "BA" },
];

describe("filterUsers", () => {
  it("busca vazia ou só com espaços devolve todos", () => {
    expect(filterUsers(users, "   ")).toHaveLength(3);
  });

  it("acha por nome, @usuário, linguagem, cidade e UF, sem diferenciar maiúsculas", () => {
    expect(filterUsers(users, "ANA").map((u) => u.handle)).toEqual(["@ana"]);
    expect(filterUsers(users, "@bruno")).toHaveLength(1);
    expect(filterUsers(users, "teatro")[0].name).toBe("Carla Dias");
    expect(filterUsers(users, "olinda")[0].name).toBe("Bruno Lima");
    expect(filterUsers(users, "pe")).toHaveLength(2);
  });

  it("sem correspondência devolve lista vazia", () => {
    expect(filterUsers(users, "xyz")).toEqual([]);
  });
});
