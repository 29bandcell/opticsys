# OpticSys Cloud - ERP & SaaS Multi-Lojas para Óticas

Sistema SaaS completo, multi-lojas e comercializável para Óticas, Redes de Óticas e Laboratórios de Montagem/Surfaçagem.

## 🚀 Pilares Técnicos
- **Frontend / Engine:** React 18, Vite, TypeScript, Tailwind CSS v4, Lucide Icons.
- **Isolamento Multi-Tenant:** PostgreSQL + Row Level Security (RLS) estrito com `loja_id` em todas as entidades.
- **Hospedagem & Deploy:** Pronto para Netlify (SPA redirects, cache headers e Edge Functions configurados no `netlify.toml`).
- **Nicho de Ótica Completo:** Grade médica de dioptria (OD/OE: Esférico, Cilíndrico, Eixo, DNP, Altura, Adição, Prisma), Kanban de O.S. integrado a laboratórios terceirizados (Essilor, Zeiss, Hoya), PDV rápido de armações e lentes, e impressão de envelope técnico de montagem.

## 📂 Estrutura de Pastas
```
otica-saas-erp/
├── database/
│   └── schema_otica.sql           # DDL completo para Supabase / PostgreSQL com RLS
├── netlify.toml                   # Configuração de deploy no Netlify
├── src/
│   ├── components/
│   │   ├── common/                # Badges, Skeletons
│   │   ├── layout/                # Sidebar retrátil, Navbar com RBAC
│   │   └── optica/                # Grade médica (OD/OE), Impressão de O.S. e Envelope Lab
│   ├── context/
│   │   └── AuthAndTenantContext   # Multi-tenancy, estado global, persistência
│   ├── lib/
│   │   └── mockData.ts            # Base de dados de amostra realista para ótica
│   ├── pages/
│   │   ├── LandingPage.tsx        # Página de Venda SaaS com conversão e planos
│   │   ├── RegisterStore.tsx      # Onboarding de novas óticas (14 dias trial)
│   │   ├── Dashboard.tsx          # Métricas operacionais, O.S. no laboratório
│   │   ├── Clientes.tsx           # Ficha oftalmológica do paciente e histórico
│   │   ├── Receitas.tsx           # Prescrições médicas e aviso de retorno 1 ano
│   │   ├── OrdensServico.tsx      # Kanban de bancada e laboratório
│   │   ├── PDV.tsx                # Ponto de venda rápido com leitor de código de barras
│   │   ├── ProdutosEstoque.tsx    # Catálogo de armações (aro/ponte/haste) e lentes
│   │   ├── Laboratorios.tsx       # Controle de laboratórios terceirizados
│   │   ├── Financeiro.tsx         # Caixa balcão, contas a pagar/receber e comissões
│   │   └── Configuracoes.tsx      # Parâmetros de impressão térmica 80mm/58mm e Asaas
│   ├── types/                     # Tipagens TypeScript estritas
│   ├── App.tsx                    # Orquestrador SPA
│   ├── main.tsx                   # Entrada React
│   └── index.css                  # Design system Clean Tech Neo-Brutalist
```

## 🛠️ Como Executar Localmente

1. Navegue até a pasta:
```bash
cd C:\Users\User\.gemini\antigravity\scratch\otica-saas-erp
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Para gerar a build de produção do Netlify:
```bash
npm run build
```

## 🌐 Deploy no Netlify
O projeto já conta com o arquivo `netlify.toml` preparado. Basta conectar o repositório Git ao Netlify ou arrastar a pasta `dist` gerada pelo `npm run build`.
