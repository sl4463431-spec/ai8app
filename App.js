import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";

// المكان الوحيد اللي تحط فيه المفتاح - سطر واحد بس
const API_KEY = "AQ.Ab8RN6JT70n97mR0I4VEfih9myqbcdisCIVLyIPldqpWzZSOOA";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const key = API_KEY.trim();
    if (key === "حط_المفتاح_هنا" || key.length < 20) {
      Alert.alert("المفتاح غلط", "انسخ المفتاح تاني من AI Studio، Copy key بس");
      return;
    }
    const text = input;
    setInput("");
    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "انت AI8، مساعد ذكي مصري. رد بالعربي المصري باختصار. سؤال: " + text }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
        })
      });
      const data = await res.json();
      if (data.error) {
        setMessages([...newMessages, { role: "assistant", text: "خطأ من جوجل: " + data.error.message }]);
      } else {
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "مفيش رد، جرب تاني";
        setMessages([...newMessages, { role: "assistant", text: reply }]);
      }
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", text: "في مشكلة في النت، جرب تاني" }]);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>AI8</Text>
        <Text style={styles.sub}>سريع • مجاني</Text>
      </View>
      <ScrollView ref={scrollRef} style={styles.chat} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.length === 0 && <Text style={styles.empty}>ازيك 👋{"\n"}انا AI8{"\n"}اسألني أي حاجة</Text>}
        {messages.map((m, i) => (
          <View key={i} style={[styles.msg, m.role === "user" ? styles.userMsg : styles.aiMsg]}>
            <Text style={[styles.msgText, m.role === "user" && styles.userText]}>{m.text}</Text>
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
  container: { flex: 1, backgroundColor: "#fff
