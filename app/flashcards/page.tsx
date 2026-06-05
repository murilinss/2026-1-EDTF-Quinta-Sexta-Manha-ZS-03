"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CreditCard, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Flashcard = {
  id: string;
  question: string;
  answer: string;
};

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlashcards = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data && data.length > 0) setFlashcards(data);
      setLoading(false);
    };

    loadFlashcards();
  }, []);

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % flashcards.length), 100);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length), 100);
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  if (loading) return (
    <DashboardLayout>
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Carregando flashcards...</p>
      </div>
    </DashboardLayout>
  );

  if (flashcards.length === 0) return (
    <DashboardLayout>
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <p className="mb-2 text-lg font-medium text-foreground">Nenhum flashcard ainda</p>
        <p className="text-muted-foreground">Faça upload de um PDF e clique em "Criar Flashcards".</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Flashcards</h1>
        <p className="text-muted-foreground">Revise seus conceitos de forma interativa.</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Progresso</span>
          <span className="text-sm text-muted-foreground">
            Card {currentIndex + 1} de {flashcards.length}
          </span>
        </div>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>

        <div
          onClick={handleFlip}
          className="group relative mb-6 min-h-[300px] cursor-pointer"
          style={{ perspective: "1000px" }}
        >
          <div
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 0.5s",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              position: "relative",
              minHeight: "300px",
            }}
          >
            <div
              style={{ backfaceVisibility: "hidden" }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-card p-8"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <span className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pergunta
              </span>
              <p className="text-center text-xl font-medium text-foreground">
                {currentCard.question}
              </p>
              <p className="mt-6 text-sm text-muted-foreground">Clique para ver a resposta</p>
            </div>

            <div
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-card p-8"
            >
              <span className="mb-4 text-xs font-semibold uppercase tracking-wider text-green-500">
                Resposta
              </span>
              <p className="text-center text-lg leading-relaxed text-foreground">
                {currentCard.answer}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrevious}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => { setIsFlipped(false); setCurrentIndex(0); }}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}