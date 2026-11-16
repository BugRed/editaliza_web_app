import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, hasSupabaseConfig } from '@/shared/lib/env';
import { SEEDED_PROFILES } from '@/app/lib/user-profiles';

type Row = Record<string, unknown>;

function createInitialMockTables(): Record<string, Row[]> {
  return {
    user_data: [
      {
        id: 1,
        password: 'senha_segura_1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        imgUrl: '/images/avatar_joao_1794791579584.jpg',
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2023-01-15T10:00:00Z',
        userType: 'ARTIST',
        listComment: [],
      },
      {
        id: 2,
        password: 'senha_segura_2',
        name: 'Mariana Oliveira',
        email: 'maria.oliveira@email.com',
        imgUrl: '/images/avatar_maria_1794791579527.jpg',
        createdAt: '2023-02-20T14:30:00Z',
        updatedAt: '2023-02-20T14:30:00Z',
        userType: 'ARTIST',
        listComment: [],
      },
      {
        id: 3,
        password: 'senha_segura_3',
        name: 'Carlos Músico',
        email: 'carlos.musico@email.com',
        imgUrl: '/images/avatar_carlos_1794791579626.jpg',
        createdAt: '2023-03-10T08:45:00Z',
        updatedAt: '2023-03-10T08:45:00Z',
        userType: 'ARTIST',
        listComment: [],
      },
    ],
    artist_data: SEEDED_PROFILES.map((p) => ({
      id: p.id,
      name: p.name,
      handle: p.handle,
      email: p.email,
      imgUrl: p.avatarUrl,
      avatarUrl: p.avatarUrl,
      bio: p.bio,
      city: p.city,
      state: p.state,
      territoryScope: p.territoryScope,
      createdAt: '2024-04-22T10:00:00Z',
      updatedAt: new Date().toISOString(),
      userType: 'ARTIST',
      listComment: [],
      listTags: p.tags.map((name, idx) => ({ id: idx + 1, name })),
      coreLanguages: p.coreLanguages,
      supportLanguages: p.supportLanguages,
      experienceYears: p.experienceYears,
      profileLevel: p.profileLevel,
      hasCnpjOrMei: p.hasCnpjOrMei,
      hasTechnicalFormation: p.hasTechnicalFormation,
      portfolioCompleteness: p.portfolioCompleteness,
      badges: p.badges,
      works: p.works,
      savedEditalIds: p.savedEditalIds ?? [],
      likedEditalIds: p.likedEditalIds ?? [],
    })),
    proposer_data: [
      {
        id: 101,
        password: 'senha_proposer_1',
        name: 'Empresa A Propostas',
        handle: '@empresa.a',
        email: 'empresa.a@email.com',
        imgUrl: '/images/edital_pintura_1794791580477.jpg',
        bio: 'Fomento a artes visuais, exposições contemporâneas e bolsas de produção independente.',
        city: 'São Paulo',
        state: 'SP',
        createdAt: '2024-05-10T11:00:00Z',
        updatedAt: '2024-05-10T11:00:00Z',
        userType: 'PROPOSER',
        listComment: [],
        cnpj: '11222333000144',
        listEdital: [301, 306, 308],
      },
      {
        id: 102,
        password: 'senha_proposer_2',
        name: 'Instituição B Projetos',
        handle: '@instituicao.b',
        email: 'instituicao.b@email.com',
        imgUrl: '/images/edital_musica_1794791580539.jpg',
        bio: 'Festivais de música autoral, residências técnicas e circulação de artes cênicas.',
        city: 'Belo Horizonte',
        state: 'MG',
        createdAt: '2024-06-15T15:30:00Z',
        updatedAt: '2024-06-15T15:30:00Z',
        userType: 'PROPOSER',
        listComment: [],
        cnpj: '22333444000155',
        listEdital: [302, 304, 307],
      },
      {
        id: 103,
        password: 'senha_proposer_3',
        name: 'Startup C Cultural',
        handle: '@startupc.cultural',
        email: 'startup.c@email.com',
        imgUrl: '/images/edital_ocupacao_1794791581648.jpg',
        bio: 'Ocupações comunitárias, editais territoriais e centros culturais abertos.',
        city: 'Recife',
        state: 'PE',
        createdAt: '2024-07-01T09:45:00Z',
        updatedAt: '2024-07-01T09:45:00Z',
        userType: 'PROPOSER',
        listComment: [],
        cnpj: '33444555000166',
        listEdital: [303, 305, 309],
      },
    ],
    editals_data: [
      {
        id: 301,
        title: 'Concurso de Pintura Jovem',
        description:
          'Edital de fomento para artistas visuais emergentes em pintura sobre tela, muralismo contemporâneo e técnicas mistas, com bolsa de produção e exposição coletiva.',
        publishDate: '2026-08-01T00:00:00Z',
        endDate: '2026-12-30T23:59:59Z',
        status: 'OPEN',
        inscriptionLink: 'https://link.com/inscricao-pintura',
        completeEditalLink: 'https://link.com/edital-pintura.pdf',
        imgCoverUrl: '/images/edital_pintura_1794791580477.jpg',
        createdAt: '2026-07-25T10:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z',
        proposer: 101,
        listTags: [
          { id: 1, name: 'Pintura' },
          { id: 4, name: 'Artes Visuais' },
          { id: 7, name: 'Exposição' },
        ],
        listComment: [],
        territoryScope: 'NACIONAL',
        city: '',
        state: '',
        requiredLanguages: ['Pintura'],
        acceptedLanguages: ['Pintura', 'Artes Visuais'],
        requiresPortfolio: true,
        requiresCnpj: false,
        requiresTechnicalFormation: false,
        minExperienceYears: 1,
        targetProfileLevels: ['INICIANTE', 'EMERGENTE', 'CONSOLIDADO'],
        plainSummary: {
          whatIsIt:
            'É uma chamada para artistas de pintura que querem mostrar obras novas em exposição e receber ajuda financeira para comprar tintas, telas e montar o trabalho.',
          whoCanApply: [
            'Artistas independentes maiores de 18 anos com portfólio de pintura.',
            'Não precisa ter empresa aberta (pode participar como pessoa física).',
            'Vale pintura em tela, mural, aquarela ou técnica mista.',
          ],
          benefits: [
            'Bolsa de produção para realizar a obra sem tirar dinheiro do próprio bolso.',
            'Participação em exposição coletiva aberta ao público com divulgação oficial.',
          ],
          extraTags: ['Pintura', 'Artes Visuais', 'Exposição', 'Bolsa de Produção', 'Alcance Nacional'],
        },
      },
      {
        id: 302,
        title: 'Festival de Música Popular',
        description:
          'Chamada aberta para bandas, compositores e intérpretes independentes apresentarem músicas inéditas nos palcos regionais com cachê garantido e gravação ao vivo.',
        publishDate: '2026-09-01T00:00:00Z',
        endDate: '2026-12-15T23:59:59Z',
        status: 'OPEN',
        inscriptionLink: 'https://link.com/inscricao-musica',
        completeEditalLink: 'https://link.com/edital-musica.pdf',
        imgCoverUrl: '/images/edital_musica_1794791580539.jpg',
        createdAt: '2026-08-20T14:30:00Z',
        updatedAt: '2026-08-20T14:30:00Z',
        proposer: 102,
        listTags: [
          { id: 2, name: 'Música' },
          { id: 8, name: 'Show ao Vivo' },
          { id: 9, name: 'Autoral' },
        ],
        listComment: [],
        territoryScope: 'NACIONAL',
        city: '',
        state: '',
        requiredLanguages: ['Música'],
        acceptedLanguages: ['Música', 'Performance'],
        requiresPortfolio: true,
        requiresCnpj: false,
        requiresTechnicalFormation: false,
        minExperienceYears: 1,
        targetProfileLevels: ['INICIANTE', 'EMERGENTE', 'CONSOLIDADO'],
        plainSummary: {
          whatIsIt:
            'É um festival que seleciona bandas, cantores e compositores independentes para tocar músicas próprias em palco profissional, com pagamento de cachê.',
          whoCanApply: [
            'Artistas solo, duplas ou bandas com músicas autorais.',
            'Basta enviar um áudio ou vídeo simples mostrando a música (não precisa ser gravação de estúdio).',
          ],
          benefits: [
            'Cachê pago pela apresentação no festival.',
            'Gravação em áudio e vídeo ao vivo para usar no seu portfólio.',
            'Estrutura completa de som, luz e equipe técnica no dia do show.',
          ],
          extraTags: ['Música', 'Autoral', 'Show ao Vivo', 'Cachê Garantido', 'Independente'],
        },
      },
      {
        id: 303,
        title: 'Ocupação de Espaço Cultural',
        description:
          'Seleção de propostas de teatro, escultura, performance e instalações interativas para ocupação de galerias e pátios públicos com apoio de montagem.',
        publishDate: '2026-10-15T09:00:00Z',
        endDate: '2026-12-31T23:59:59Z',
        status: 'OPEN',
        inscriptionLink: 'https://link.com/inscricao-ocupacao',
        completeEditalLink: 'https://link.com/edital-ocupacao.pdf',
        imgCoverUrl: '/images/edital_ocupacao_1794791581648.jpg',
        createdAt: '2026-10-15T09:00:00Z',
        updatedAt: '2026-10-15T09:00:00Z',
        proposer: 103,
        listTags: [
          { id: 3, name: 'Escultura' },
          { id: 5, name: 'Performance' },
          { id: 6, name: 'Teatro' },
        ],
        listComment: [],
        territoryScope: 'NACIONAL',
        city: '',
        state: '',
        requiredLanguages: [],
        acceptedLanguages: ['Escultura', 'Performance', 'Teatro'],
        requiresPortfolio: true,
        requiresCnpj: false,
        requiresTechnicalFormation: false,
        minExperienceYears: 2,
        targetProfileLevels: ['EMERGENTE', 'CONSOLIDADO', 'MESTRE'],
        plainSummary: {
          whatIsIt:
            'É uma oportunidade para ocupar salas e pátios de um centro cultural com apresentações de teatro, escultura, dança ou instalações abertas à comunidade.',
          whoCanApply: [
            'Coletivos ou artistas individuais de teatro, escultura, dança e performance.',
            'Projetos que conversem com o público da região e tenham proposta simples de montagem.',
          ],
          benefits: [
            'Espaço cultural cedido gratuitamente com apoio de produção.',
            'Verba para montagem, transporte de obras e divulgação.',
            'Visibilidade em programação oficial gratuita.',
          ],
          extraTags: ['Escultura', 'Performance', 'Teatro', 'Ocupação Cultural', 'Coletivos'],
        },
      },
      {
        id: 304,
        title: 'Formação Técnica em Artes Cênicas',
        description:
          'Residência prática e bolsa de pesquisa cênica destinada a artistas de teatro e performance que possuam formação técnica comprovada na área.',
        publishDate: '2026-10-20T09:00:00Z',
        endDate: '2027-01-20T23:59:59Z',
        status: 'OPEN',
        inscriptionLink: 'https://link.com/inscricao-formacao',
        completeEditalLink: 'https://link.com/edital-formacao.pdf',
        imgCoverUrl: '/images/art_teatro_palco_1794791582532.jpg',
        createdAt: '2026-10-20T09:00:00Z',
        updatedAt: '2026-10-20T09:00:00Z',
        proposer: 102,
        listTags: [
          { id: 6, name: 'Teatro' },
          { id: 5, name: 'Performance' },
        ],
        listComment: [],
        territoryScope: 'NACIONAL',
        city: '',
        state: '',
        requiredLanguages: ['Teatro'],
        acceptedLanguages: ['Teatro', 'Performance'],
        requiresPortfolio: true,
        requiresCnpj: false,
        requiresTechnicalFormation: true,
        minExperienceYears: 2,
        targetProfileLevels: ['EMERGENTE', 'CONSOLIDADO'],
        plainSummary: {
          whatIsIt:
            'Programa de formação prática e residência artística para quem atua com teatro ou performance e possui certificado técnico ou curso na área.',
          whoCanApply: [
            'Artistas com formação técnica comprovada em artes cênicas ou teatro.',
            'Disponibilidade para acompanhar oficinas semanais e montagem final.',
          ],
          benefits: [
            'Bolsa mensal durante os meses da residência técnica.',
            'Acompanhamento com diretores e cenógrafos convidados.',
          ],
          extraTags: ['Teatro', 'Performance', 'Formação Técnica', 'Residência', 'Bolsa Mensal'],
        },
      },
      {
        id: 305,
        title: 'Edital Municipal de Cultura — Recife',
        description:
          'Fomento exclusivo para artistas residentes em Recife desenvolverem oficinas, esculturas e ações visuais em centros comunitários locais.',
        publishDate: '2026-11-01T09:00:00Z',
        endDate: '2027-02-15T23:59:59Z',
        status: 'OPEN',
        inscriptionLink: 'https://link.com/inscricao-recife',
        completeEditalLink: 'https://link.com/edital-recife.pdf',
        imgCoverUrl: '/images/art_escultura_galeria_1794791581583.jpg',
        createdAt: '2026-11-01T09:00:00Z',
        updatedAt: '2026-11-01T09:00:00Z',
        proposer: 103,
        listTags: [
          { id: 3, name: 'Escultura' },
          { id: 1, name: 'Pintura' },
        ],
        listComment: [],
        territoryScope: 'MUNICIPAL',
        city: 'Recife',
        state: 'PE',
        requiredLanguages: [],
        acceptedLanguages: ['Escultura', 'Pintura', 'Performance'],
        requiresPortfolio: false,
        requiresCnpj: false,
        requiresTechnicalFormation: false,
        minExperienceYears: 0,
        targetProfileLevels: ['INICIANTE', 'EMERGENTE', 'CONSOLIDADO'],
        plainSummary: {
          whatIsIt:
            'Chamada municipal de Recife para artistas locais realizarem oficinas, exposições e intervenções culturais nos bairros da cidade.',
          whoCanApply: [
            'Artistas e produtores culturais residentes no município de Recife (PE).',
            'Propostas de escultura, pintura, música ou artes integradas para espaços comunitários.',
          ],
          benefits: [
            'Apoio financeiro municipal para materiais e cachê de oficina.',
            'Integração na agenda cultural oficial da cidade.',
          ],
          extraTags: ['Recife', 'Escultura', 'Pintura', 'Municipal', 'Ação Comunitária'],
        },
      },
      {
        id: 306,
        title: 'Residência de Dança Contemporânea',
        description:
          'Residência de criação em dança contemporânea para artistas da cena, com foco em corpo, espaço e improvisação. Exige formação ou prática comprovada em dança.',
        publishDate: '2026-11-05T09:00:00Z',
        endDate: '2027-01-20T23:59:59Z',
        status: 'OPEN',
        inscriptionLink: 'https://link.com/inscricao-306',
        completeEditalLink: 'https://link.com/edital-306.pdf',
        imgCoverUrl: '/images/art_teatro_palco_1794791582532.jpg',
        createdAt: '2026-11-05T09:00:00Z',
        updatedAt: '2026-11-05T09:00:00Z',
        proposer: 101,
        listTags: [
          { id: 7, name: 'Dança' },
          { id: 6, name: 'Teatro' },
        ],
        listComment: [],
        territoryScope: 'NACIONAL',
        city: '',
        state: '',
        requiredLanguages: ['Dança'],
        acceptedLanguages: ['Teatro'],
        requiresPortfolio: false,
        requiresCnpj: false,
        requiresTechnicalFormation: false,
        minExperienceYears: 0,
        targetProfileLevels: [],
        plainSummary: {
          whatIsIt:
            'Residência de quatro semanas para criar uma obra de dança contemporânea com acompanhamento de coreógrafos.',
          whoCanApply: [
            'Artistas da dança, com prática comprovada na linguagem.',
            'Teatro e performance entram como linguagens complementares.',
          ],
          benefits: [
            'Estúdio e alojamento durante a residência.',
            'Bolsa de criação e apresentação final aberta ao público.',
          ],
          extraTags: ['Dança', 'Residência', 'Cena'],
        },
      },
      {
        id: 307,
        title: 'Programa Mestres da Escultura',
        description:
          'Programa de reconhecimento para escultores com trajetória longa. Exige no mínimo 20 anos de atuação e produção reconhecida na escultura.',
        publishDate: '2026-11-08T09:00:00Z',
        endDate: '2027-02-28T23:59:59Z',
        status: 'OPEN',
        inscriptionLink: 'https://link.com/inscricao-307',
        completeEditalLink: 'https://link.com/edital-307.pdf',
        imgCoverUrl: '/images/art_escultura_galeria_1794791581583.jpg',
        createdAt: '2026-11-08T09:00:00Z',
        updatedAt: '2026-11-08T09:00:00Z',
        proposer: 102,
        listTags: [
          { id: 3, name: 'Escultura' },
        ],
        listComment: [],
        territoryScope: 'NACIONAL',
        city: '',
        state: '',
        requiredLanguages: ['Escultura'],
        acceptedLanguages: [],
        requiresPortfolio: true,
        requiresCnpj: false,
        requiresTechnicalFormation: false,
        minExperienceYears: 20,
        targetProfileLevels: ['MESTRE'],
        plainSummary: {
          whatIsIt:
            'Prêmio e exposição individual para escultores com mais de vinte anos de obra.',
          whoCanApply: [
            'Escultores com 20 anos ou mais de atuação.',
            'Portfólio com obras de diferentes períodos.',
          ],
          benefits: [
            'Prêmio em dinheiro.',
            'Exposição individual com catálogo.',
          ],
          extraTags: ['Escultura', 'Mestres', 'Premiação'],
        },
      },
      {
        id: 308,
        title: 'Bolsa Iniciantes em Fotografia',
        description:
          'Bolsa de estudo e produção para quem está começando na fotografia. Direcionada a artistas em início de carreira; pintura entra como linguagem aceita.',
        publishDate: '2026-11-10T09:00:00Z',
        endDate: '2027-03-10T23:59:59Z',
        status: 'OPEN',
        inscriptionLink: 'https://link.com/inscricao-308',
        completeEditalLink: 'https://link.com/edital-308.pdf',
        imgCoverUrl: '/images/edital_pintura_1794791580477.jpg',
        createdAt: '2026-11-10T09:00:00Z',
        updatedAt: '2026-11-10T09:00:00Z',
        proposer: 101,
        listTags: [
          { id: 4, name: 'Fotografia' },
          { id: 1, name: 'Pintura' },
        ],
        listComment: [],
        territoryScope: 'NACIONAL',
        city: '',
        state: '',
        requiredLanguages: ['Fotografia'],
        acceptedLanguages: ['Pintura'],
        requiresPortfolio: false,
        requiresCnpj: false,
        requiresTechnicalFormation: false,
        minExperienceYears: 0,
        targetProfileLevels: ['INICIANTE'],
        plainSummary: {
          whatIsIt:
            'Bolsa mensal para quem está dando os primeiros passos na fotografia, com mentoria.',
          whoCanApply: [
            'Artistas iniciantes na fotografia.',
            'Quem trabalha com pintura e quer explorar a imagem fotográfica.',
          ],
          benefits: [
            'Bolsa mensal por seis meses.',
            'Mentoria com fotógrafos convidados.',
          ],
          extraTags: ['Fotografia', 'Iniciantes', 'Bolsa'],
        },
      },
      {
        id: 309,
        title: 'Prêmio Nacional de Literatura Jovem',
        description:
          'Prêmio para livros inéditos de autores com até dez anos de trajetória. Aceita poesia, conto e romance. Exige ao menos 10 anos de atuação literária comprovada.',
        publishDate: '2026-11-12T09:00:00Z',
        endDate: '2027-04-05T23:59:59Z',
        status: 'OPEN',
        inscriptionLink: 'https://link.com/inscricao-309',
        completeEditalLink: 'https://link.com/edital-309.pdf',
        imgCoverUrl: '/images/edital_musica_1794791580539.jpg',
        createdAt: '2026-11-12T09:00:00Z',
        updatedAt: '2026-11-12T09:00:00Z',
        proposer: 103,
        listTags: [
          { id: 8, name: 'Literatura' },
        ],
        listComment: [],
        territoryScope: 'NACIONAL',
        city: '',
        state: '',
        requiredLanguages: ['Literatura'],
        acceptedLanguages: [],
        requiresPortfolio: false,
        requiresCnpj: false,
        requiresTechnicalFormation: false,
        minExperienceYears: 10,
        targetProfileLevels: [],
        plainSummary: {
          whatIsIt:
            'Prêmio para publicação de um livro inédito, com tiragem e lançamento.',
          whoCanApply: [
            'Autores de poesia, conto ou romance.',
            'Obra inédita em língua portuguesa.',
          ],
          benefits: [
            'Publicação com tiragem de mil exemplares.',
            'Lançamento em evento literário.',
          ],
          extraTags: ['Literatura', 'Prêmio', 'Publicação'],
        },
      },
    ],
    tags_data: [
      { id: 1, name: 'Pintura', description: 'Obras feitas com tintas sobre tela', color: '#0E7C86', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
      { id: 2, name: 'Música', description: 'Projetos musicais', color: '#FFB800', createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' },
      { id: 3, name: 'Escultura', description: 'Criações tridimensionais', color: '#0E7C86', createdAt: '2024-01-03T00:00:00Z', updatedAt: '2024-01-03T00:00:00Z' },
      { id: 4, name: 'Fotografia', description: 'Trabalhos de arte fotográfica.', color: '#0B656D', createdAt: '2024-01-04T00:00:00Z', updatedAt: '2024-01-04T00:00:00Z' },
      { id: 5, name: 'Performance', description: 'Arte performática', color: '#D97706', createdAt: '2024-01-05T00:00:00Z', updatedAt: '2024-01-05T00:00:00Z' },
      { id: 6, name: 'Teatro', description: 'Artes cênicas e dramaturgia', color: '#0E7C86', createdAt: '2024-01-06T00:00:00Z', updatedAt: '2024-01-06T00:00:00Z' },
      { id: 7, name: 'Dança', description: 'Artes do corpo e do movimento', color: '#0B656D', createdAt: '2024-01-07T00:00:00Z', updatedAt: '2024-01-07T00:00:00Z' },
      { id: 8, name: 'Literatura', description: 'Poesia, conto e romance', color: '#D97706', createdAt: '2024-01-08T00:00:00Z', updatedAt: '2024-01-08T00:00:00Z' },
    ],
    comments_data: [
      { id: 401, authorName: 'João Silva', content: 'Excelente edital! Já me inscrevi.', approved: true, status: 'APPROVED', createdAt: '2024-08-02T11:00:00Z', updatedAt: '2024-08-02T11:00:00Z', user: 1, edital: 301 },
      { id: 402, authorName: 'Mariana Oliveira', content: 'Achei a descrição bem clara e completa.', approved: true, status: 'APPROVED', createdAt: '2024-08-03T15:00:00Z', updatedAt: '2024-08-03T15:00:00Z', user: 2, edital: 301 },
      { id: 403, authorName: 'Carlos Músico', content: 'Há alguma possibilidade de estender o prazo?', approved: false, status: 'PENDING', createdAt: '2024-08-21T10:30:00Z', updatedAt: '2024-08-21T10:30:00Z', user: 3, edital: 302 },
    ],
  };
}

const globalForMock = globalThis as typeof globalThis & {
  __editalizaMockTables?: Record<string, Row[]>;
};

const mockTables =
  globalForMock.__editalizaMockTables ||
  (globalForMock.__editalizaMockTables = createInitialMockTables());

function createMockQuery(table: string) {
  const filters: Array<{ column: string; value: unknown }> = [];
  let selectedCols: string | null = null;
  let isSingle = false;
  let mode: 'select' | 'update' | 'insert' = 'select';
  let mutationPayload: Row | Row[] | null = null;

  const projectRows = (items: Row[]): Row[] => {
    if (!selectedCols || selectedCols.trim() === '*') return items;
    const cols = selectedCols.split(',').map((c) => c.trim()).filter(Boolean);
    return items.map((row) => {
      const projected: Row = {};
      for (const col of cols) {
        if (col in row) projected[col] = row[col];
      }
      return projected;
    });
  };

  const execute = (): { data: unknown; error: null | { message: string } } => {
    const tableRows = mockTables[table] ?? [];

    if (mode === 'insert' && mutationPayload) {
      const toInsert = Array.isArray(mutationPayload) ? mutationPayload : [mutationPayload];
      const inserted = toInsert.map((item) => {
        const nextId = item.id ?? Date.now();
        const row = { ...item, id: nextId };
        tableRows.push(row);
        return row;
      });
      mockTables[table] = tableRows;
      const projected = projectRows(inserted);
      return isSingle
        ? { data: projected[0] ?? null, error: null }
        : { data: projected, error: null };
    }

    const matchesFilters = (row: Row) =>
      filters.every((f) => String(row[f.column]) === String(f.value));

    if (mode === 'update' && mutationPayload && !Array.isArray(mutationPayload)) {
      const updatedRows: Row[] = [];
      mockTables[table] = tableRows.map((row) => {
        if (!matchesFilters(row)) return row;
        const next = { ...row, ...mutationPayload, updatedAt: new Date().toISOString() };
        updatedRows.push(next);
        return next;
      });
      const projected = projectRows(updatedRows);
      return isSingle
        ? projected.length > 0
          ? { data: projected[0], error: null }
          : { data: null, error: { message: 'Row not found' } }
        : { data: projected, error: null };
    }

    const filtered = tableRows.filter(matchesFilters);
    const projected = projectRows(filtered);
    return isSingle
      ? projected.length > 0
        ? { data: projected[0], error: null }
        : { data: null, error: { message: 'Row not found' } }
      : { data: projected, error: null };
  };

  const builder = {
    select(columns = '*') {
      selectedCols = columns;
      return builder;
    },
    update(payload: Row) {
      mode = 'update';
      mutationPayload = payload;
      return builder;
    },
    insert(payload: Row | Row[]) {
      mode = 'insert';
      mutationPayload = payload;
      return builder;
    },
    eq(column: string, value: unknown) {
      filters.push({ column, value });
      return builder;
    },
    single() {
      isSingle = true;
      return builder;
    },
    then<TResult1 = { data: unknown; error: null | { message: string } }, TResult2 = never>(
      onfulfilled?: ((value: { data: unknown; error: null | { message: string } }) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ) {
      return Promise.resolve(execute()).then(onfulfilled, onrejected);
    },
  };

  return builder;
}

const mockSupabase = {
  from(table: string) {
    return createMockQuery(table);
  },
} as unknown as SupabaseClient;

function initSupabase(): SupabaseClient {
  if (hasSupabaseConfig && env.SUPABASE_URL && env.SUPABASE_API_KEY) {
    try {
      return createClient(env.SUPABASE_URL, env.SUPABASE_API_KEY);
    } catch {
      console.warn('[Editaliza] Supabase URL inválida — usando dados locais de demonstração.');
    }
  }
  return mockSupabase;
}

export const supabase: SupabaseClient = initSupabase();
