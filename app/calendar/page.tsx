"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

interface Event {
  id: number;
  name: string;
  date: string;
  type: "Prova" | "Trabalho";
  day: number;
}

const mockEvents: Event[] = [
  { id: 1, name: "Prova de Cálculo I", date: "15 Jun", type: "Prova", day: 15 },
  { id: 2, name: "Entrega - Trabalho de Física", date: "18 Jun", type: "Trabalho", day: 18 },
  { id: 3, name: "Prova de Química", date: "22 Jun", type: "Prova", day: 22 },
  { id: 4, name: "Seminário de Biologia", date: "25 Jun", type: "Trabalho", day: 25 },
  { id: 5, name: "Prova Final - Física", date: "28 Jun", type: "Prova", day: 28 },
];

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState<{ name: string; date: string; type: "Prova" | "Trabalho" }>({ name: "", date: "", type: "Prova" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDay = (day: number) => {
    return mockEvents.filter((event) => event.day === day);
  };

  const renderCalendarDays = () => {
    const days = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 rounded-lg bg-muted/30" />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = day === 10;
      
      days.push(
        <div
          key={day}
          className={`relative h-24 rounded-lg border p-2 transition-colors ${
            isToday
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <span
            className={`text-sm font-medium ${
              isToday ? "text-primary" : "text-foreground"
            }`}
          >
            {day}
          </span>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`h-1.5 w-full rounded-full ${
                  event.type === "Prova" ? "bg-destructive" : "bg-accent"
                }`}
                title={event.name}
              />
            ))}
            {dayEvents.length > 2 && (
              <span className="text-xs text-muted-foreground">+{dayEvents.length - 2}</span>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
          <p className="text-muted-foreground">Organize suas provas e trabalhos.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          Adicionar Evento
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                {months[month]} {year}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviousMonth}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors hover:bg-muted"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>

            <div className="mt-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span className="text-sm text-muted-foreground">Prova</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-accent" />
                <span className="text-sm text-muted-foreground">Trabalho</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-xl bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Próximos Eventos</h2>
            <div className="space-y-3">
              {mockEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-border p-4"
                >
                  <h3 className="mb-2 font-medium text-foreground">{event.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{event.date}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        event.type === "Prova"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Adicionar Evento</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Nome do evento
                </label>
                <input
                  type="text"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  placeholder="Ex: Prova de Cálculo"
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Data
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Tipo
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event["type"] })}
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Prova">Prova</option>
                  <option value="Trabalho">Trabalho</option>s
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg border border-border bg-secondary px-4 py-3 font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
