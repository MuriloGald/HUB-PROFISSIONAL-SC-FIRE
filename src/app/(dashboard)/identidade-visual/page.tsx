"use client";

import { useState } from "react";
import { Image as ImageIcon, Palette, Type, Boxes, FileText, Clipboard, Check, Eye } from "lucide-react";

export default function IdentidadeVisualPage() {
  const [activeTab, setActiveTab] = useState<"logos" | "cores" | "tipografia" | "componentes" | "laudo">("logos");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Custom states for transparency previews
  const [bgLogo1, setBgLogo1] = useState<"dark" | "light">("dark");
  const [bgLogo2, setBgLogo2] = useState<"dark" | "light">("dark");
  const [bgLogo3, setBgLogo3] = useState<"dark" | "light">("dark");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const logos = [
    {
      name: "LOGO EM 2D SC FIRE.png",
      src: "/LOGO EM 2D SC FIRE.png",
      desc: "Logo oficial clássica em formato 2D. Utilizada como a assinatura corporativa principal da empresa.",
      bg: bgLogo1,
      setBg: setBgLogo1,
      dest: "Assinaturas e materiais gerais"
    },
    {
      name: "logo-sc-fire.png",
      src: "/logo-sc-fire.png",
      desc: "Versão simplificada da marca. Ideal para cabeçalhos de aplicativos, favicon, ícones e layouts menores.",
      bg: bgLogo2,
      setBg: setBgLogo2,
      dest: "Cabeçalhos Web & Relatórios"
    },
    {
      name: "logo-scfire.png",
      src: "/logo-scfire.png",
      desc: "Variação da logo em formato horizontal e integrada. Perfeita para barras de navegação estreitas e rodapés.",
      bg: bgLogo3,
      setBg: setBgLogo3,
      dest: "Sistemas Web / Next.js"
    }
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Identidade Visual</h1>
          <p className="text-sm text-gray-400 mt-1">Guia oficial de design, paleta de cores e tipografia da SC FIRE.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.08] pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab("logos")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "logos"
              ? "border-red-500 text-red-500"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Logos
        </button>
        <button
          onClick={() => setActiveTab("cores")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "cores"
              ? "border-red-500 text-red-500"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Palette className="w-4 h-4" />
          Paleta de Cores
        </button>
        <button
          onClick={() => setActiveTab("tipografia")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "tipografia"
              ? "border-red-500 text-red-500"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Type className="w-4 h-4" />
          Tipografia
        </button>
        <button
          onClick={() => setActiveTab("componentes")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "componentes"
              ? "border-red-500 text-red-500"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Boxes className="w-4 h-4" />
          Componentes UI
        </button>
        <button
          onClick={() => setActiveTab("laudo")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "laudo"
              ? "border-red-500 text-red-500"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          Padrão de Laudo PDF
        </button>
      </div>

      {/* Content tabs */}
      <div className="mt-6">
        {/* LOGOS */}
        {activeTab === "logos" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {logos.map((logo) => (
              <div key={logo.name} className="flex flex-col rounded-xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
                <div 
                  className={`h-48 relative flex items-center justify-center p-6 border-b border-white/[0.08] transition-colors duration-300 ${
                    logo.bg === "light" 
                      ? "bg-white" 
                      : "bg-[#0c0e15] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"
                  }`}
                >
                  <img src={logo.src} alt={logo.name} className="max-h-36 max-w-full object-contain" />
                  <button
                    onClick={() => logo.setBg(logo.bg === "light" ? "dark" : "light")}
                    title="Alternar Fundo"
                    className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white mb-2">{logo.name}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{logo.desc}</p>
                  </div>
                  <div className="border-t border-white/[0.06] pt-4 mt-auto">
                    <div className="flex justify-between text-[11px] text-gray-500 mb-4">
                      <span>Destino:</span>
                      <span className="font-medium text-gray-300">{logo.dest}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`/public${logo.src}`, logo.name)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-white transition-all"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      Copiar Caminho no Projeto
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CORES */}
        {activeTab === "cores" && (
          <div className="space-y-8">
            {/* Institucionais */}
            <div>
              <h2 className="text-lg font-bold text-white border-l-2 border-red-500 pl-2 mb-4">Cores Institucionais</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { name: "Vermelho Fogo", hex: "#ff4b2b", desc: "Cor do fogo principal. Ações primárias e destaques importantes." },
                  { name: "Rosa Fênix", hex: "#ff416c", desc: "Tonalidade vibrante complementar utilizada no gradiente de marca." },
                  { name: "Laranja Brasa", hex: "#ff7b00", desc: "Laranja de destaque secundário, atenção moderada." },
                  { name: "Vermelho Escuro", hex: "#a81d07", desc: "Vermelho fechado para linhas de divisão de laudos e PDFs formais." }
                ].map((color) => (
                  <div key={color.hex} className="rounded-xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
                    <div className="h-24 w-full" style={{ backgroundColor: color.hex }} />
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <strong className="text-sm text-white font-display">{color.name}</strong>
                        <button 
                          onClick={() => copyToClipboard(color.hex, color.name)}
                          className="text-[11px] text-red-400 hover:text-red-300 font-mono transition-colors"
                        >
                          {color.hex}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{color.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Neutras */}
            <div>
              <h2 className="text-lg font-bold text-white border-l-2 border-red-500 pl-2 mb-4">Neutras e Estrutura</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { name: "Fundo Geral (Escuro)", hex: "#080a10", desc: "Cor de fundo principal para telas e aplicativos no modo escuro." },
                  { name: "Fundo de Card / Caixa", hex: "#111625", desc: "Tons de cinza-escuro azulado para tabelas, menus e inputs." },
                  { name: "Fundo Geral (Claro)", hex: "#f1f5f9", desc: "Cor cinza-clara suave para relatórios externos e páginas públicas." },
                  { name: "Papel de Laudo", hex: "#ffffff", desc: "Branco puro para os fundos de vias geradas em PDF impresso." }
                ].map((color) => (
                  <div key={color.hex} className="rounded-xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
                    <div className="h-24 w-full border-b border-white/[0.06]" style={{ backgroundColor: color.hex }} />
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <strong className="text-sm text-white font-display">{color.name}</strong>
                        <button 
                          onClick={() => copyToClipboard(color.hex, color.name)}
                          className="text-[11px] text-red-400 hover:text-red-300 font-mono transition-colors"
                        >
                          {color.hex}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{color.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <h2 className="text-lg font-bold text-white border-l-2 border-red-500 pl-2 mb-4">Estados e Feedback</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { name: "Conforme / OK", hex: "#10b981", desc: "Sucesso ou conformidade em requisitos de vistoria." },
                  { name: "Não Conforme / NOK", hex: "#ef4444", desc: "Erro ou não conformidade técnica exigindo adequações." },
                  { name: "Atenção / Aviso", hex: "#f59e0b", desc: "Pendência moderada ou melhoria recomendada." },
                  { name: "Não Aplicável / N/A", hex: "#64748b", desc: "Itens que não se aplicam à vistoria local." }
                ].map((color) => (
                  <div key={color.hex} className="rounded-xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
                    <div className="h-24 w-full" style={{ backgroundColor: color.hex }} />
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <strong className="text-sm text-white font-display">{color.name}</strong>
                        <button 
                          onClick={() => copyToClipboard(color.hex, color.name)}
                          className="text-[11px] text-red-400 hover:text-red-300 font-mono transition-colors"
                        >
                          {color.hex}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{color.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TIPOGRAFIA */}
        {activeTab === "tipografia" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Fonte Display (Títulos)</span>
                <h3 className="text-3xl font-extrabold text-white font-display mt-2">Outfit</h3>
                <p className="text-sm text-gray-400 mt-1">Utilizada em cabeçalhos, logos institucionais e destaques visuais do painel.</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
                  <div>
                    <div className="text-xs text-gray-500">Título Principal (H1)</div>
                    <div className="text-[11px] font-mono text-red-400">24px / 900 Black</div>
                  </div>
                  <div className="font-display text-2xl font-black text-white">SC FIRE</div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
                  <div>
                    <div className="text-xs text-gray-500">Títulos de Seção (H2)</div>
                    <div className="text-[11px] font-mono text-red-400">18px / 800 ExtraBold</div>
                  </div>
                  <div className="font-display text-lg font-extrabold text-white">PARECER TÉCNICO</div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <div className="text-xs text-gray-500">Subtítulos (H3)</div>
                    <div className="text-[11px] font-mono text-red-400">14px / 600 SemiBold</div>
                  </div>
                  <div className="font-display text-sm font-semibold text-white">Dados do Imóvel</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Fonte Sans (Texto e Tabelas)</span>
                <h3 className="text-3xl font-bold text-white font-sans mt-2">Inter</h3>
                <p className="text-sm text-gray-400 mt-1">Utilizada para textos longos, tabelas técnicas, relatórios e dados do formulário.</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
                  <div>
                    <div className="text-xs text-gray-500">Corpo de Leitura</div>
                    <div className="text-[11px] font-mono text-red-400">14px / 400 Regular</div>
                  </div>
                  <div className="font-sans text-sm text-gray-300">Este laudo avalia a segurança de SAVE.</div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
                  <div>
                    <div className="text-xs text-gray-500">Tabelas e CNPJ</div>
                    <div className="text-[11px] font-mono text-red-400">12px / 500 Medium</div>
                  </div>
                  <div className="font-sans text-xs font-medium text-gray-300">CNPJ: 20.544.712/0001-89</div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <div className="text-xs text-gray-500">Status Tags</div>
                    <div className="text-[11px] font-mono text-red-400">11px / 600 SemiBold</div>
                  </div>
                  <div className="font-sans text-[11px] font-semibold text-gray-300 uppercase">NÃO APLICÁVEL</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPONENTES */}
        {activeTab === "componentes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buttons & Alerts */}
            <div className="space-y-6">
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-white/[0.06] pb-3">Botões</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all">
                    Primário Fogo
                  </button>
                  <button className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all">
                    Secundário Outline
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 text-xs font-semibold rounded-lg transition-all">
                    Conforme
                  </button>
                  <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 text-xs font-semibold rounded-lg transition-all">
                    Não Conforme
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-white/[0.06] pb-3">Status e Alertas</h3>
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 text-xs leading-relaxed">
                  <strong className="block mb-1 text-[11px] tracking-wide uppercase font-bold text-emerald-300">DISPENSADO DE PBD (CONFORME)</strong>
                  A edificação cumpre com as exigências do Art. 6º da IN 23/CBMSC, estando dispensada do Projeto Baseado em Desempenho.
                </div>
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/15 text-red-400 text-xs leading-relaxed">
                  <strong className="block mb-1 text-[11px] tracking-wide uppercase font-bold text-red-300">EXIGE PBD (NÃO CONFORME)</strong>
                  Identificadas inconformidades no local vistoriado que impossibilitam o enquadramento simplificado de dispensa da IN 23.
                </div>
              </div>
            </div>

            {/* Inputs & Form layout */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-white/[0.06] pb-3">Campos de Formulário</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nome do Condomínio</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Residencial Gran Reserva" 
                    className="w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Classificação Comercial</label>
                  <select className="w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all">
                    <option className="bg-[#111625]">SAVE23 (Viatura Elétrica)</option>
                    <option className="bg-[#111625]">PPCI (Projeto Técnico)</option>
                    <option className="bg-[#111625]">Vistoria de Habite-se</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LAUDO PREVIEW */}
        {activeTab === "laudo" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-4xl p-10 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 flex flex-col gap-6">
              {/* PDF Header Simulation */}
              <div className="flex justify-between items-center border-b-2 border-[#a81d07] pb-4">
                <div className="flex items-center gap-4 flex-1">
                  <img src="/logo-sc-fire.png" alt="SC FIRE Logo" className="h-[72px] object-contain" />
                  <div className="flex flex-col text-[10px] text-gray-800 leading-tight">
                    <strong className="font-bold text-[11px] text-black">EZS Consultoria e Treinamentos LTDA</strong>
                    <span>CNPJ 20.544.712/0001-89</span>
                  </div>
                </div>
                <div className="w-[1px] h-12 bg-gray-300 mx-5" />
                <div className="flex flex-col text-right text-[9.5px] text-gray-600 leading-normal flex-1">
                  <span>R. Hermes Zapelini, 513 - sala 02</span>
                  <span>Barreiros, São José - SC, 88.110-050</span>
                  <span className="flex justify-end gap-2 font-medium text-gray-800">
                    <span>(48) 99141-2186</span>
                    <span>|</span>
                    <span>(48) 3093 6140</span>
                  </span>
                  <span>contato@scfire.com.br</span>
                </div>
              </div>

              {/* PDF Title */}
              <div className="text-center font-bold text-sm tracking-wide text-black uppercase my-4">
                LAUDO TÉCNICO DE CONFORMIDADE – IMPLANTAÇÃO DE SAVE (IN 23/CBMSC)
              </div>

              {/* PDF Content */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-[12px] font-bold text-black border-b border-gray-200 pb-1 uppercase">1. Informações do Imóvel</h4>
                  <table className="w-full border-collapse text-[11.5px]">
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2 font-semibold text-gray-600 bg-gray-50/50 w-1/4">Edificação</td>
                        <td className="border border-gray-300 p-2 text-gray-800">Condomínio Residencial Gran Reserva</td>
                        <td className="border border-gray-300 p-2 font-semibold text-gray-600 bg-gray-50/50 w-1/4">Endereço</td>
                        <td className="border border-gray-300 p-2 text-gray-800">Rua dos Nobres, 200 - Centro, Criciúma/SC</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-semibold text-gray-600 bg-gray-50/50">Síndico</td>
                        <td className="border border-gray-300 p-2 text-gray-800">Claudio Santos (Administrador)</td>
                        <td className="border border-gray-300 p-2 font-semibold text-gray-600 bg-gray-50/50">Área do Setor</td>
                        <td className="border border-gray-300 p-2 text-gray-800">420 m²</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[12px] font-bold text-black border-b border-gray-200 pb-1 uppercase">2. Parecer e Conclusão Técnica</h4>
                  <p className="text-[11.5px] leading-relaxed text-gray-700">
                    Certifico que o setor de garagens do subsolo 1 do Condomínio Residencial Gran Reserva foi submetido a inspeção técnica de conformidade com a Instrução Normativa 23 do CBMSC. Constatou-se a presença de ventilação natural permanente, sistema de detecção e alarme de incêndio instalados e em perfeito funcionamento, adequando o local ao <strong className="text-black">Inciso IV, Alínea b</strong> para dispensa de PBD.
                  </p>
                </div>
              </div>

              {/* Signature simulation */}
              <div className="mt-8 flex flex-col items-center text-center gap-1 text-[11px] text-gray-600">
                <div className="w-48 h-px bg-gray-400 mb-2" />
                <strong className="text-black font-semibold text-[11.5px]">Eng.ª Dione Borges</strong>
                <span>Responsável Técnica - CREA-SC 177797-2</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating feedback alert for copies */}
      {copiedText && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-xl animate-fade-in">
          <Check className="w-4 h-4" />
          <span className="text-xs font-semibold">Copiado: {copiedText}</span>
        </div>
      )}
    </div>
  );
}
