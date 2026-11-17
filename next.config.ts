import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['exemplo.com', 'link.com', 'totenart.pt', 'www.encorda.com.br', 'midias.correiobraziliense.com.br'],
  },
  // O mock em memória (DATA_SOURCE=mock, usado na Vercel) lê mock/*.csv em runtime. O Next só leva ao
  // pacote da função os arquivos que enxerga por import, então os CSVs precisam ser declarados aqui.
  outputFileTracingIncludes: {
    '/api/**/*': ['./mock/**/*.csv', './db/seed-columns.json'],
  },
};

export default nextConfig;
