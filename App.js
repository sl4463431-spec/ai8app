import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://ai8app.onrender.com/api/generate";
const STORAGE_KEY = "AI8_CHATS";
const VIDEO_TRIALS_KEY = "AI8_VIDEO_TRIALS";

// الترجمة - 3 لغات
const T = {
  ar: {
    newChat: "＋ جديد", chats: "محادثاتك", newChat2: "＋ محادثة جديدة",
    welcome: "أهلاً بيك 👋", subtitle: "مساعدك الذكي، اسألني أي حاجة",
    ask: "اسأل AI8 أي حاجة...", thinking: "AI8 بيفكر...",
    you: "أنت", copy: "📋 نسخ", regen: "🔄 إعادة الرد",
    chatTab: "💬 شات", videoTab: "🎬 فيديو",
    videoTitle: "ولد فيديو", videoDesc: "اكتب وصف الفيديو اللي عايز تعمله...",
    style: "الستايل:", generate: "✨ ولد فيديو", generating: "بيتم توليد الفيديو... حوالي 30 ثانية",
    trialsLeft: "متبقي لك", freeTrials: "محاولات مجانية", noTrials: "خلصت محاولاتك المجانية، الدفع هيتوفر قريباً",
    videoDone: "✅ تم توليد الفيديو التجريبي! في النسخة الكاملة هينزل هنا فيديو حقيقي.",
    videoPlaceholder: "مثال: مدينة مستقبلية بالليل، مطر، إضاءة نيون",
    needText: "اكتب وصف الفيديو الأول",
    footer: "AI8 © 2026 • قد يخطئ الذكاء الاصطناعي",
  },
  fr: {
    newChat: "＋ Nouveau", chats: "Vos chats", newChat2: "＋ Nouveau chat",
    welcome: "Bienvenue 👋", subtitle: "Votre assistant intelligent, demandez tout",
    ask: "Demandez à AI8...", thinking: "AI8 réfléchit...",
    you: "Vous", copy: "📋 Copier", regen: "🔄 Régénérer",
    chatTab: "💬 Chat", videoTab: "🎬 Vidéo",
    videoTitle: "Générer Vidéo", videoDesc: "Décrivez la vidéo que vous voulez...",
    style: "Style:", generate: "✨ Générer Vidéo", generating: "Génération de la vidéo... environ 30s",
    trialsLeft: "Il vous reste", freeTrials: "essais gratuits", noTrials: "Essais gratuits terminés, paiement bientôt disponible",
    videoDone: "✅ Vidéo démo générée ! Dans la version complète, la vraie vidéo apparaîtra ici.",
    videoPlaceholder: "Ex: ville futuriste la nuit, pluie, néons",
    needText: "Écrivez d'abord la description",
    footer: "AI8 © 2026 • L'IA peut faire des erreurs",
  },
  en: {
    newChat: "＋ New", chats: "Your chats", newChat2: "＋ New chat",
    welcome: "Welcome 👋", subtitle: "Your smart assistant, ask anything",
    ask: "Ask AI8 anything...", thinking: "AI8 is thinking...",
    you: "You", copy: "📋 Copy", regen: "🔄 Regenerate",
    chatTab: "💬 Chat", videoTab: "🎬 Video",
    videoTitle: "Generate Video", videoDesc: "Describe the video you want...",
    style: "Style:", generate: "✨ Generate Video", generating: "Generating video... about 30s",
    trialsLeft: "You have", freeTrials: "free trials left", noTrials: "Free trials finished, payment coming soon",
    videoDone: "✅ Demo video generated! In the full version the real video will appear here.",
    videoPlaceholder: "Ex: futuristic city at night, rain, neon lights",
    needText: "Write video description first",
    footer: "AI8 © 2026 • AI can make mistakes",
  }
};

const SUGGESTIONS = {
  ar: ["اكتب لي مقال احترافي", "اشرح لي درس صعب", "ساعدني في كتابة كود", "ترجم لي نص"],
  fr: ["Écris un article pro", "Explique-moi une leçon difficile", "Aide-moi à coder", "Traduis un texte"],
  en: ["Write a pro article", "Explain a hard lesson", "Help me with code", "Translate a text"],
};

const STYLES_LIST = [
  { id: "cinematic", ar: "🎬 سينمائي", fr: "🎬 Cinématique", en: "🎬 Cinematic" },
  { id: "animation", ar: "🎨 رسوم متحركة", fr: "🎨 Animation", en: "🎨 Animation" },
  { id: "realistic", ar: "📷 واقعي", fr: "📷 Réaliste", en: "📷 Realistic" },
  { id: "art", ar: "✨ فني", fr: "✨ Art", en: "✨ Art" },
];

