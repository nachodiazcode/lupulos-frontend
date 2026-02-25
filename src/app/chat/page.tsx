"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
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
} from "@mui/material";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoldenBackground from "@/components/GoldenBackground";
import { api } from "@/lib/api";

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

export default function ChatPage() {
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
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setCurrentUserId(parsed?._id || parsed?.id || "");
    }
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
  }, [selectedChatId]);

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
      await api.post(`/chat/${selectedChatId}/messages`, { content: input });
      setInput("");
      await loadMessages(selectedChatId);
      await loadChats(mode);
    } catch {
      // noop
    }
  };

  const askAi = async () => {
    if (!aiQuestion.trim()) return;
    try {
      const res = await api.post("/chat/ai/query", { query: aiQuestion });
      const payload = res.data?.data || {};
      setAiAnswer(payload.answer || "No encontré resultados por ahora.");
      setAiBeers(Array.isArray(payload.beers) ? payload.beers : []);
      setAiPlaces(Array.isArray(payload.places) ? payload.places : []);
    } catch {
      setAiAnswer("No pude consultar ahora. Intenta de nuevo.");
      setAiBeers([]);
      setAiPlaces([]);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", color: "white", display: "flex", flexDirection: "column" }}>
      <GoldenBackground />
      <Navbar />
      <Container maxWidth="xl" sx={{ flex: 1, py: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
          💬 Chat Lúpulos
        </Typography>
        <Typography sx={{ mb: 3, opacity: 0.9 }}>
          IA cervecera, comunidad fan↔fan y conversaciones B2B entre emprendedores/gerencia.
        </Typography>

        <Paper sx={{ mb: 3, bgcolor: "var(--color-surface-card)", color: "white" }}>
          <Tabs value={mode} onChange={(_, v) => setMode(v)} variant="fullWidth">
            <Tab value="ai" label="🤖 Asistente IA cervecero" />
            <Tab value="community" label="🍺 Fan a fan" />
            <Tab value="b2b" label="🏭 B2B Cervecero" />
          </Tabs>
        </Paper>

        {mode === "ai" ? (
          <Paper sx={{ p: 3, bgcolor: "var(--color-surface-card)", color: "white" }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                placeholder="Ej: mejores IPA en Santiago, lugares pet-friendly, stout en Valdivia..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                sx={{ input: { color: "white" } }}
              />
              <Button variant="contained" onClick={askAi}>
                Buscar
              </Button>
            </Stack>
            {aiAnswer && (
              <Box sx={{ mt: 3 }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                  Respuesta IA
                </Typography>
                <Typography>{aiAnswer}</Typography>
              </Box>
            )}
            {(aiBeers.length > 0 || aiPlaces.length > 0) && (
              <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mt: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    🍺 Cervezas sugeridas
                  </Typography>
                  <Stack spacing={1}>
                    {aiBeers.map((b) => (
                      <Chip
                        key={b._id}
                        label={`${b.name} · ${b.brewery} · ⭐ ${b.averageRating || 0}`}
                        sx={{ justifyContent: "flex-start" }}
                      />
                    ))}
                  </Stack>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    📍 Lugares sugeridos
                  </Typography>
                  <Stack spacing={1}>
                    {aiPlaces.map((p) => (
                      <Chip
                        key={p._id}
                        label={`${p.name} · ${p.address?.city || "N/D"} · ⭐ ${p.averageRating || 0}`}
                        sx={{ justifyContent: "flex-start" }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            )}
          </Paper>
        ) : (
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Paper
              sx={{
                width: { xs: "100%", md: 320 },
                bgcolor: "var(--color-surface-card)",
                color: "white",
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                  {mode === "community" ? "Conversaciones fan↔fan" : "Conversaciones B2B"}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Moderación activa de lenguaje para mantener respeto en la comunidad.
                </Typography>
              </Box>
              <Divider />
              <List sx={{ maxHeight: 280, overflowY: "auto" }}>
                {chats.map((c) => (
                  <ListItemButton
                    key={c._id}
                    selected={selectedChatId === c._id}
                    onClick={() => setSelectedChatId(c._id)}
                  >
                    <ListItemText
                      primary={
                        c.isGroup
                          ? c.name || "Grupo"
                          : c.participants.find((p) => p._id !== currentUserId)?.username || "Chat"
                      }
                      secondary={c.lastMessage?.content || "Sin mensajes"}
                    />
                  </ListItemButton>
                ))}
              </List>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                  Iniciar chat
                </Typography>
                <List sx={{ maxHeight: 240, overflowY: "auto" }}>
                  {filteredUsers
                    .filter((u) => u._id !== currentUserId)
                    .slice(0, 10)
                    .map((u) => (
                      <ListItemButton key={u._id} onClick={() => createDirectChat(u._id)}>
                        <ListItemText primary={u.username} secondary={u.role || "user"} />
                      </ListItemButton>
                    ))}
                </List>
              </Box>
            </Paper>

            <Paper sx={{ flex: 1, p: 2, bgcolor: "var(--color-surface-card)", color: "white" }}>
              {!selectedChatId ? (
                <Typography sx={{ opacity: 0.8 }}>
                  Selecciona o crea una conversación para empezar.
                </Typography>
              ) : (
                <>
                  <Box sx={{ maxHeight: 500, overflowY: "auto", mb: 2, p: 1 }}>
                    <Stack spacing={1}>
                      {messages.map((m) => {
                        const mine = m.sender?._id === currentUserId;
                        return (
                          <Box
                            key={m._id}
                            sx={{
                              alignSelf: mine ? "flex-end" : "flex-start",
                              bgcolor: mine ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.08)",
                              px: 1.5,
                              py: 1,
                              borderRadius: 2,
                              maxWidth: "80%",
                            }}
                          >
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {m.sender?.username || "Usuario"}
                            </Typography>
                            <Typography>{m.content}</Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      placeholder="Escribe un mensaje (con respeto siempre)."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      sx={{ input: { color: "white" } }}
                    />
                    <Button variant="contained" onClick={sendMessage}>
                      Enviar
                    </Button>
                  </Stack>
                </>
              )}
            </Paper>
          </Stack>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
