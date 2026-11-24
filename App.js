import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://ai8app.onrender.com/api/generate";
const STORAGE_KEY = "AI8_CHATS";
const SUGGESTIONS = ["اكتب لي مقال احترافي", "اشرح لي درس صعب", "ساعدني في كتابة كود", "ترجم لي نص"];

export default function App() {
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef(null);
  const activeChat = chats.find(c => c.id === activeId);

  useEffect(() => { loadChats(); }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(chats)).catch(() => {});
  }, [chats]);

  async function loadChats() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data) && data.length > 0) {
          setChats(data);
          setActiveId(data[0].id);
          return;
        }
      }
    } catch (e) {}
    const first = { id: Date.now(), title: "محادثة جديدة", messages: [] };
    setChats([first]);
    setActiveId(first.id);
  }

  function newChat() {
    const chat = { id: Date.now(), title: "محادثة جديدة", messages: [] };
    setChats(prev => [chat, ...prev]);
    setActiveId(chat.id);
    setMenuOpen(false);
  }

  function changeChat(id) {
    setActiveId(id);
    setMenuOpen(false);
  }

  function deleteChat(id) {
    if (chats.length === 1) {
      Alert.alert("تنبيه", "لازم تفضل محادثة واحدة");
      return;
    }
    const remaining = chats.filter(c => c.id !== id);
    setChats(remaining);
    if (activeId === id) {
      setActiveId(remaining[0].id);
    }
  }

  function updateChat(id, messages) {
    setChats(prev => prev.map(c => {
      if (c.id !== id) return c;
      const firstUser = messages.find(m => m.role === "user");
      const title = c.title === "محادثة جديدة" && firstUser ? firstUser.text.slice(0, 28) : c.title;
      return { ...c, title: title, messages: messages };
    }));
  }

  async function sendMessage(textOverride) {
    const text = (textOverride ?? message).trim();
    if (!text || loading || !activeChat) return;
    setMessage("");
    const chatId = activeId;
    const previous = activeChat.messages;
    const newMessages = [...previous, { role: "user", text: text }];
    updateChat(chatId, newMessages);
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, language: "ar", history: newMessages.slice(-10) })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ في السيرفر");
      }
      const answer = data.text || "لم يصل رد من الذكاء الاصطناعي";
      updateChat(chatId, [...newMessages, { role: "assistant", text: answer }]);
    } catch (error) {
      updateChat(chatId, [...newMessages, { role: "assistant", text: "⚠️ " + (error.message || "تعذر الاتصال بالسيرفر") + " - جرب تاني بعد 10 ثواني" }]);
    } finally {
      setLoading(false);
    }
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

  function copyText() {
    Alert.alert("نسخ الرد", "اضغط مطولاً على نص الرد واختر نسخ.");
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
          <Text style={styles.icon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>AI8 ✨</Text>
        <TouchableOpacity onPress={newChat} style={styles.newButton}>
          <Text style={styles.newText}>＋ جديد</Text>
        </TouchableOpacity>
      </View>

      {menuOpen && (
        <View style={styles.sidebar}>
          <TouchableOpacity onPress={newChat}>
            <Text style={styles.menuTitle}>＋ محادثة جديدة</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>محادثاتك</Text>
          <ScrollView style={{ maxHeight: 250 }}>
            {chats.map(chat => (
              <View key={chat.id} style={styles.chatItem}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => changeChat(chat.id)}>
                  <Text style={styles.chatTitle} numberOfLines={1}>💬 {chat.title}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteChat(chat.id)}>
                  <Text style={styles.delete}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={styles.chatContent} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {(!activeChat || activeChat.messages.length === 0) && (
          <View style={styles.welcome}>
            <Text style={styles.welcomeLogo}>AI8</Text>
            <Text style={styles.welcomeTitle}>أهلاً بيك 👋</Text>
            <Text style={styles.subtitle}>مساعدك الذكي، اسألني أي حاجة</Text>
            {SUGGESTIONS.map((item, index) => {
              return (
                <TouchableOpacity key={index} style={styles.suggestion} onPress={() => sendMessage(item)}>
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {activeChat?.messages.map((item, index) => (
          <View key={index} style={[styles.message, item.role === "user" ? styles.userMessage : styles.aiMessage]}>
            <Text style={styles.messageLabel}>{item.role === "user" ? "أنت" : "AI8 ✨"}</Text>
            <Text selectable style={styles.messageText}>{item.text}</Text>
            {item.role === "assistant" && (
              <View style={styles.actions}>
                <TouchableOpacity onPress={copyText}>
                  <Text style={styles.actionText}>📋 نسخ</Text>
                </TouchableOpacity>
                {index === activeChat.messages.length - 1 && (
                  <TouchableOpacity onPress={regenerate}>
                    <Text style={styles.actionText}>🔄 إعادة الرد</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator color="#36D6B2" />
            <Text style={styles.loadingText}>AI8 بيفكر...</Text>
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.plusButton} onPress={() => Alert.alert("AI8", "رفع الملفات والصور هيتوفر في التحديث الجاي.")}>
            <Text style={styles.plusText}>＋</Text>
          </TouchableOpacity>
          <TextInput style={styles.input} placeholder="اسأل AI8 أي حاجة..." placeholderTextColor="#8A96A8" value={message} onChangeText={setMessage} multiline textAlign="right" />
          <TouchableOpacity style={[styles.sendButton, (!message.trim() || loading) && { opacity: 0.4 }]} onPress={() => sendMessage()} disabled={!message.trim() || loading}>
            <Text style={styles.sendText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Text style={styles.footer}>AI8 © 2026 • قد يخطئ الذكاء الاصطناعي</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101827" },
  header: { height: 60, backgroundColor: "#172438", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#29394D" },
  logo: { color: "#36D6B2", fontSize: 23, fontWeight: "bold" },
  icon: { color: "#FFFFFF", fontSize: 25 },
  newButton: { backgroundColor: "#36D6B2", paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20 },
  newText: { color: "#102027", fontWeight: "bold" },
  sidebar: { backgroundColor: "#172438", padding: 14 },
  menuTitle: { color: "#36D6B2", fontSize: 16, fontWeight: "bold", padding: 10, textAlign: "right" },
  sectionTitle: { color: "#AAB8C9", textAlign: "right", marginVertical: 10 },
  chatItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#24344A", padding: 12, borderRadius: 10, marginBottom: 7 },
  chatTitle: { color: "#FFFFFF", textAlign: "right" },
  delete: { marginLeft: 10, fontSize: 17 },
  chat: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 25 },
  welcome: { alignItems: "center", marginTop: 45 },
  welcomeLogo: { color: "#36D6B2", fontSize: 55, fontWeight: "bold" },
  welcomeTitle: { color: "#FFFFFF", fontSize: 25, fontWeight: "bold", marginTop: 15 },
  subtitle: { color: "#AAB8C9", marginTop: 10, marginBottom: 20 },
  suggestion: { backgroundColor: "#202F43", padding: 14, borderRadius: 14, marginVertical: 5, width: "100%" },
  suggestionText: { color: "#FFFFFF", textAlign: "right" },
  message: { padding: 14, borderRadius: 16, marginBottom: 12, maxWidth: "95%" },
  userMessage: { backgroundColor: "#245B58", alignSelf: "flex-end" },
  aiMessage: { backgroundColor: "#202F43", alignSelf: "flex-start" },
  messageLabel: { color: "#36D6B2", fontWeight: "bold", marginBottom: 7, textAlign: "right" },
  messageText: { color: "#FFFFFF", fontSize: 16, lineHeight: 25, textAlign: "right" },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 18, marginTop: 12 },
  actionText: { color: "#AAB8C9", fontSize: 13 },
  loading: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  loadingText: { color: "#FFFFFF" },
  inputArea: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "#172438", gap: 8 },
  plusButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#26384C", alignItems: "center", justifyContent: "center" },
  plusText: { color: "#36D6B2", fontSize: 24 },
  input: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 22, paddingHorizontal: 15, paddingVertical: 11, maxHeight: 110, color: "#111827", fontSize: 16 },
  sendButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#36D6B2", justifyContent: "center", alignItems: "center" },
  sendText: { color: "#102027", fontSize: 25, fontWeight: "bold" },
  footer: { color: "#78899D", backgroundColor: "#172438", textAlign: "center", padding: 7, fontSize: 10 }
});
