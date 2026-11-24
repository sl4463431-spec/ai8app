import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://ai8app.onrender.com/api/generate";
const STORAGE_KEY = "AI8_CHATS";

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
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, language: "ar", history: newMessages.slice(-10) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "حدث خطأ في السيرفر");
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
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}><Text style={styles.icon}>☰</Text></TouchableOpacity>
        <Text style={styles.logo}>AI8 ✨</Text>
        <TouchableOpacity onPress={newChat} style={styles.newButton}><Text style={styles.newText}>＋ جديد</Text></TouchableOpacity>
      </View>

      {menuOpen && (
        <View style={styles.sidebar}>
          <TouchableOpacity onPress={newChat}><Text style={styles.menuTitle}>＋ محادثة جديدة</Text></TouchableOpacity>
          <Text style={styles.sectionTitle}>محادثاتك</Text>
          <ScrollView style={{ maxHeight: 250 }}>
            {chats.map(chat => (
              <View key={chat.id} style={styles.chatItem}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => changeChat(chat.id)}>
                  <Text style={styles.chatTitle} numberOfLines={1}>💬 {chat.title}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteChat(chat.id)}><Text style={styles.delete}>🗑️</Text></TouchableOpacity>
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
            {["اكتب لي مقال احترافي", "اشرح لي درس صعب", "ساعدني في كتابة كود", "ترجم لي نص"].map((item, index) => (
              <TouchableOpacity key={index} style={styles.suggestion} onPress={() => sendMessage(item)}>
                
