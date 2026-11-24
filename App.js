import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Clipboard } from "react-native";
const API_URL = "https://ai8app.onrender.com/api/generate";

export default function App() {
  const [chats, setChats] = useState([{ id: 1, title: "محادثة جديدة", messages: [] }]);
  const [activeChatId, setActiveChatId] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [typingText, setTypingText] = useState("");
  const scrollRef = useRef(null);
  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const newChat = () => {
    const newId = Date.now();
    setChats(prev => [{ id: newId, title: "محادثة جديدة", messages: [] }, ...prev]);
    setActiveChatId(newId);
    setShowHistory(false);
  };

  const deleteChat = (id) => {
    if (chats.length === 1) { Alert.alert("لا يمكن", "لازم يفضل محادثة واحدة على الأقل"); return; }
    const filtered = chats.filter(c => c.id !== id);
    setChats(filtered);
    if (id === activeChatId) setActiveChatId(filtered[0].id);
  };

  const copyText = (text) => {
    Clipboard.setString(text);
    Alert.alert("تم", "اتنسخ ✅");
  };

  const sendMessage = async (textToSend) => {
    const text = (textToSend || message).trim();
    if (!text || loading) return;
    setMessage("");
    const userMsg = { role: "user", text };
    const newMessages = [...activeChat.messages, userMsg];
    const updateChats = (msgs) => setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, title: c.title === "محادثة جديدة" ? text.slice(0, 30) : c.title, messages: msgs } : c));
    updateChats(newMessages);
    setLoading(true);
    setTypingText("");
    try {
      const res = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: text, language: "ar", history: newMessages.slice(-6) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      const fullText = data.text || "مفيش رد";
      // تأثير الكتابة زي شات جي بي تي
      let i = 0;
      const interval = setInterval(() => {
        i += 8;
        setTypingText(fullText.slice(0, i));
        if (i >= fullText.length) {
          clearInterval(interval);
          updateChats([...newMessages, { role: "assistant", text: fullText }]);
          setTypingText("");
          setLoading(false);
        }
      }, 15);
    } catch (e) {
      updateChats([...newMessages, { role: "assistant", text: "⚠️ " + e.message }]);
      setLoading(false);
    }
  };

  const regenerate = () => {
    const lastUser = [...activeChat.messages].reverse().find(m => m.role === "user");
    if (!lastUser) return;
    const withoutLastAi = activeChat.messages.filter((m, idx) => !(idx === activeChat.messages.length - 1 && m.role === "assistant"));
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: withoutLastAi } : c));
    setTimeout(() => sendMessage(lastUser.text), 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setShowHistory(!showHistory)} style={styles.menuBtn}><Text style={styles.menuText}>☰</Text></TouchableOpacity>
        <Text style={styles.topTitle}>AI8</Text>
        <TouchableOpacity onPress={newChat} style={styles.newBtn}><Text style={styles.newText}>+ جديد</Text></TouchableOpacity>
      </View>

      {showHistory && (
        <View style={styles.history}>
          <Text style={styles.historyTitle}>محادثاتك</Text>
          <ScrollView>
            {chats.map(c => (
              <View key={c.id} style={[styles.chatItem, c.id === activeChatId && styles.activeItem]}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => { setActiveChatId(c.id); setShowHistory(false); }}>
                  <Text style={styles.chatTitle} numberOfLines={1}>💬 {c.title}</Text>
                  <Text style={styles.chatCount}>{c.messages.length} رسالة</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteChat(c.id)}><Text style={styles.delete}>🗑️</Text></TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={{ padding: 16, paddingBottom: 20 }} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {activeChat.messages.length === 0 && (
          <View style={styles.welcome}>
            <Text style={styles.welcomeLogo}>AI8</Text>
            <Text style={styles.welcomeTitle}>أهلاً بيك 👋</Text>
            <Text style={styles.welcomeSub}>اسألني أي حاجة، زي شات جي بي تي بالظبط</Text>
            <View style={styles.suggestBox}>
              {["اكتبلي بوست للفيسبوك", "اشرحلي درس صعب", "اكتبلي كود", "ترجملي جملة"].map((s, i) => (
                <TouchableOpacity key={i} style={styles.suggest} onPress={() => sendMessage(s)}><Text style={styles.suggestText}>{s}</Text></TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {activeChat.messages.map((m, idx) => (
          <View key={idx} style={[styles.msg, m.role === "user" ? styles.userMsg : styles.aiMsg]}>
            <Text style={styles.label}>{m.role === "user" ? "أنت" : "AI8 ✨"}</Text>
            <Text style={styles.msgText}>{m.text}</Text>
            {m.role === "assistant" && (
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => copyText(m.text)}><Text style={styles.actionText}>📋 نسخ</Text></TouchableOpacity>
                {idx === activeChat.messages.length - 1 && <TouchableOpacity onPress={regenerate}><Text style={styles.actionText}>🔄 إعادة توليد</Text></TouchableOpacity>}
              </View>
            )}
          </View>
        ))}
        {loading && typingText === "" && <View style={styles.loading}><ActivityIndicator color="#28C7A5" /><Text style={styles.loadingText}>AI8 بيكتب...</Text></View>}
        {typingText !== "" && <View style={[styles.msg, styles.aiMsg]}><Text style={styles.label}>AI8 ✨</Text><Text style={styles.msgText}>{typingText}▍</Text></View>}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.inputArea}>
          <TextInput style={styles.input} placeholder="اسأل AI8 أي حاجة..." placeholderTextColor="#888" value={message} onChangeText={setMessage} multiline textAlign="right" />
          <TouchableOpacity style={[styles.send, (!message.trim() || loading) && { opacity: 0.4 }]} onPress={() => sendMessage()} disabled={!message.trim() || loading}><Text style={styles.sendText}>↑</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Text style={styles.footer}>AI8 ممكن يغلط، راجع المعلومات المهمة • AI8 © 2026</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101827" },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#172438", borderBottomWidth: 1, borderBottomColor: "#26364B" },
  menuBtn: { padding: 8 }, menuText: { color: "#fff", fontSize: 22 },
  topTitle: { color: "#28C7A5", fontSize: 22, fontWeight: "bold" },
  newBtn: { backgroundColor: "#28C7A5", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 }, newText: { color: "#102027", fontWeight: "bold" },
  history: { backgroundColor: "#172438", maxHeight: 280, padding: 12, borderBottomWidth: 1, borderBottomColor: "#26364B" },
  historyTitle: { color: "#fff", fontWeight: "bold", marginBottom: 10, textAlign: "right" },
  chatItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#202F43", padding: 12, borderRadius: 10, marginBottom: 8 },
  activeItem: { borderWidth: 1, borderColor: "#28C7A5" },
  chatTitle: { color: "#fff", fontSize: 15, textAlign: "right" }, chatCount: { color: "#78899D", fontSize: 12, textAlign: "right", marginTop: 3 }, delete: { fontSize: 16, marginLeft: 8 },
  chat: { flex: 1 },
  welcome: { alignItems: "center", marginTop: 40 }, welcomeLogo: { color: "#28C7A5", fontSize: 50, fontWeight: "bold" }, welcomeTitle: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 10 }, welcomeSub: { color: "#A0AEC0", marginTop: 8, textAlign: "center" },
  suggestBox: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 20 }, suggest: { backgroundColor: "#202F43", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, margin: 4 }, suggestText: { color: "#fff" },
  msg: { padding: 14, borderRadius: 14, marginBottom: 12, maxWidth: "95%" }, userMsg: { backgroundColor: "#245B58", alignSelf: "flex-end" }, aiMsg: { backgroundColor: "#202F43", alignSelf: "flex-start" },
  label: { color: "#28C7A5", fontWeight: "bold", marginBottom: 6, textAlign: "right" }, msgText: { color: "#fff", fontSize: 16, lineHeight: 24, textAlign: "right" },
  actions: { flexDirection: "row", gap: 16, marginTop: 10, justifyContent: "flex-end" }, actionText: { color: "#A0AEC0", fontSize: 13 },
  loading: { flexDirection: "row", gap: 8, alignItems: "center", padding: 10 }, loadingText: { color: "#fff" },
  inputArea: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#172438", gap: 8 },
  input: { flex: 1, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 12, maxHeight: 110, color: "#111", fontSize: 16 },
  send: { backgroundColor: "#28C7A5", width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }, sendText: { color: "#102027", fontSize: 22, fontWeight: "bold" },
  footer: { color: "#78899D", textAlign: "center", padding: 8, fontSize: 11 }
});
