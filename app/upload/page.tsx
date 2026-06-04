"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Upload, FileText, Sparkles, CreditCard, X } from "lucide-react";
import { gerarResumo, gerarFlashcards } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") setFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleGenerateSummary = async () => {
    if (!file) return;
    setIsProcessing(true);
    setSummary(null);

    try {
      const pdfjsLib = await import("pdfjs-dist");
     pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
        fullText += pageText + "\n";
      }

      const resumo = await gerarResumo(fullText);
      setSummary(resumo);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("documents").insert({
          user_id: user.id,
          name: file.name,
          summary: resumo,
        }).select().single();
        if (data) setDocId(data.id);
      }

    } catch (err) {
      console.error(err);
      setSummary("Erro ao gerar resumo. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateFlashcards = async () => {
    if (!file || !summary) return;
    setIsProcessing(true);

    try {
      const flashcards = await gerarFlashcards(summary);

      const { data: { user } } = await supabase.auth.getUser();
      if (user && docId) {
        await supabase.from("flashcards").insert(
          flashcards.map(f => ({
            user_id: user.id,
            document_id: docId,
            question: f.question,
            answer: f.answer,
          }))
        );
      }

      router.push("/flashcards-ia");
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setSummary(null);
    setDocId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Upload PDF</h1>
        <p className="text-muted-foreground">
          Faça upload do seu PDF para gerar resumos e flashcards com IA.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed bg-card p-8 transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            {file ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <p className="mb-1 font-medium text-foreground">{file.name}</p>
                <p className="mb-4 text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={handleRemoveFile}
                  className="flex items-center gap-1 text-sm text-destructive hover:underline"
                >
                  <X className="h-4 w-4" />
                  Remover arquivo
                </button>
              </div>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mb-2 text-lg font-medium text-foreground">Arraste seu PDF aqui</p>
                <p className="mb-4 text-sm text-muted-foreground">ou clique para selecionar</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
                >
                  Selecionar Arquivo
                </label>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleGenerateSummary}
              disabled={!file || isProcessing}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-5 w-5" />
              {isProcessing ? "Gerando..." : "Gerar Resumo com IA"}
            </button>
            <button
              onClick={handleCreateFlashcards}
              disabled={!summary || isProcessing}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard className="h-5 w-5" />
              {isProcessing ? "Criando..." : "Criar Flashcards"}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Resumo IA</h2>
          </div>

          {summary ? (
            <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {summary}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Faça upload de um PDF e clique em &quot;Gerar Resumo com IA&quot; para ver o resumo aqui.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}