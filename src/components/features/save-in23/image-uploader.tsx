"use client";

import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Imagem } from "@/lib/save-in23/types";

const BUCKET = "save23-imagens";

interface ImageUploaderProps {
  imagens: Imagem[];
  onChange: (imagens: Imagem[]) => void;
}

/** Upload de fotos (setor da vistoria / subseção do laudo) para o Supabase Storage. */
export function ImageUploader({ imagens, onChange }: ImageUploaderProps) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleFile(file: File) {
    setErro("");
    setEnviando(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600" });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange([...imagens, { url: data.publicUrl, legenda: "" }]);
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
      <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-white/[0.15] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 text-xs font-semibold rounded-lg cursor-pointer transition-all">
        {enviando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
        Adicionar foto
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
      {erro && <p className="text-xs text-red-400">{erro}</p>}

      {imagens.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {imagens.map((img, i) => (
            <div key={img.url} className="rounded-lg border border-white/[0.08] overflow-hidden bg-black/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.legenda || "Foto"} className="w-full h-24 object-cover" />
              <div className="p-1.5 flex items-center gap-1">
                <input
                  value={img.legenda ?? ""}
                  onChange={(e) => atualizarLegenda(i, e.target.value)}
                  placeholder="Legenda (opcional)"
                  className="flex-1 min-w-0 px-1.5 py-1 text-[10px] text-white bg-black/30 border border-white/[0.08] rounded"
                />
                <button
                  type="button"
                  onClick={() => remover(i)}
                  className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-gray-500 hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
