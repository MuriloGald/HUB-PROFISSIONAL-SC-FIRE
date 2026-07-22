"use client";

import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface Imagem {
  url: string;
  legenda?: string;
}

interface ImageUploaderProps {
  imagens: Imagem[];
  onChange: (imagens: Imagem[]) => void;
  bucket?: string;
  multiplas?: boolean;
}

/** Upload de imagens genérico (croquis, plantas, fotos) para o Supabase Storage — reutilizado pelos "preenchíveis" que anexam imagem. */
export function ImageUploader({ imagens, onChange, bucket = "documentos-cbmsc-imagens", multiplas = true }: ImageUploaderProps) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleFile(file: File) {
    setErro("");
    setEnviando(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600" });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      const nova = { url: data.publicUrl, legenda: "" };
      onChange(multiplas ? [...imagens, nova] : [nova]);
    } catch {
      setErro("Não consegui enviar a imagem — tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  function atualizarLegenda(i: number, legenda: string) {
    onChange(imagens.map((img, idx) => (idx === i ? { ...img, legenda } : img)));
  }

  function remover(i: number) {
    onChange(imagens.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      {(multiplas || imagens.length === 0) && (
        <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-white/[0.15] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 text-xs font-semibold rounded-lg cursor-pointer transition-all">
          {enviando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
          {imagens.length === 0 ? "Adicionar imagem" : "Adicionar outra imagem"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={enviando}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </label>
      )}
      {erro && <p className="text-xs text-red-400">{erro}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {imagens.map((img, i) => (
          <div key={img.url} className="relative rounded-lg border border-white/[0.08] overflow-hidden bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="w-full h-40 object-cover" />
            <button
              type="button"
              onClick={() => remover(i)}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg bg-black/60 hover:bg-red-500/80 text-white transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <input
              placeholder="Legenda (opcional)"
              value={img.legenda ?? ""}
              onChange={(e) => atualizarLegenda(i, e.target.value)}
              className="w-full px-2 py-1.5 text-xs text-white bg-black/40 border-t border-white/[0.08] focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
