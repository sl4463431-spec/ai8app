import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Clipboard, Alert } from "react-native";

// حط المفتاح بتاعك هنا بين "" - اللي نسخته من AI Studio
const API_KEY = "from google import genai

client = genai.Client()

response = client.models.generate_content(
    model="gemini-flash-latest",
    contents="Explain how AI works in a few words",
)

print(response.text)
";

export default function App() {
  const [chats, setChats] = useState([{ id: 1, title: "محادثة جديدة", messages: [] }]);
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState(false);
  const scrollRef = useRef();

  const activeChat = chats.find(c => c.id === activeId) || chats[0];

  const updateChat = (newMessages) => {
    setChats(prev => prev.map(c => c.id === activeId ? { ...c, messages: newMessages, title: newMessages[0]?.text?.slice(0, 20) || "محادثة جديدة" } : c));
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    if (API_KEY === "حط_المفتاح_هنا") {
      Alert.alert("ناقص المفتاح", "حط المفتاح اللي نسخته من AI Studio في سطر API_KEY فوق");
      return;
    }
    const text = input;
    setInput("");
    const newMessages = [...activeChat.messages, { role: "user", text }];
    updateChat(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "انت AI8، مساعد ذكي مصري. رد بالعربي المصري، باختصار، بشكل نضيف، من غير ** ولا ## ولا رموز. سؤال المستخدم: " + text }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
        })
      });
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "مفيش رد، جرب تاني";
      updateChat([...newMessages, { role: "assistant", text: reply }]);
    } catch (e) {
      updateChat([...newMessages, { role: "assistant", text: "في مشكلة في النت، جرب تاني" }]);
    }
    setLoading(false);
  };

  const newChat = () => {
    const id = Date.now();
    setChats(prev => [{ id, title: "محادثة جديدة", messages: [] }, ...prev]);
    setActiveId(id);
    setMenu(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenu(!menu)}><Text style={styles.headerBtn}>☰</Text></TouchableOpacity>
        <Text style={styles.logo}>AI8</Text>
        <TouchableOpacity onPress={newChat}><Text style={styles.headerBtn}>+ جديد</Text></TouchableOpacity>
      </View>

      {menu && (
        <View style={styles.menu}>
          <Text style={styles.menuTitle}>محادثاتك</Text>
          {chats.map(c => (
            <TouchableOpacity key={c.id} onPress={() => { setActiveId(c.id); setMenu(false); }} style={[styles.chatItem, c.id === activeId && styles.active]}>
              <Text style={styles.chatText}>{c.title} - {c.messages.length} رسالة</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView ref={scrollRef} style={styles.chat} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {activeChat.messages.length === 0 && <Text style={styles.empty}>ازيك يا AI8 👋{"\n"}اسألني أي حاجة</Text>}
        {activeChat.messages.map((m, i) => (
          <View key={i} style={[styles.msg, m.role === "user" ? styles.userMsg : styles.aiMsg]}>
            <Text style={styles.msgText}>{m.text}</Text>
            {m.role === "assistant" && (
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => Clipboard.setString(m.text)}><Text style={styles.action}>📋 نسخ</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => { setInput(activeChat.messages[i-1]?.text || ""); }}><Text style={styles.action}>🔄 إعادة توليد</Text></TouchableOpacity>
              </View>
            )}
          </View>
        ))}
        {loading && <Text style={styles.typing}>AI8 بيكتب... ✍️</Text>}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="اسأل AI8..." placeholderTextColor="#888" multiline />
        <TouchableOpacity onPress={sendMessage} style={styles.send}><Text style={styles.sendText}>↑</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  headerBtn: { fontSize: 18, fontWeight: "bold" },
  logo: { fontSize: 22, fontWeight: "bold" },
  menu: { backgroundColor: "#f8f8f8", padding: 12 },
  menuTitle: { fontWeight: "bold", marginBottom: 8 },
  chatItem: { padding: 10, borderRadius: 8, backgroundColor: "#fff", marginBottom: 6 },
  active: { backgroundColor: "#e8f0ff" },
  chatText: { fontSize: 14 },
  chat: { flex: 1, padding: 12 },
  empty: { textAlign: "center", marginTop: 100, fontSize: 20, fontWeight: "bold", color: "#333", lineHeight: 30 },
  msg: { padding: 12, borderRadius: 14, marginBottom: 10, maxWidth: "90%" },
  userMsg: { backgroundColor: "#000", alignSelf: "flex-end" },
  aiMsg: { backgroundColor: "#f0f0f0", alignSelf: "flex-start" },
  msgText: { fontSize: 16, lineHeight: 22, color: "#000" },
  actions: { flexDirection: "row", marginTop: 8, gap: 12 },
  action: { fontSize: 13, color: "#555" },
  typing: { color: "#888", marginLeft: 8 },
  inputRow: { flexDirection: "row", alignItems: "center", padding: 10, borderTopWidth: 1, borderTopColor: "#eee" },
  input: { flex: 1, backgroundColor: "#f2f2f2", borderRadius: 22, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, maxHeight: 100 },
  send: { backgroundColor: "#000", width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center", marginLeft: 8 },
  sendText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
});
