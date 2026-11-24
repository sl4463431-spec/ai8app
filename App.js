import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
const API_KEY = "AQ.Ab8RN6JT70n97mR0I4VEfih9myqbcdisCIVLyIPldqpWzZSOOA";
export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const send = async () => {
    if (!input.trim() || loading) return;
    const key = API_KEY.trim();
    if (key.length < 20) { Alert.alert("المفتاح غلط", "انسخه تاني من AI Studio"); return; }
    const text = input; setInput("");
    const nm = [...messages, { role: "user", text }]; setMessages(nm); setLoading(true);
    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + key, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "انت AI8، رد بالعربي المصري باختصار. سؤال: " + text }] }] })
      });
      const data = await res.json();
      const reply = data.error ? "خطأ: " + data.error.message : (data.candidates?.[0]?.content?.parts?.[0]?.text || "مفيش رد");
      setMessages([...nm, { role: "assistant", text: reply }]);
    } catch (e) { setMessages([...nm, { role: "assistant", text: "مشكلة في النت" }]); }
    setLoading(false);
  };
  return (
    <View style={s.c}>
      <Text style={s.logo}>AI8</Text>
      <ScrollView style={s.chat}>{messages.length === 0 && <Text style={s.empty}>ازيك 👋{"\n"}انا AI8</Text>}{messages.map((m, i) => <View key={i} style={[s.msg, m.role === "user" ? s.u : s.a]}><Text style={[s.t, m.role === "user" && { color: "#fff" }]}>{m.text}</Text></View>)}{loading && <Text>AI8 بيكتب...</Text>}</ScrollView>
      <View style={s.row}><TextInput style={s.in} value={input} onChangeText={setInput} placeholder="اسأل AI8..." /><TouchableOpacity onPress={send} style={s.btn}><Text style={{ color: "#fff", fontSize: 20 }}>↑</Text></TouchableOpacity></View>
    </View>
  );
}
const s = StyleSheet.create({ c: { flex: 1, backgroundColor: "#fff", paddingTop: 50 }, logo: { fontSize: 26, fontWeight: "bold", textAlign: "center" }, chat: { flex: 1, padding: 12 }, empty: { textAlign: "center", marginTop: 100, fontSize: 20, fontWeight: "bold" }, msg: { padding: 12, borderRadius: 14, marginBottom: 10, maxWidth: "90%" }, u: { backgroundColor: "#000", alignSelf: "flex-end" }, a: { backgroundColor: "#f0f0f0", alignSelf: "flex-start" }, t: { fontSize: 16, color: "#000" }, row: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderTopColor: "#eee" }, in: { flex: 1, backgroundColor: "#f2f2f2", borderRadius: 22, paddingHorizontal: 15, fontSize: 16 }, btn: { backgroundColor: "#000", width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center", marginLeft: 8 } });
