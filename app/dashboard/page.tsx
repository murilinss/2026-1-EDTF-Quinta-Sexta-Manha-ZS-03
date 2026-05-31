"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { FileText, CreditCard, CheckCircle, Flame, Plus, Clock } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const metrics = [
  { label: "PDFs Estudados", value: "2", icon: FileText, color: "bg-primary" },
  { label: "Flashcards Criados", value: "8", icon: CreditCard, color: "bg-accent" },
  { label: "Questões Acertadas", value: "89%", icon: CheckCircle, color: "bg-success" },
  { label: "Dias de Estudo", value: "3", icon: Flame, color: "bg-warning" },
];

const recentDocuments = [
  { name: "Cálculo I - Derivadas", progress: 85, date: "Há 2 horas" },
  { name: "Física - Mecânica Clássica", progress: 60, date: "Há 1 dia" },
  { name: "Química Orgânica", progress: 45, date: "Há 2 dias" },
  { name: "Biologia Celular", progress: 30, date: "Há 3 dias" },
];

const upcomingExams = [
  { name: "Prova de Cálculo I", date: "15 Jun", type: "Prova" },
  { name: "Entrega - Trabalho de Física", date: "18 Jun", type: "Trabalho" },
  { name: "Prova de Química", date: "22 Jun", type: "Prova" },
];

export default function DashboardPage() {
  const router = useRouter();

useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    if (!data.user) {
      router.push("/login");
    }
  });
}, []);
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
          <div
            key={metric.label}
            className="rounded-xl bg-card p-5"
          >
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
            <div className="space-y-4">
              {recentDocuments.map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-4"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="font-medium text-foreground">{doc.name}</h3>
                      <span className="text-sm text-muted-foreground">{doc.progress}%</span>
                    </div>
                    <div className="mb-2 h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${doc.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {doc.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-xl bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Próximos Eventos</h2>
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.name}
                  className="rounded-lg border border-border p-4"
                >
                  <h3 className="mb-1 font-medium text-foreground">{exam.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{exam.date}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        exam.type === "Prova"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      {exam.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
