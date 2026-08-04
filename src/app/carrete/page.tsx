"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Stack,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Button,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import MainLayout from "@/components/layouts/MainLayout";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import { useRealtime } from "@/context/RealtimeContext";

type ChatMode = "ai" | "community" | "b2b";

type UserLite = {
  _id: string;
  username: string;
  role?: string;
  fotoPerfil?: string;
  profilePicture?: string;
};

type MessageLite = {
  _id: string;
  content: string;
  sender?: UserLite;
  createdAt?: string;
};

type AiBeer = {
  _id: string;
  name: string;
  brewery: string;
  averageRating?: number;
};

type AiPlace = {
  _id: string;
  name: string;
  address?: { city?: string };
  averageRating?: number;
};

type ChatLite = {
  _id: string;
  name?: string;
  isGroup?: boolean;
  chatType?: ChatMode;
  participants: UserLite[];
  lastMessage?: MessageLite;
};

export default function CarretePage() {
  const { isAuthReady } = useAuth();
  const { socket, joinChat, leaveChat, refreshUnread } = useRealtime();
  const router = useRouter();

  const [mode, setMode] = useState<ChatMode>("ai");
  const [chats, setChats] = useState<ChatLite[]>([]);
  const [users, setUsers] = useState<UserLite[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [messages, setMessages] = useState<MessageLite[]>([]);
  const [input, setInput] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiBeers, setAiBeers] = useState<AiBeer[]>([]);
  const [aiPlaces, setAiPlaces] = useState<AiPlace[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setCurrentUserId(parsed?._id || parsed?.id || "");
    }
    // Deep-link desde el buscador del navbar (?ai=...)
    if (typeof window !== "undefined") {
      const aiQ = new URLSearchParams(window.location.search).get("ai");
      if (aiQ) {
        setMode("ai");
        setAiQuestion(aiQ);
        void askAi(aiQ);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode !== "ai") {
      void loadChats(mode);
      void loadUsers();
    }
  }, [mode]);

  useEffect(() => {
    if (!selectedChatId) return;
    void loadMessages(selectedChatId);
    joinChat(selectedChatId);
    // Opening a chat marks it read → clear the navbar badge for it.
    api
      .post(`/chat/${selectedChatId}/read`)
      .then(() => refreshUnread())
      .catch(() => {});
    return () => leaveChat(selectedChatId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId]);

  // Live incoming messages for the conversation currently open.
  useEffect(() => {
    if (!socket) return;
    const onNewMessage = ({
      chatId,
      message,
    }: {
      chatId: string;
      message: MessageLite;
    }) => {
      if (chatId !== selectedChatId) return;
      setMessages((prev) =>
        prev.some((m) => m._id === message._id) ? prev : [...prev, message]
      );
    };
    socket.on("chat:message:new", onNewMessage);
    return () => {
      socket.off("chat:message:new", onNewMessage);
    };
  }, [socket, selectedChatId]);

  const filteredUsers = useMemo(() => {
    if (mode === "community") return users.filter((u) => u.role !== "owner");
    if (mode === "b2b")
      return users.filter((u) => ["owner", "admin", "moderator"].includes(u.role || ""));
    return users;
  }, [users, mode]);

  const loadUsers = async () => {
    try {
      const res = await api.get("/user");
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setUsers(data);
    } catch {
      setUsers([]);
    }
  };

  const loadChats = async (chatType: ChatMode) => {
    try {
      const res = await api.get(`/chat?type=${chatType}`);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setChats(data);
      if (data[0]?._id) setSelectedChatId(data[0]._id);
      else setSelectedChatId("");
    } catch {
      setChats([]);
      setSelectedChatId("");
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const res = await api.get(`/chat/messages/${chatId}`);
      setMessages(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setMessages([]);
    }
  };

  const createDirectChat = async (targetUserId: string) => {
    try {
      const res = await api.post("/chat/direct", {
        targetUserId,
        chatType: mode === "b2b" ? "b2b" : "community",
      });
      const chat = res.data?.data;
      if (chat?._id) {
        await loadChats(mode);
        setSelectedChatId(chat._id);
      }
    } catch {
      // noop
    }
  };

  const sendMessage = async () => {
    if (!selectedChatId || !input.trim()) return;
    try {
      const res = await api.post(`/chat/${selectedChatId}/messages`, {
        content: input,
      });
      const created: MessageLite | undefined = res.data?.data?.message;
      setInput("");
      if (created?._id) {
        setMessages((prev) =>
          prev.some((m) => m._id === created._id) ? prev : [...prev, created]
        );
      }
      // Refresh the conversation list (last message / ordering).
      await loadChats(mode);
    } catch {
      // noop
    }
  };

  const askAi = async (override?: string) => {
    const query = (override ?? aiQuestion).trim();
    if (!query) return;
    if (override !== undefined) setAiQuestion(override);
    setAiLoading(true);
    try {
      const res = await api.post("/chat/ai/query", { query });
      const payload = res.data?.data || {};
      setAiAnswer(payload.answer || "No encontré resultados por ahora.");
      setAiBeers(Array.isArray(payload.beers) ? payload.beers : []);
      setAiPlaces(Array.isArray(payload.places) ? payload.places : []);
    } catch {
      setAiAnswer("No pude consultar ahora. Intenta de nuevo.");
      setAiBeers([]);
      setAiPlaces([]);
    } finally {
      setAiLoading(false);
    }
  };

  const AI_EXAMPLES = [
    "Mejores IPA en Santiago",
    "Lugares pet-friendly",
    "Stout en Valdivia",
    "Terrazas con música en vivo",
    "Cervezas sin alcohol ricas",
  ];

  if (!mounted || !isAuthReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <CircularProgress sx={{ color: "var(--color-amber-primary)" }} />
      </div>
    );
  }

  return (
    <MainLayout
      maxWidth="calc(1140px + 4rem)"
      title="Carrete"
      titleGradientText="Cervecero"
      subtitle="Chatea con la comunidad, haz contactos B2B o consulta a nuestra inteligencia artificial."
    >
      <div className="flex w-full flex-col gap-6">
        <Paper 
          sx={{ 
            bgcolor: "var(--color-surface-card)", 
            color: "var(--color-text-primary)", 
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "16px",
            overflow: "hidden"
          }}
        >
          <Tabs 
            value={mode} 
            onChange={(_, v) => setMode(v)} 
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                color: "var(--color-text-muted)",
                fontSize: { xs: "12px", sm: "14px" },
                fontWeight: 600,
                textTransform: "none",
                fontFamily: "inherit",
                "&.Mui-selected": {
                  color: "var(--color-amber-primary)",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "var(--color-amber-primary)",
              },
            }}
          >
            <Tab value="ai" label="🤖 Asistente IA cervecero" />
            <Tab value="community" label="🍺 Fan a fan" />
            <Tab value="b2b" label="🏭 B2B Cervecero" />
          </Tabs>
        </Paper>

        {mode === "ai" ? (
          <Paper 
            sx={{ 
              p: 3, 
              bgcolor: "var(--color-surface-card)", 
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "16px"
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                placeholder="Ej: mejores IPA en Santiago, lugares pet-friendly, stout en Valdivia..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askAi()}
                sx={{
                  input: { color: "var(--color-text-primary)", fontFamily: "inherit" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "var(--color-border-subtle)" },
                    "&:hover fieldset": { borderColor: "var(--color-border-medium)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-amber-primary)" },
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={() => askAi()}
                disabled={aiLoading}
                sx={{
                  background: "var(--gradient-heading)",
                  color: "var(--color-text-dark)",
                  fontWeight: "bold",
                  fontFamily: "inherit",
                  minWidth: 120,
                  "&:hover": { brightness: 1.1 },
                  "&.Mui-disabled": { background: "rgba(251,191,36,0.35)", color: "rgba(0,0,0,0.4)" },
                }}
              >
                {aiLoading ? <CircularProgress size={20} sx={{ color: "var(--color-text-dark)" }} /> : "Buscar"}
              </Button>
            </Stack>

            {/* Chips de ejemplos clicables */}
            <Stack direction="row" sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
              {AI_EXAMPLES.map((ex) => (
                <Chip
                  key={ex}
                  label={ex}
                  onClick={() => askAi(ex)}
                  sx={{
                    cursor: "pointer",
                    bgcolor: "rgba(251,191,36,0.06)",
                    border: "1px solid color-mix(in srgb, var(--color-border-amber) 36%, var(--color-border-subtle))",
                    color: "var(--color-text-secondary)",
                    fontFamily: "inherit",
                    fontSize: "12px",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    "&:hover": { bgcolor: "rgba(251,191,36,0.14)", color: "var(--color-amber-primary)" },
                  }}
                />
              ))}
            </Stack>

            {/* Hint premium cuando aún no hay respuesta */}
            {!aiAnswer && !aiLoading && (
              <Box sx={{ mt: 3 }}>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 24 }}
                  className="relative overflow-hidden rounded-2xl border px-6 py-8 text-center"
                  style={{
                    borderColor: "color-mix(in srgb, var(--color-border-amber) 42%, var(--color-border-subtle))",
                    background:
                      "linear-gradient(180deg, color-mix(in srgb, var(--color-amber-primary) 8%, transparent), transparent 70%)",
                  }}
                >
                  {/* Glow superior */}
                  <div
                    className="pointer-events-none absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 -translate-y-1/3 rounded-full"
                    style={{ background: "var(--color-amber-primary)", opacity: 0.12, filter: "blur(64px)" }}
                  />

                  {/* Ícono con halo animado */}
                  <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-2xl"
                      style={{ border: "1px solid color-mix(in srgb, var(--color-amber-primary) 55%, transparent)" }}
                      animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0, 0.55] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span
                      className="relative flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl"
                      style={{
                        borderColor: "color-mix(in srgb, var(--color-border-amber) 50%, transparent)",
                        background: "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                      }}
                    >
                      🍺
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-extrabold leading-tight text-[var(--color-text-primary)]">
                    Tu Maestro Cervecero con IA
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
                    Cuéntame qué se te antoja y te armo recomendaciones de cervezas y lugares de la comunidad, al instante.
                  </p>

                  {/* Mini-cards de capacidades */}
                  <div className="mx-auto mt-5 grid max-w-lg gap-2.5 sm:grid-cols-3">
                    {[
                      { icon: "🍺", title: "Estilos a tu medida", desc: "IPA, Stout, Sour y más" },
                      { icon: "🍔", title: "Maridajes perfectos", desc: "Qué comer con cada estilo" },
                      { icon: "📍", title: "Lugares ideales", desc: "Bares y taprooms cerca" },
                    ].map((cap) => (
                      <div
                        key={cap.title}
                        className="rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5"
                        style={{
                          borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        <span className="text-lg leading-none">{cap.icon}</span>
                        <p className="mt-1.5 text-[12.5px] font-extrabold text-[var(--color-text-primary)]">{cap.title}</p>
                        <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-text-muted)]">{cap.desc}</p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-[11.5px] font-semibold text-[var(--color-text-muted)]">
                    Prueba un ejemplo de arriba 👆
                  </p>
                </motion.div>
              </Box>
            )}

            {aiAnswer && (
              <Box sx={{ mt: 3 }}>
                <Typography fontWeight={700} sx={{ mb: 1, color: "var(--color-amber-primary)" }}>
                  Respuesta IA
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{aiAnswer}</Typography>
              </Box>
            )}
            {(aiBeers.length > 0 || aiPlaces.length > 0) && (
              <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mt: 3 }}>
                {aiBeers.length > 0 && (
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700} sx={{ mb: 1.5, fontSize: "14px" }}>
                      🍺 Cervezas sugeridas
                    </Typography>
                    <Stack spacing={1}>
                      {aiBeers.map((b) => (
                        <Chip
                          key={b._id}
                          label={`${b.name} · ${b.brewery} · ⭐ ${b.averageRating || 0}`}
                          sx={{ 
                            justifyContent: "flex-start",
                            bgcolor: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--color-border-subtle)",
                            color: "var(--color-text-primary)",
                            fontFamily: "inherit"
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
                {aiPlaces.length > 0 && (
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700} sx={{ mb: 1.5, fontSize: "14px" }}>
                      📍 Lugares sugeridos
                    </Typography>
                    <Stack spacing={1}>
                      {aiPlaces.map((p) => (
                        <Chip
                          key={p._id}
                          label={`${p.name} · ${p.address?.city || "N/D"} · ⭐ ${p.averageRating || 0}`}
                          sx={{ 
                            justifyContent: "flex-start",
                            bgcolor: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--color-border-subtle)",
                            color: "var(--color-text-primary)",
                            fontFamily: "inherit"
                          }}
                          onClick={() => router.push(`/lugares?id=${p._id}`)}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </Paper>
        ) : (
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ width: "100%" }}>
            {/* Conversation sidebar */}
            <Paper
              sx={{
                width: { xs: "100%", md: 300 },
                bgcolor: "var(--color-surface-card)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "16px",
                overflow: "hidden"
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography fontWeight={700} sx={{ mb: 0.5, fontSize: "14px" }}>
                  {mode === "community" ? "Conversaciones fan↔fan" : "Conversaciones B2B"}
                </Typography>
                <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
                  Moderación activa de lenguaje para mantener respeto en la comunidad.
                </Typography>
              </Box>
              <Divider sx={{ borderColor: "var(--color-border-subtle)" }} />
              <List sx={{ maxHeight: 280, overflowY: "auto" }}>
                {chats.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
                      No tienes chats activos.
                    </Typography>
                  </Box>
                ) : (
                  chats.map((c) => (
                    <ListItemButton
                      key={c._id}
                      selected={selectedChatId === c._id}
                      onClick={() => setSelectedChatId(c._id)}
                      sx={{
                        "&.Mui-selected": {
                          bgcolor: "rgba(251,191,36,0.1) !important",
                          borderLeft: "3px solid var(--color-amber-primary)",
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          c.isGroup
                            ? c.name || "Grupo"
                            : c.participants.find((p) => p._id !== currentUserId)?.username || "Chat"
                        }
                        secondary={c.lastMessage?.content || "Sin mensajes"}
                        primaryTypographyProps={{ fontSize: "13px", fontWeight: "bold" }}
                        secondaryTypographyProps={{ fontSize: "11px", noWrap: true, color: "var(--color-text-muted)" }}
                      />
                    </ListItemButton>
                  ))
                )}
              </List>
              <Divider sx={{ borderColor: "var(--color-border-subtle)" }} />
              
              {/* Start new chat */}
              <Box sx={{ p: 2 }}>
                <Typography fontWeight={700} sx={{ mb: 1, fontSize: "13px" }}>
                  Iniciar nuevo chat
                </Typography>
                <List sx={{ maxHeight: 200, overflowY: "auto" }}>
                  {filteredUsers
                    .filter((u) => u._id !== currentUserId)
                    .slice(0, 10)
                    .map((u) => (
                      <ListItemButton 
                        key={u._id} 
                        onClick={() => createDirectChat(u._id)}
                        sx={{ borderRadius: "8px", mb: 0.5 }}
                      >
                        <ListItemText 
                          primary={u.username} 
                          secondary={u.role || "user"} 
                          primaryTypographyProps={{ fontSize: "12px", fontWeight: "medium" }}
                          secondaryTypographyProps={{ fontSize: "10px", color: "var(--color-amber-primary)" }}
                        />
                      </ListItemButton>
                    ))}
                </List>
              </Box>
            </Paper>

            {/* Chat Box area */}
            <Paper 
              sx={{ 
                flex: 1, 
                p: 2, 
                bgcolor: "var(--color-surface-card)", 
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "16px"
              }}
            >
              {!selectedChatId ? (
                <Box sx={{ py: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span className="text-4xl mb-3">💬</span>
                  <Typography sx={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
                    Selecciona o crea una conversación para empezar.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ height: 400, overflowY: "auto", mb: 2, p: 1 }}>
                    <Stack spacing={1.5}>
                      {messages.map((m) => {
                        const mine = m.sender?._id === currentUserId;
                        return (
                          <Box
                            key={m._id}
                            sx={{
                              alignSelf: mine ? "flex-end" : "flex-start",
                              bgcolor: mine ? "rgba(251,191,36,0.18)" : "rgba(255,255,255,0.04)",
                              border: mine ? "1px solid var(--color-border-amber)" : "1px solid var(--color-border-subtle)",
                              px: 2,
                              py: 1,
                              borderRadius: mine ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                              maxWidth: "75%",
                            }}
                          >
                            <Typography variant="caption" sx={{ color: mine ? "var(--color-amber-primary)" : "var(--color-text-secondary)", fontWeight: "bold", fontSize: "10px" }}>
                              {m.sender?.username || "Usuario"}
                            </Typography>
                            <Typography sx={{ fontSize: "13px", mt: 0.5, lineHeight: 1.4 }}>{m.content}</Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      placeholder="Escribe un mensaje (con respeto siempre)..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      sx={{ 
                        input: { color: "var(--color-text-primary)", fontFamily: "inherit", fontSize: "13px" },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "var(--color-border-subtle)" },
                          "&:hover fieldset": { borderColor: "var(--color-border-medium)" },
                          "&.Mui-focused fieldset": { borderColor: "var(--color-amber-primary)" },
                        }
                      }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={sendMessage}
                      sx={{
                        background: "var(--gradient-heading)",
                        color: "var(--color-text-dark)",
                        fontWeight: "bold",
                        fontFamily: "inherit",
                        "&:hover": { brightness: 1.1 }
                      }}
                    >
                      Enviar
                    </Button>
                  </Stack>
                </>
              )}
            </Paper>
          </Stack>
        )}
      </div>
      <Footer />
    </MainLayout>
  );
}