export default function App() {
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef(null);
  const activeChat = chats.find(c => c.id === activeId);

  // الجديد - المرحلة 1
  const [lang, setLang] = useState("ar");
  const [mode, setMode] = useState("chat"); // chat | video
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoStyle, setVideoStyle] = useState("cinematic");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoResult, setVideoResult] = useState(null);
  const [trials, setTrials] = useState(3);

  const t = T[lang];

  useEffect(() => { loadChats(); loadTrials(); }, []);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(chats)).catch(() => {}); }, [chats]);

  async function loadTrials() {
    try {
      const saved = await AsyncStorage.getItem(VIDEO_TRIALS_KEY);
      if (saved !== null) setTrials(parseInt(saved));
    } catch (e) {}
  }

  async function loadChats() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data) && data.length > 0) { setChats(data); setActiveId(data[0].id); return; }
      }
    } catch (e) {}
    const first = { id: Date.now(), title: "محادثة جديدة", messages: [] };
    setChats([first]); setActiveId(first.id);
  }

  function newChat() {
    const chat = { id: Date.now(), title: "محادثة جديدة", messages: [] };
    setChats(prev => [chat, ...prev]); setActiveId(chat.id); setMenuOpen(false);
  }
  function changeChat(id) { setActiveId(id); setMenuOpen(false); }
  function deleteChat(id) {
    if (chats.length === 1) { Alert.alert("تنبيه", "لازم تفضل محادثة واحدة"); return; }
    const remaining = chats.filter(c => c.id !== id);
    setChats(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
  }
  function updateChat(id, messages) {
    setChats(prev => prev.map(c => {
      if (c.id !== id) return c;
      const firstUser = messages.find(m => m.role === "user");
      const title = c.title === "محادثة جديدة" && firstUser ? firstUser.text.slice(0, 28) : c.title;
      return { ...c, title, messages };
    }));
  }

  async function sendMessage(textOverride) {
    const text = (textOverride ?? message).trim();
    if (!text || loading || !activeChat) return;
    setMessage("");
    const chatId = activeId;
    const previous = activeChat.messages;
    const newMessages = [...previous, { role: "user", text }];
    updateChat(chatId, newMessages);
    setLoading(true);
    try {
      const response = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: text, language: lang, history: newMessages.slice(-10) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "حدث خطأ في السيرفر");
      const answer = data.text || "لم يصل رد من الذكاء الاصطناعي";
      updateChat(chatId, [...newMessages, { role: "assistant", text: answer }]);
    } catch (error) {
      updateChat(chatId, [...newMessages, { role: "assistant", text: "⚠️ " + (error.message || "تعذر الاتصال بالسيرفر") }]);
    } finally { setLoading(false); }
  }

  function regenerate() {
    if (!activeChat || loading) return;
    const messages = activeChat.messages;
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    if (!lastUser) return;
    const fixed = messages[messages.length - 1]?.role === "assistant" ? messages.slice(0, -1) : messages;
    updateChat(activeId, fixed);
    setTimeout(() => sendMessage(lastUser.text), 300);
  }

  function copyText() { Alert.alert("نسخ الرد", "اضغط مطولاً على نص الرد واختر نسخ."); }

  // ===== زرار الفيديو - شغال تجريبي =====
  async function generateVideo() {
    if (!videoPrompt.trim()) { Alert.alert("AI8", t.needText); return; }
    if (trials <= 0) { Alert.alert("AI8", t.noTrials); return; }
    setVideoLoading(true);
    setVideoResult(null);
    // هنا في المرحلة 2 هنحط كود Kling / Runway الحقيقي
    // دلوقتي تجريبي عشان تشوف الزرار شغال
    setTimeout(async () => {
      const newTrials = trials - 1;
      setTrials(newTrials);
      await AsyncStorage.setItem(VIDEO_TRIALS_KEY, String(newTrials));
      setVideoResult(t.videoDone);
      setVideoLoading(false);
    }, 3000); // 3 ثواني تجريبي بدل 30 ثانية
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}><Text style={styles.icon}>☰</Text></TouchableOpacity>
        <Text style={styles.logo}>AI8 ✨</Text>
        <TouchableOpacity onPress={newChat} style={styles.newButton}><Text style={styles.newText}>{t.newChat}</Text></TouchableOpacity>
      </View>

      {/* زرار اللغات */}
      <View style={styles.langRow}>
        <TouchableOpacity onPress={() => setLang("ar")} style={[styles.langBtn, lang === "ar" && styles.langActive]}><Text style={styles.langText}>العربية</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setLang("fr")} style={[styles.langBtn, lang === "fr" && styles.langActive]}><Text style={styles.langText}>Français</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setLang("en")} style={[styles.langBtn, lang === "en" && styles.langActive]}><Text style={styles.langText}>English</Text></TouchableOpacity>
      </View>

      {/* زرار شات / فيديو - شغال */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setMode("chat")} style={[styles.tab, mode === "chat" && styles.tabActive]}><Text style={styles.tabText}>{t.chatTab}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setMode("video")} style={[styles.tab, mode === "video" && styles.tabActive]}><Text style={styles.tabText}>{t.videoTab}</Text></TouchableOpacity>
      </View>

      {menuOpen && mode === "chat" && (
        <View style={styles.sidebar}>
          <TouchableOpacity onPress={newChat}><Text style={styles.menuTitle}>{t.newChat2}</Text></TouchableOpacity>
          <Text style={styles.sectionTitle}>{t.chats}</Text>
          <ScrollView style={{ maxHeight: 250 }}>
            {chats.map(chat => (
              <View key={chat.id} style={styles.chatItem}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => changeChat(chat.id)}><Text style={styles.chatTitle} numberOfLines={1}>💬 {chat.title}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => deleteChat(chat.id)}><Text style={styles.delete}>🗑️</Text></TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {mode === "chat" ? (
        <>
          <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={styles.chatContent} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
            {(!activeChat || activeChat.messages.length === 0) && (
              <View style={styles.welcome}>
                <Text style={styles.welcomeLogo}>AI8</Text>
                <Text style={styles.welcomeTitle}>{t.welcome}</Text>
                <Text style={styles.subtitle}>{t.subtitle}</Text>
                {SUGGESTIONS[lang].map((item, index) => (
                  <TouchableOpacity key={index} style={styles.suggestion} onPress={() => sendMessage(item)}>
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {activeChat?.messages.map((item, index) => (
              <View key={index} style={[styles.message, item.role === "user" ? styles.userMessage : styles.aiMessage]}>
                <Text style={styles.messageLabel}>{item.role === "user" ? t.you : "AI8 ✨"}</Text>
                <Text selectable style={styles.messageText}>{item.text}</Text>
                {item.role === "assistant" && (
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={copyText}><Text style={styles.actionText}>{t.copy}</Text></TouchableOpacity>
                    {index === activeChat.messages.length - 1 && (<TouchableOpacity onPress={regenerate}><Text style={styles.actionText}>{t.regen}</Text></TouchableOpacity>)}
                  </View>
                )}
              </View>
            ))}
            {loading && (<View style={styles.loading}><ActivityIndicator color="#36D6B2" /><Text style={styles.loadingText}>{t.thinking}</Text></View>)}
          </ScrollView>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.inputArea}>
              <TouchableOpacity style={styles.plusButton} onPress={() => Alert.alert("AI8", "رفع الملفات والصور هيتوفر في التحديث الجاي.")}><Text style={styles.plusText}>＋</Text></TouchableOpacity>
              <TextInput style={styles.input} placeholder={t.ask} placeholderTextColor="#8A96A8" value={message} onChangeText={setMessage} multiline textAlign={lang === "ar" ? "right" : "left"} />
              <TouchableOpacity style={[styles.sendButton, (!message.trim() || loading) && { opacity: 0.4 }]} onPress={() => sendMessage()} disabled={!message.trim() || loading}><Text style={styles.sendText}>↑</Text></TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      ) : (
        /* ===== صفحة الفيديو ===== */
        <ScrollView style={styles.chat} contentContainerStyle={styles.chatContent}>
          <Text style={styles.videoTitle}>🎬 {t.videoTitle}</Text>
          <Text style={styles.trialsText}>✨ {t.trialsLeft} {trials} {t.freeTrials}</Text>
          <Text style={styles.subtitle}>{t.videoDesc}</Text>
          <TextInput style={styles.videoInput} placeholder={t.videoPlaceholder} placeholderTextColor="#8A96A8" value={videoPrompt} onChangeText={setVideoPrompt} multiline textAlign={lang === "ar" ? "right" : "left"} />
          <Text style={styles.sectionTitle}>{t.style}</Text>
          <View style={styles.styleRow}>
            {STYLES_LIST.map(s => (
              <TouchableOpacity key={s.id} onPress={() => setVideoStyle(s.id)} style={[styles.styleBtn, videoStyle === s.id && styles.styleActive]}>
                <Text style={styles.styleText}>{s[lang]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[styles.generateBtn, videoLoading && { opacity: 0.6 }]} onPress={generateVideo} disabled={videoLoading}>
            {videoLoading ? <ActivityIndicator color="#102027" /> : <Text style={styles.generateText}>{t.generate}</Text>}
          </TouchableOpacity>
          {videoLoading && <Text style={styles.loadingText}>{t.generating}</Text>}
          {videoResult && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{videoResult}</Text>
              <Text style={styles.resultPrompt}>🎬 "{videoPrompt}" - {videoStyle}</Text>
            </View>
          )}
        </ScrollView>
     
