"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Sparkles, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

type Flashcard = {
  id: string;
  question: string;
  answer: string;
};

type FeedbackType = "correct" | "partial" | "incorrect" | null;

export default function FlashcardsIAPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
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
        .limit(10);

      if (data && data.length > 0) setFlashcards(data);
      setLoading(false);
    };

    loadFlashcards();
  }, []);

  const currentQuestion = flashcards[currentIndex];

  const handleEvaluate = async () => {
    if (!userAnswer.trim() || !currentQuestion) return;
    setIsEvaluating(true);

    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Você é um tutor universitário brasileiro. Avalie respostas de alunos de forma construtiva. Responda APENAS com JSON válido: {\"status\": \"CORRETO|PARCIAL|INCORRETO\", \"feedback\": \"sua explicação aqui\"}",
          },
          {
            role: "user",
            content: `Pergunta: ${currentQuestion.question}\nResposta esperada: ${currentQuestion.answer}\nResposta do aluno: ${userAnswer}\n\nAvalie a resposta do aluno.`,
          },
        ],
      });

      const text = response.choices[0].message.content || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      const result = JSON.parse(clean);

      const statusMap: Record<string, FeedbackType> = {
        CORRETO: "correct",
        PARCIAL: "partial",
        INCORRETO: "incorrect",
      };

      setFeedback(statusMap[result.status] || "incorrect");
      setFeedbackText(result.feedback);
    } catch {
      setFeedback("partial");
      setFeedbackText("Não foi possível avaliar automaticamente. Confira a resposta esperada.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    setUserAnswer("");
    setFeedback(null);
    setFeedbackText("");
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const getFeedbackStyles = () => {
    switch (feedback) {
      case "correct": return "border-success bg-success/10";
      case "partial": return "border-warning bg-warning/10";
      case "incorrect": return "border-destructive bg-destructive/10";
      default: return "";
    }
  };

  const getFeedbackTitle = () => {
    switch (feedback) {
      case "correct": return { text: "Correto!", color: "text-success" };
      case "partial": return { text: "Parcialmente correto", color: "text-warning" };
      case "incorrect": return { text: "Precisa melhorar", color: "text-destructive" };
      default: return { text: "", color: "" };
    }
  };

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
        <h1 className="text-2xl font-bold text-foreground">Flashcards IA</h1>
        <p className="text-muted-foreground">Responda às perguntas e receba avaliação inteligente da IA.</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium text-foreground">
              Card {currentIndex + 1} de {flashcards.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-card p-6">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Pergunta
          </span>
          <p className="text-lg font-medium leading-relaxed text-foreground">
            {currentQuestion.question}
          </p>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">Sua resposta</label>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Digite sua resposta aqui..."
            rows={5}
            className="w-full resize-none rounded-xl border border-border bg-input p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          onClick={handleEvaluate}
          disabled={!userAnswer.trim() || isEvaluating}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-5 w-5" />
          {isEvaluating ? "Avaliando..." : "Avaliar com IA"}
        </button>

        {feedback && (
          <div className={`mb-6 rounded-xl border-2 p-6 ${getFeedbackStyles()}`}>
            <h3 className={`mb-2 text-lg font-semibold ${getFeedbackTitle().color}`}>
              {getFeedbackTitle().text}
            </h3>
            <p className="mb-4 text-foreground">{feedbackText}</p>
            <div className="rounded-lg bg-card/50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Resposta esperada
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {currentQuestion.answer}
              </p>
            </div>
          </div>
        )}

        {feedback && (
          <button
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Próximo Card
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </DashboardLayout>
  );
}