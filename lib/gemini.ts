import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function gerarResumo(texto: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "Você é um tutor universitário brasileiro. Gere resumos estruturados em tópicos claros e objetivos, em português.",
      },
      {
        role: "user",
        content: `Analise o texto abaixo e gere um resumo estruturado em tópicos claros, destacando os conceitos mais importantes:\n\n${texto}`,
      },
    ],
  });

  return response.choices[0].message.content || "";
}

export async function gerarFlashcards(texto: string): Promise<{ question: string; answer: string }[]> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "Você é um tutor universitário brasileiro. Responda APENAS com JSON válido, sem markdown.",
      },
      {
        role: "user",
        content: `Com base no texto abaixo, gere 5 flashcards no formato JSON:\n\n${texto}\n\nFormato: [{"question": "pergunta", "answer": "resposta"}]`,
      },
    ],
  });

  const text = response.choices[0].message.content || "[]";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}