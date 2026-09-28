import React, { useState } from 'react';
import { Boxes, Plus, Search, Filter, Tag, Layers, Bookmark, Scale, Sparkles, CheckCircle } from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { Produto, TipoProduto } from '../types';
import { Badge } from '../components/common/Badge';

export const ProdutosEstoque: React.FC = () => {
  const { produtos, adicionarProduto } = useAuthAndTenant();

  const [abaAtiva, setAbaAtiva] = useState<'ESTOQUE' | 'CATEGORIAS' | 'MARCAS' | 'UNIDADES' | 'MATERIAIS'>('ESTOQUE');
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados de Categorias, Marcas, Unidades e Materiais
  const [categorias, setCategorias] = useState([
    { id: 'cat-1', nome: 'Armações Receituário Masculino', total: 18 },
    { id: 'cat-2', nome: 'Armações Receituário Feminino', total: 24 },
    { id: 'cat-3', nome: 'Armações Infantis / Kids', total: 12 },
    { id: 'cat-4', nome: 'Óculos de Sol (Solares Polarizados)', total: 15 },
    { id: 'cat-5', nome: 'Lentes Monofocais Antirreflexo', total: 30 },
    { id: 'cat-6', nome: 'Lentes Multifocais Digitais', total: 22 },
    { id: 'cat-7', nome: 'Lentes de Contato Descartáveis', total: 40 },
    { id: 'cat-8', nome: 'Acessórios & Soluções de Limpeza', total: 55 },
  ]);

  const [marcas, setMarcas] = useState([
    { id: 'mar-1', nome: 'Ray-Ban', pais: 'Itália (Luxottica)', produtos: 22 },
    { id: 'mar-2', nome: 'Oakley', pais: 'EUA (Luxottica)', produtos: 14 },
    { id: 'mar-3', nome: 'Vogue Eyewear', pais: 'Itália (Luxottica)', produtos: 19 },
    { id: 'mar-4', nome: 'Zeiss Vision Care', pais: 'Alemanha', produtos: 28 },
    { id: 'mar-5', nome: 'Essilor (Varilux / Crizal)', pais: 'França', produtos: 35 },
    { id: 'mar-6', nome: 'Hoya Lens', pais: 'Japão', produtos: 16 },
    { id: 'mar-7', nome: 'Carrera', pais: 'Itália (Sáfilo)', produtos: 11 },
  ]);

  const [unidades, setUnidades] = useState([
    { id: 'un-1', sigla: 'UN', descricao: 'Unidade (Peça individual)', uso: 'Armações e Solares' },
    { id: 'un-2', sigla: 'PAR', descricao: 'Par (Blocos oftálmicos)', uso: 'Lentes de Grau OD/OE' },
    { id: 'un-3', sigla: 'CX', descricao: 'Caixa com 6 ou 30 lentes', uso: 'Lentes de Contato' },
    { id: 'un-4', sigla: 'FR', descricao: 'Frasco (ml)', uso: 'Colírios e Limpa-Lentes' },
  ]);

  const [materiais, setMateriais] = useState([
    { id: 'mat-1', nome: 'Acetato de Celulose Italiano', caracteristica: 'Hipoalergênico, resistente e ajustável ao calor', uso: 'Armações de Grau e Solares' },
    { id: 'mat-2', nome: 'Titânio Puro / Beta Titânio', caracteristica: 'Ultraleve, ultra-resistente e não enferruja', uso: 'Armações Premium' },
    { id: 'mat-3', nome: 'Metal Monel / Aço Inoxidável', caracteristica: 'Fino, discreto e flexível', uso: 'Aros fechados e fio de nylon' },
    { id: 'mat-4', nome: 'Grilamid TR-90 / Injetado', caracteristica: 'Memória elástica, ideal para esportes e infantil', uso: 'Linhas Esportivas e Kids' },
    { id: 'mat-5', nome: 'Resina CR-39 (Índice 1.50/1.56)', caracteristica: 'Ótima qualidade óptica, uso em baixos graus', uso: 'Lentes Oftálmicas' },
    { id: 'mat-6', nome: 'Policarbonato (Índice 1.59)', caracteristica: 'Alta resistência a impactos, recomendado para esportes e 3 peças', uso: 'Lentes Oftálmicas' },
    { id: 'mat-7', nome: 'Alto Índice 1.67 / 1.74', caracteristica: 'Lentes ultra-finas para alta miopia ou hipermetropia', uso: 'Lentes Oftálmicas Especiais' },
  ]);

  // Form State
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoProduto>('ARMACAO_GRAU');
  const [marca, setMarca] = useState('Ray-Ban');
  const [referencia, setReferencia] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [precoCusto, setPrecoCusto] = useState(0);
  const [precoVenda, setPrecoVenda] = useState(0);
  const [estoqueAtual, setEstoqueAtual] = useState(1);
  const [estoqueMinimo, setEstoqueMinimo] = useState(2);
  const [aro, setAro] = useState(52);
  const [ponte, setPonte] = useState(18);
  const [haste, setHaste] = useState(140);
  const [material, setMaterial] = useState('Acetato de Celulose Italiano');
  const [cor, setCor] = useState('Preto Fosco');

  const produtosFiltrados = produtos.filter(p => {
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       p.codigo_referencia.toLowerCase().includes(busca.toLowerCase()) ||
                       p.marca.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = tipoFiltro === 'TODOS' || p.tipo === tipoFiltro;
    return matchBusca && matchTipo;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !marca || precoVenda <= 0) {
      alert('Preencha os campos obrigatórios (Nome, Marca e Preço de Venda).');
      return;
    }

    adicionarProduto({
      nome,
      tipo,
      marca,
      codigo_referencia: referencia || `REF-${Date.now().toString().slice(-4)}`,
      codigo_barras: codigoBarras || `789${Date.now().toString().slice(-6)}`,
      preco_custo: precoCusto,
      preco_venda: precoVenda,
      estoque_atual: estoqueAtual,
      estoque_minimo: estoqueMinimo,
      tamanho_aro: tipo === 'ARMACAO_GRAU' || tipo === 'SOLAR' ? aro : undefined,
      tamanho_ponte: tipo === 'ARMACAO_GRAU' || tipo === 'SOLAR' ? ponte : undefined,
      tamanho_haste: tipo === 'ARMACAO_GRAU' || tipo === 'SOLAR' ? haste : undefined,
      material,
      cor,
      ativo: true
    });

    setIsModalOpen(false);
    setNome('');
    setReferencia('');
    setPrecoCusto(0);
    setPrecoVenda(0);
  };

  return (
    <div className="space-y-4 max-w-6xl">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-sky-50 dark:bg-sky-950 text-[#0284C7] flex items-center justify-center font-bold">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Produtos & Estoque
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Controle de Estoque, Categorias, Marcas, Unidades de Medida e Tipos de Materiais Ópticos.
            </p>
          </div>
        </div>

        {abaAtiva === 'ESTOQUE' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="neo-button-primary !py-1.5 text-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Produto
          </button>
        )}
      </div>

      {/* Submenus em Abas Conforme Especificação */}
      <div className="flex gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setAbaAtiva('ESTOQUE')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'ESTOQUE'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" /> Controle de Estoque ({produtos.length})
        </button>

        <button
          onClick={() => setAbaAtiva('CATEGORIAS')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'CATEGORIAS'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Categorias ({categorias.length})
        </button>

        <button
          onClick={() => setAbaAtiva('MARCAS')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'MARCAS'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" /> Marcas & Grifes ({marcas.length})
        </button>

        <button
          onClick={() => setAbaAtiva('UNIDADES')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'UNIDADES'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-3.5 h-3.5" /> Unidades ({unidades.length})
        </button>

        <button
          onClick={() => setAbaAtiva('MATERIAIS')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'MATERIAIS'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Tipos de Material ({materiais.length})
        </button>
      </div>

      {/* ABA 1: CONTROLE DE ESTOQUE */}
      {abaAtiva === 'ESTOQUE' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar marca, modelo, referência ou código de barras..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="neo-input !pl-8"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto w-full sm:w-auto text-xs">
              {[
                { id: 'TODOS', label: 'Todos' },
                { id: 'ARMACAO_GRAU', label: 'Armações' },
                { id: 'SOLAR', label: 'Solares' },
                { id: 'LENTE_OFTALMICA', label: 'Lentes' },
                { id: 'ACESSORIO', label: 'Acessórios' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setTipoFiltro(cat.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                    tipoFiltro === cat.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F5F9] dark:bg-zinc-900 text-slate-600 font-semibold border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2 px-3 text-[11px]">Código / Ref</th>
                  <th className="py-2 px-3 text-[11px]">Descrição do Produto</th>
                  <th className="py-2 px-3 text-[11px]">Marca / Categoria</th>
                  <th className="py-2 px-3 text-[11px]">Medidas (Aro/Ponte/Haste)</th>
                  <th className="py-2 px-3 font-mono text-[11px]">Custo</th>
                  <th className="py-2 px-3 font-mono text-[11px]">Preço Venda</th>
                  <th className="py-2 px-3 font-mono text-center text-[11px]">Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {produtosFiltrados.map(prod => {
                  const estoqueCritico = prod.estoque_atual <= prod.estoque_minimo;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0284C7]">
                        {prod.codigo_referencia}
                        <span className="block text-[10px] text-slate-400 font-normal">{prod.codigo_barras}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800 dark:text-zinc-200">{prod.nome}</div>
                        {prod.cor && <div className="text-[10px] text-slate-400">Cor: {prod.cor} - {prod.material}</div>}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-700 dark:text-zinc-300">{prod.marca}</span>
                        <div className="text-[10px] text-slate-400">{prod.tipo}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-zinc-400 text-[11px]">
                        {prod.tamanho_aro ? `${prod.tamanho_aro} - ${prod.tamanho_ponte} - ${prod.tamanho_haste}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                        R$ {prod.preco_custo.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-zinc-100 text-[11px]">
                        R$ {prod.preco_venda.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          estoqueCritico 
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                            : 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}>
                          {prod.estoque_atual}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: CATEGORIAS */}
      {abaAtiva === 'CATEGORIAS' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded shadow-sm p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
            <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">Categorias Cadastradas</span>
            <span className="text-[11px] text-slate-400">Classificação de armações e lentes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categorias.map(cat => (
              <div key={cat.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800 text-xs">
                <span className="font-bold text-slate-800 dark:text-zinc-200">{cat.nome}</span>
                <span className="font-mono font-bold bg-sky-100 dark:bg-sky-950 text-[#0284C7] px-2 py-0.5 rounded text-[11px]">
                  {cat.total} produtos
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: MARCAS */}
      {abaAtiva === 'MARCAS' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded shadow-sm p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
            <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">Marcas & Fabricantes Oficiais</span>
            <span className="text-[11px] text-slate-400">Grifes internacionais e laboratórios de lentes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {marcas.map(m => (
              <div key={m.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800 text-xs">
                <div>
                  <strong className="block text-slate-900 dark:text-zinc-100">{m.nome}</strong>
                  <span className="text-[11px] text-slate-500">{m.pais}</span>
                </div>
                <span className="font-mono font-bold bg-sky-100 dark:bg-sky-950 text-[#0284C7] px-2 py-0.5 rounded text-[11px]">
                  {m.produtos} itens
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: UNIDADES */}
      {abaAtiva === 'UNIDADES' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded shadow-sm p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
            <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">Unidades de Medida</span>
            <span className="text-[11px] text-slate-400">Padrão para estoque e emissão fiscal</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unidades.map(un => (
              <div key={un.id} className="p-3 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800 text-xs flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-base text-[#0284C7]">{un.sigla}</span>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200">{un.descricao}</p>
                </div>
                <span className="text-[11px] text-slate-500 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-slate-200 dark:border-zinc-700">
                  {un.uso}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 5: TIPOS DE MATERIAL */}
      {abaAtiva === 'MATERIAIS' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded shadow-sm p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
            <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">Materiais de Armações e Lentes</span>
            <span className="text-[11px] text-slate-400">Guia técnico para montagem e vendas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {materiais.map(mat => (
              <div key={mat.id} className="p-3 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800 text-xs space-y-1">
                <div className="flex justify-between items-start">
                  <strong className="text-slate-900 dark:text-zinc-100">{mat.nome}</strong>
                  <span className="text-[10px] font-mono bg-sky-100 dark:bg-sky-950 text-[#0284C7] px-1.5 py-0.5 rounded font-bold">
                    {mat.uso}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{mat.caracteristica}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Novo Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-lg shadow-2xl w-full max-w-lg p-5 space-y-3 my-8 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Cadastrar Novo Produto</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Tipo de Produto *</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value as TipoProduto)} className="neo-select">
                    <option value="ARMACAO_GRAU">Armação de Grau</option>
                    <option value="SOLAR">Óculos Solar</option>
                    <option value="LENTE_OFTALMICA">Lente Oftálmica (Par)</option>
                    <option value="LENTE_CONTATO">Lente de Contato</option>
                    <option value="ACESSORIO">Acessório / Limpeza</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Marca / Grife *</label>
                  <select value={marca} onChange={e => setMarca(e.target.value)} className="neo-select">
                    {marcas.map(m => <option key={m.id} value={m.nome}>{m.nome}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Nome / Modelo *</label>
                <input type="text" required placeholder="Ex: Ray-Ban Clubmaster Acetato" value={nome} onChange={e => setNome(e.target.value)} className="neo-input" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Código / Referência</label>
                  <input type="text" placeholder="RB5154" value={referencia} onChange={e => setReferencia(e.target.value)} className="neo-input font-mono" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Material</label>
                  <select value={material} onChange={e => setMaterial(e.target.value)} className="neo-select">
                    {materiais.map(m => <option key={m.id} value={m.nome}>{m.nome}</option>)}
                  </select>
                </div>
              </div>

              {(tipo === 'ARMACAO_GRAU' || tipo === 'SOLAR') && (
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-zinc-900 p-2 rounded text-center">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-mono">Aro (mm)</label>
                    <input type="number" value={aro} onChange={e => setAro(parseInt(e.target.value) || 0)} className="neo-input text-center py-0.5" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-mono">Ponte (mm)</label>
                    <input type="number" value={ponte} onChange={e => setPonte(parseInt(e.target.value) || 0)} className="neo-input text-center py-0.5" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-mono">Haste (mm)</label>
                    <input type="number" value={haste} onChange={e => setHaste(parseInt(e.target.value) || 0)} className="neo-input text-center py-0.5" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-bold mb-1">Preço Custo</label>
                  <input type="number" step="0.01" value={precoCusto || ''} placeholder="0.00" onChange={e => setPrecoCusto(parseFloat(e.target.value) || 0)} className="neo-input font-mono" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Preço Venda *</label>
                  <input type="number" step="0.01" required value={precoVenda || ''} placeholder="0.00" onChange={e => setPrecoVenda(parseFloat(e.target.value) || 0)} className="neo-input font-mono font-bold" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Qtd Estoque</label>
                  <input type="number" value={estoqueAtual} onChange={e => setEstoqueAtual(parseInt(e.target.value) || 0)} className="neo-input font-mono" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Estoque Mín.</label>
                  <input type="number" value={estoqueMinimo} onChange={e => setEstoqueMinimo(parseInt(e.target.value) || 0)} className="neo-input font-mono" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="neo-button-secondary">Cancelar</button>
                <button type="submit" className="neo-button-primary">Salvar no Estoque</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
