import { useEffect, useState } from "react";
import { MessageSquare, TrendingUp, Trophy, XCircle } from "lucide-react";
import { Badge, Card, CardContent, Spinner } from "@/components/ui";
import { backend } from "@/lib/backend";
import { useAuth } from "@/hooks/useAuth";
import type { Chat, CrmCard } from "@/types/domain";
import { formatPhone, initials } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CrmCard[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [active, setActive] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [c, ch] = await Promise.all([
        backend.listCrmCards(user.id),
        backend.listChats(user.id),
      ]);
      setCards(c);
      setChats(ch);
      setActive(ch[0] ?? null);
      setLoading(false);
    })();
  }, [user]);

  const count = (s: CrmCard["stage"]) => cards.filter((c) => c.stage === s).length;

  const metrics = [
    { label: "Conversas", value: count("conversas"), icon: MessageSquare, tone: "primary" as const },
    { label: "Negociando", value: count("negociando"), icon: TrendingUp, tone: "warning" as const },
    { label: "Ganho", value: count("ganho"), icon: Trophy, tone: "success" as const },
    { label: "Perda", value: count("perda"), icon: XCircle, tone: "destructive" as const },
  ];

  if (loading) return <Spinner className="mx-auto mt-20 h-8 w-8" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral das conversas e do funil.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="flex items-center gap-4 pt-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent">
                <m.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{m.value}</div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversas — visualização somente leitura (docs §7.9) */}
      <Card>
        <CardContent className="p-0">
          <div className="grid md:grid-cols-[280px_1fr]">
            <div className="border-r max-h-[420px] overflow-y-auto thin-scroll">
              <div className="px-4 py-3 text-sm font-medium border-b">Conversas recentes</div>
              {chats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary ${
                    active?.id === c.id ? "bg-secondary" : ""
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {initials(c.lead_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium">{c.lead_name}</span>
                      {c.unread > 0 && <Badge tone="primary">{c.unread}</Badge>}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{c.last_message}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex max-h-[420px] flex-col">
              {active ? (
                <>
                  <div className="border-b px-5 py-3">
                    <div className="font-medium">{active.lead_name}</div>
                    <div className="text-xs text-muted-foreground">{formatPhone(active.phone)}</div>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto thin-scroll bg-secondary/40 p-5">
                    {active.messages.map((m) => (
                      <div key={m.id} className={`flex ${m.from === "agent" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            m.from === "agent"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border"
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t px-5 py-3 text-center text-xs text-muted-foreground">
                    Visualização somente leitura — o agente responde automaticamente.
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                  Selecione uma conversa
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
