import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar
} from "react-native";
import AsyncStorage
from "@react-native-async-storage/async-storage";

const API_URL =
"https://ai8app.onrender.com/api/generate";
const KEY = "AI8_CHATS";
const TRIALS_KEY = "AI8_TRIALS";

export default function App() {
  const [chats, setChats] =
  useState([]);
  const [activeId, setActiveId] =
  useState(null);
  const [message, setMessage] =
  useState("");
  const [loading, setLoading] =
  useState(false);
  const [menuOpen, setMenuOpen] =
  useState(false);
  const [lang, setLang] =
  useState("ar");
  const [mode, setMode] =
  useState("chat");
  const [vPrompt, setVPrompt] =
  useState("");
  const [vStyle, setVStyle] =
  useState("cinematic");
  const [vLoading, setVLoading] =
  useState(false);
  const [vResult, setVResult] =
  useState(null);
  const [trials, setTrials] =
  useState(3);
  const scrollRef = useRef(null);

  const activeChat = chats.find(
    (c) => c.id === activeId
  );

  const isAr = lang === "ar";
  const isFr = lang === "fr";

  const txt = {
    welcome: isAr
      ? "أهلاً بيك 👋"
      : isFr
      ? "Bienvenue 👋"
      : "Welcome 👋",
    sub: isAr
      ? "مساعدك الذكي"
      : isFr
      ? "Votre assistant"
      : "Your assistant",
    ask: isAr
      ? "اسأل AI8..."
      : isFr
      ? "Demandez..."
      : "Ask AI8...",
    think: isAr
      ? "AI8 بيفكر..."
      : isFr
      ? "AI8 réfléchit..."
      : "AI8 thinking...",
    chatBtn: isAr
      ? "💬 شات"
      : isFr
      ? "💬 Chat"
      : "💬 Chat",
    videoBtn: isAr
      ? "🎬 فيديو"
      : isFr
      ? "🎬 Vidéo"
      : "🎬 Video",
    gen: isAr
      ? "✨ ولد فيديو"
      : isFr
      ? "✨ Générer Vidéo"
      : "✨ Generate Video",
    gening: isAr
      ? "بيتم التوليد..."
      : "Generating...",
    done: isAr
      ? "✅ تم توليد الفيديو التجريبي!"
      : isFr
      ? "✅ Vidéo démo générée!"
      : "✅ Demo video done!",
    need: isAr
      ? "اكتب وصف الفيديو"
      : "Write description",
  };

  useEffect(() => {
    loadChats();
    loadTrials();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(
      KEY,
      JSON.stringify(chats)
    ).catch(() => {});
  }, [chats]);

  async function loadTrials() {
    try {
      const s = await AsyncStorage
        .getItem(TRIALS_KEY);
      if (s !== null) {
        setTrials(parseInt(s));
      }
    } catch (e) {}
  }

  async function loadChats() {
    try {
      const saved = await AsyncStorage
        .getItem(KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.length > 0) {
          setChats(d);
          setActiveId(d[0].id);
          return;
        }
      }
    } catch (e) {}
    const f = {
      id: Date.now(),
      title: "محادثة جديدة",
      messages: [],
    };
    setChats([f]);
    setActiveId(f.id);
  }

  function newChat() {
    const c = {
      id: Date.now(),
      title: "محادثة جديدة",
      messages: [],
    };
    setChats((p) => [c, ...p]);
    setActiveId(c.id);
    setMenuOpen(false);
  }

  function changeChat(id) {
    setActiveId(id);
    setMenuOpen(false);
  }

  function deleteChat(id) {
    if (chats.length === 1) {
      Alert.alert(
        "تنبيه",
        "لازم تفضل محادثة واحدة"
      );
      return;
    }
    const r = chats.filter(
      (c) => c.id !== id
    );
    setChats(r);
    if (activeId === id) {
      setActiveId(r[0].id);
    }
  }

  function updateChat(id, msgs) {
    setChats((p) =>
      p.map((c) => {
        if (c.id !== id) return c;
        const fu = msgs.find(
          (m) => m.role === "user"
        );
        let title = c.title;
        if (
          c.title === "محادثة جديدة" &&
          fu
        ) {
          title = fu.text.slice(0, 28);
        }
        return {
          ...c,
          title,
          messages: msgs,
        };
      })
    );
  }

  async function sendMessage(ov) {
    const text = (ov ?? message).trim();
    if (!text) return;
    if (loading) return;
    if (!activeChat) return;
    setMessage("");
    const cid = activeId;
    const prev = activeChat.messages;
    const nm = [
      ...prev,
      { role: "user", text },
    ];
    updateChat(cid, nm);
    setLoading(true);
    try {
      const res = await fetch(
        API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            prompt: text,
            language: lang,
            history: nm.slice(-10),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error("خطأ في السيرفر");
      }
      updateChat(cid, [
        ...nm,
        {
          role: "assistant",
          text: data.text || "لم يصل رد",
        },
      ]);
    } catch (e) {
      updateChat(cid, [
        ...nm,
        {
          role: "assistant",
          text: "⚠️ " + e.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function regenerate() {
    if (!activeChat) return;
    if (loading) return;
    const ms = activeChat.messages;
    const lu = [...ms]
      .reverse()
      .find((m) => m.role === "user");
    if (!lu) return;
    let fx = ms;
    if (
      ms[ms.length - 1]?.role ===
      "assistant"
    ) {
      fx = ms.slice(0, -1);
    }
    updateChat(activeId, fx);
    setTimeout(() => {
      sendMessage(lu.text);
    }, 300);
  }

  function generateVideo() {
    if (!vPrompt.trim()) {
      Alert.alert("AI8", txt.need);
      return;
    }
    if (trials <= 0) {
      Alert.alert(
        "AI8",
        "خلصت المحاولات المجانية"
      );
      return;
    }
    setVLoading(true);
    setVResult(null);
    setTimeout(async () => {
      const nt = trials - 1;
      setTrials(nt);
      await AsyncStorage.setItem(
        TRIALS_KEY,
        String(nt)
      );
      setVResult(txt.done);
      setVLoading(false);
    }, 3000);
  }

  return (
    <SafeAreaView
      style={s.container}
    >
      <StatusBar
        barStyle="light-content"
      />
      <View style={s.header}>
        <TouchableOpacity
          onPress={() =>
            setMenuOpen(!menuOpen)
          }
        >
          <Text style={s.icon}>
            ☰
          </Text>
        </TouchableOpacity>
        <Text style={s.logo}>
          AI8 ✨
        </Text>
        <TouchableOpacity
          onPress={newChat}
          style={s.newBtn}
        >
          <Text style={s.newTxt}>
            ＋ جديد
          </Text>
        </TouchableOpacity>
      </View>

      <View style={s.langRow}>
        <TouchableOpacity
          onPress={() => setLang("ar")}
          style={[
            s.langBtn,
            lang === "ar" && s.langOn,
          ]}
        >
          <Text style={s.langTxt}>
            العربية
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLang("fr")}
          style={[
            s.langBtn,
            lang === "fr" && s.langOn,
          ]}
        >
          <Text style={s.langTxt}>
            Français
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLang("en")}
          style={[
            s.langBtn,
            lang === "en" && s.langOn,
          ]}
        >
          <Text style={s.langTxt}>
            English
          </Text>
        </TouchableOpacity>
      </View>

      <View style={s.tabs}>
        <TouchableOpacity
          onPress={() => setMode("chat")}
          style={[
            s.tab,
            mode === "chat" && s.tabOn,
          ]}
        >
          <Text style={s.tabTxt}>
            {txt.chatBtn}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode("video")}
          style={[
            s.tab,
            mode === "video" && s.tabOn,
          ]}
        >
          <Text style={s.tabTxt}>
            {txt.videoBtn}
          </Text>
        </TouchableOpacity>
      </View>

      {mode === "chat" ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollRef}
            style={s.chat}
            contentContainerStyle={
              s.chatContent
            }
            onContentSizeChange={() => {
              scrollRef.current?.scrollToEnd({
                animated: true,
              });
            }}
          >
            {(!activeChat ||
              activeChat.messages.length ===
                0) && (
              <View style={s.welcome}>
                <Text style={s.wLogo}>
                  AI8
                </Text>
                <Text style={s.wTitle}>
                  {txt.welcome}
                </Text>
                <Text style={s.sub}>
                  {txt.sub}
                </Text>
              </View>
            )}
            {activeChat?.messages.map(
              (it, i) => (
                <View
                  key={i}
                  style={[
                    s.msg,
                    it.role === "user"
                      ? s.uMsg
                      : s.aiMsg,
                  ]}
                >
                  <Text style={s.msgTxt}>
                    {it.text}
                  </Text>
                  {it.role ===
                    "assistant" && (
                    <TouchableOpacity
                      onPress={regenerate}
                    >
                      <Text style={s.actTxt}>
                        🔄 إعادة الرد
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )
            )}
            {loading && (
              <View style={s.loading}>
                <ActivityIndicator
                  color="#36D6B2
