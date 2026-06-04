"use client";

import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Send, Bot, User, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [docName, setDocName] = useState<string | null>(null);
  const [docSummary, setDocSummary] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDoc = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("documents")
        .select("name, summary")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setDocName(data.name);
        setDocSummary(data.summary);
        setMessages([{
          id: 1,
          role: "assistant",
          content: `Olá! Sou seu Tutor IA. Estou aqui para ajudá-lo a entender o conteúdo de **${data.name}**. Pode me fazer qualquer pergunta sobre o material!`,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        }]);
      } else {
        setMessages([{
          id: 1,
          role: "assistant",
          content: "Olá! Sou seu Tutor IA. Faça upload de um PDF primeiro para que eu possa ajudá-lo com o conteúdo.",
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        }]);
      }
    };

    loadDoc();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const systemPrompt = docSummary
        ? `Você é um tutor universitário brasileiro. Responda APENAS com base no seguinte conteúdo do documento "${docName}":\n\n${docSummary}\n\nSe a pergunta não estiver relacionada ao conteúdo, diga que só pode responder sobre o material enviado.`
        : "Você é um tutor universitário brasileiro. Ajude o aluno com suas dúvidas acadêmicas.";

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: input },
        ],
      });

      const assistantMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: response.choices[0].message.content || "Não consegui responder.",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [...prev, {
        id: messages.length + 2,
        role: "assistant",
        content: "Erro ao processar sua pergunta. Tente novamente.",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-48px)] flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tutor IA</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{docName ? `Baseado em: ${docName}` : "Nenhum documento carregado"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-card">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[80%] gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.role === "user" ? "bg-primary" : "bg-muted"}`}>
                      {message.role === "user" ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-foreground" />}
                    </div>
                    <div>
                      <div className={`rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      <span className={`mt-1 block text-xs text-muted-foreground ${message.role === "user" ? "text-right" : "text-left"}`}>
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Bot className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="rounded-2xl bg-muted px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-border p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Faça uma pergunta sobre o material..."
                className="flex-1 rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}