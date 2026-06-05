"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { FileText, CreditCard, CheckCircle, Flame, Plus, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Document = {
  id: string;
  name: string;
  created_at: string;
};

type Event = {
  id: string;
  name: string;
  date: string;
  type: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [pdfCount, setPdfCount] = useState(0);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const [docsRes, docsCountRes, flashRes, eventsRes] = await Promise.all([
        supabase.from("documents").select("id, name, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
        supabase.from("documents").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("flashcards").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("events").select("*").eq("user_id", user.id).order("date", { ascending: true }).limit(3),
      ]);

      if (docsRes.data) setDocuments(docsRes.data);
      if (docsCountRes.count !== null) setPdfCount(docsCountRes.count);
      if (flashRes.count !== null) setFlashcardCount(flashRes.count);
      if (eventsRes.data) setEvents(eventsRes.data);
      setLoading(false);
    };

    loadData();
  }, [router]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "Z");
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    if (diff < 1) return "Agora mesmo";
    if (diff < 60) return `Há ${diff} minuto${diff > 1 ? "s" : ""}`;
    if (diff < 1440) return `Há ${Math.floor(diff / 60)} hora${Math.floor(diff / 60) > 1 ? "s" : ""}`;
    return `Há ${Math.floor(diff / 1440)} dia${Math.floor(diff / 1440) > 1 ? "s" : ""}`;
  };

  const metrics = [
    { label: "PDFs Estudados", value: pdfCount.toString(), icon: FileText, color: "bg-primary" },
    { label: "Flashcards Criados", value: flashcardCount.toString(), icon: CreditCard, color: "bg-accent" },
    { label: "Questões Acertadas", value: "—", icon: CheckCircle, color: "bg-success" },
    { label: "Dias de Estudo", value: "—", icon: Flame, color: "bg-warning" },
  ];

  if (loading) return (
    <DashboardLayout>
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta! Continue seus estudos.</p>
        </div>
        <Link
          href="/upload"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          Novo Resumo
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl bg-card p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.color}`}>
                <metric.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Documentos Recentes</h2>
            {documents.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-center">
                <p className="text-muted-foreground">Nenhum documento ainda. <Link href="/upload" className="text-primary hover:underline">Faça upload de um PDF</Link>.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-medium text-foreground">{doc.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(doc.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="rounded-xl bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Próximos Eventos</h2>
            {events.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-center">
                <p className="text-muted-foreground text-sm">Nenhum evento cadastrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="rounded-lg border border-border p-4">
                    <h3 className="mb-1 font-medium text-foreground">{event.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{event.date}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${event.type === "Prova" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>
                        {event.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}