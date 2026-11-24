import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import {
SafeAreaView, View, Text,
TextInput, TouchableOpacity,
ScrollView, StyleSheet,
ActivityIndicator,
KeyboardAvoidingView,
Platform, Alert, StatusBar
} from "react-native";
import AsyncStorage
from "@react-native-async-storage/async-storage";
const API_URL =
"https://ai8app.onrender.com/api/generate";
const KEY = "AI8_FARM";
const DATA = [
{ id: 1, cat: "زراعة", catEn: "Crops",
icon: "🌾", tAr: "زراعة القمح",
tEn: "Wheat",
bAr: "الميعاد: 15 نوفمبر.\nالتقاوي: 60 كجم.\nالري: بعد 25 يوم.\nالتسميد: 3 يوريا.\nالحصاد: 160 يوم.",
bEn: "Planting: 15 Nov.\nSeeds: 60kg.\nWater: 25 days.\nHarvest: 160 days." },
{ id: 2, cat: "زراعة", catEn: "Crops",
icon: "🌽", tAr: "زراعة الذرة",
tEn: "Corn",
bAr: "الميعاد: ابريل.\nالتقاوي: 10 كجم.\nالري: كل 10 ايام.\nالافة: دودة الحشد.",
bEn: "Planting: April.\nSeeds: 10kg.\nWater: 10 days." },
{ id: 3, cat: "زراعة", catEn: "Crops",
icon: "🥔", tAr: "زراعة البطاطس",
tEn: "Potato",
bAr: "الميعاد: سبتمبر.\nالتقاوي: 750 كجم.\nالري: منتظم.\nالمرض: الندوة.",
bEn: "Planting: Sept.\nSeeds: 750kg.\nWater: regular." },
{ id: 4, cat: "مواشي", catEn: "Livestock",
icon: "🐄", tAr: "تربية البقر",
tEn: "Cow",
bAr: "الاكل: علف + برسيم.\nالمية: نضيفة.\nالتحصين: قلاعية كل 6 شهور.",
bEn: "Feed: concentrate.\nWater: clean.\nVaccine: FMD." },
{ id: 5, cat: "مواشي", catEn: "Livestock",
icon: "🐑", tAr: "تربية الغنم",
tEn: "Sheep",
bAr: "الولادة: مرتين.\nالتحصين: جدري.\nالديدان: كل 3 شهور.",
bEn: "Birth: twice.\nVaccine: pox.\nDeworm: 3 months." },
{ id: 6, cat: "طيور", catEn: "Poultry",
icon: "🐔", tAr: "تربية الفراخ",
tEn: "Chicken",
bAr: "الحرارة: 33.\nالاكل: بادي 21%.\nالتحصين: نيوكاسل.",
bEn: "Temp: 33.\nFeed: 21%.\nVaccine: Newcastle." },
{ id: 7, cat: "امراض", catEn: "Diseases",
icon: "🩺", tAr: "امراض المواشي",
tEn: "Diseases",
bAr: "قلاعية: حرارة.\nالتهاب ضرع: سخن.\nاعزل وكلم دكتور.",
bEn: "FMD: fever.\nMastitis: hot.\nCall vet." },
{ id: 8, cat: "مشاريع", catEn: "Projects",
icon: "💰", tAr: "مشاريع مربحة",
tEn: "Projects",
bAr: "10 فراخ للبيض.\nجديين ماعز.\nابدأ صغير.",
bEn: "10 hens.\n2 goats.\nStart small." },
];
export default function App() {
const [lang, setLang] = useState("ar");
const [mode, setMode] = useState("home");
const [search, setSearch] = useState("");
const [filter, setFilter] = useState("الكل");
const [openId, setOpenId] = useState(null);
const [chats, setChats] = useState([]);
const [activeId, setActiveId] = useState(null);
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);
const [vPrompt, setVPrompt] = useState("");
const [vLoading, setVLoading] = useState(false);
const [vResult, setVResult] = useState(null);
const scrollRef = useRef(null);
const isAr = lang === "ar";
const activeChat = chats.find((c) => c.id === activeId);
useEffect(() => { loadChats(); }, []);
useEffect(() => {
if (chats.length > 0) {
AsyncStorage.setItem(KEY, JSON.stringify(chats));
}
}, [chats]);
async function loadChats() {
try {
const saved = await AsyncStorage.getItem(KEY);
if (saved) {
const d = JSON.parse(saved);
if (d.length > 0) { setChats(d); setActiveId(d[0].id); return; }
}
} catch (e) {}
const f = { id: Date.now(), title: "new", messages: [] };
setChats([f]); setActiveId(f.id);
}
function updateChat(id, msgs) {
setChats((p) => p.map((c) => {
if (c.id !== id) return c;
return { ...c, messages: msgs };
}));
}
async function sendMessage() {
const text = message.trim();
if (!text) return; if (loading) return;
if (!activeChat) return;
setMessage("");
const cid = activeId;
const prev = activeChat.messages;
const nm = [...prev, { role: "user", text }];
updateChat(cid, nm); setLoading(true);
try {
const base = isAr ? "انت دكتور بيطري." : "You are vet.";
const prompt = base + " " + text;
const res = await fetch(API_URL, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ prompt, language: lang, history: nm.slice(-10) }),
});
const data = await res.json();
updateChat(cid, [...nm, { role: "assistant", text: data.text || "no reply" }]);
} catch (e) {
updateChat(cid, [...nm, { role: "assistant", text: "⚠️ " + e.message }]);
} finally { setLoading(false); }
}
function generateVideo() {
if (!vPrompt.trim()) { Alert.alert("AI8", isAr ? "اكتب وصف" : "Write desc"); return; }
setVLoading(true); setVResult(null);
setTimeout(() => {
setVResult(isAr ? "✅ تم التوليد!" : "✅ Done!"); setVLoading(false);
}, 2500);
}
const cats = isAr
? ["الكل", "زراعة", "مواشي", "طيور", "امراض", "مشاريع"]
: ["All", "Crops", "Livestock", "Poultry", "Diseases", "Projects"];
const filtered = DATA.filter((item) => {
const catOk = filter === "الكل" || filter === "All" || (isAr ? item.cat === filter : item.catEn === filter);
const q = search.trim().toLowerCase();
if (!q) return catOk;
const title = isAr ? item.tAr : item.tEn;
return catOk && title.toLowerCase().includes(q);
});
function openCat(c) { setFilter(c); setMode("library"); }
return (
<SafeAreaView style={s.container}>
<StatusBar barStyle="light-content" />
<View style={s.topBar}>
<View>
<Text style={s.topSmall}>{isAr ? "اهلا بيك في" : "Welcome to"}</Text>
<Text style={s.logo}>🌾 AI8 الفلاح</Text>
</View>
<View style={s.langRow}>
<TouchableOpacity onPress={() => setLang("ar")} style={[s.langBtn, lang === "ar" && s.langOn]}>
<Text style={s.langTxt}>عربي</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => setLang("en")} style={[s.langBtn, lang === "en" && s.langOn]}>
<Text style={s.langTxt}>EN</Text>
</TouchableOpacity>
</View>
</View>
<View style={s.tabs}>
<TouchableOpacity onPress={() => setMode("home")} style={[s.tab, mode === "home" && s.tabOn]}>
<Text style={s.tabTxt}>{isAr ? "🏠 الرئيسية" : "🏠 Home"}</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => setMode("library")} style={[s.tab, mode === "library" && s.tabOn]}>
<Text style={s.tabTxt}>{isAr ? "📚 مكتبة" : "📚 Library"}</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => setMode("chat")} style={[s.tab, mode === "chat" && s.tabOn]}>
<Text style={s.tabTxt}>{isAr ? "💬 اسأل" : "💬 Ask"}</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => setMode("video")} style={[s.tab, mode === "video" && s.tabOn]}>
<Text style={s.tabTxt}>{isAr ? "🎬 فيديو" : "🎬 Video"}</Text>
</TouchableOpacity>
</View>
{mode === "home" && (
<ScrollView style={s.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
<View style={s.hero}>
<Text style={s.heroIcon}>🌾🐄🐔</Text>
<Text style={s.heroTitle}>{isAr ? "مكتبة الفلاح" : "Farmer Library"}</Text>
<Text style={s.heroSub}>{isAr ? "دروس جاهزة في الزراعة والمواشي" : "Ready lessons"}</Text>
<TouchableOpacity style={s.heroBtn} onPress={() => setMode("library")}>
<Text style={s.heroBtnTxt}>{isAr ? "📚 افتح المكتبة" : "📚 Open Library"}</Text>
</TouchableOpacity>
</View>
<Text style={s.secTitle}>{isAr ? "اختار قسم" : "Choose Section"}</Text>
<View style={s.grid}>
<TouchableOpacity style={s.gridCard} onPress={() => openCat(isAr ? "زراعة" : "Crops")}>
<Text style={s.gridIcon}>🌾</Text><Text style={s.gridTxt}>{isAr ? "الزراعة" : "Crops"}</Text>
</TouchableOpacity>
<TouchableOpacity style={s.gridCard} onPress={() => openCat(isAr ? "مواشي" : "Livestock")}>
<Text style={s.gridIcon}>🐄</Text><Text style={s.gridTxt}>{isAr ? "المواشي" : "Livestock"}</Text>
</TouchableOpacity>
<TouchableOpacity style={s.gridCard} onPress={() => openCat(isAr ? "طيور" : "Poultry")}>
<Text style={s.gridIcon}>🐔</Text><Text style={s.gridTxt}>{isAr ? "الطيور" : "Poultry"}</Text>
</TouchableOpacity>
<TouchableOpacity style={s.gridCard} onPress={() => openCat(isAr ? "مشاريع" : "Projects")}>
<Text style={s.gridIcon}>💰</Text><Text style={s.gridTxt}>{isAr ? "مشاريع" : "Projects"}</Text>
</TouchableOpacity>
</View>
<View style={s.tipBox}>
<Text style={s.tipTitle}>{isAr ? "💡 نصيحة اليوم" : "💡 Tip"}</Text>
<Text style={s.tipText}>{isAr ? "متغيرش العلف فجأة." : "Change feed slowly."}</Text>
</View>
<TouchableOpacity style={s.askBox} onPress={() => setMode("chat")}>
<Text style={s.askTitle}>{isAr ? "💬 عندك سؤال؟ اسأل الدكتور" : "💬 Have question?"}</Text>
</TouchableOpacity>
</ScrollView>
)}
{mode === "library" && (
<View style={{ flex: 1 }}>
<View style={s.searchBox}>
<TextInput style={s.searchInput} placeholder={isAr ? "دور... قمح، بقر" : "Search... wheat"} placeholderTextColor="#8A96A8" value={search} onChangeText={setSearch} />
</View>
<ScrollView horizontal style={s.catScroll} showsHorizontalScrollIndicator={false}>
{cats.map((c) => (
<TouchableOpacity key={c} onPress={() => setFilter(c)} style={[s.catBtn, filter === c && s.catOn]}>
<Text style={[s.catTxt, filter === c && s.catTxtOn]}>{c}</Text>
</TouchableOpacity>
))}
</ScrollView>
<ScrollView style={s.scroll} contentContainerStyle={{ padding: 16 }}>
{filtered.map((item) => (
<TouchableOpacity key={item.id} onPress={() => setOpenId(openId === item.id ? null : item.id)} style={s.card}>
<View style={s.cardTop}>
<Text style={s.cardIcon}>{item.icon}</Text>
<View style={{ flex: 1 }}>
<Text style={s.cardTitle}>{isAr ? item.tAr : item.tEn}</Text>
<Text style={s.cardCat}>{isAr ? item.cat : item.catEn}</Text>
</View>
<Text style={s.arrow}>{openId === item.id ? "▲" : "▼"}</Text>
</View>
{openId === item.id && <Text style={s.cardBody}>{isAr ? item.bAr : item.bEn}</Text>}
</TouchableOpacity>
))}
</ScrollView>
</View>
)}
{mode === "chat" && (
<View style={{ flex: 1 }}>
<ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={{ padding: 16 }} onContentSizeChange={() => { scrollRef.current?.scrollToEnd({ animated: true }); }}>
{(!activeChat || activeChat.messages.length === 0) && (
<View style={s.welcome}>
<Text style={s.wLogo}>🌾</Text>
<Text style={s.wTitle}>{isAr ? "اسأل الفلاح" : "Ask Farmer"}</Text>
<Text style={s.sub}>{isAr ? "دكتور بيطري معاك" : "Vet with you"}</Text>
</View>
)}
{activeChat?.messages.map((it, i) => (
<View key={i} style={[s.msg, it.role === "user" ? s.uMsg : s.aiMsg]}>
<Text style={[s.msgTxt, it.role === "user" ? s.uTxt : s.aiTxt]}>{it.text}</Text>
</View>
))}
{loading && (
<View style={s.loading}>
<ActivityIndicator color="#2E7D32" />
<Text style={s.loadingTxt}>{isAr ? "بيفكر..." : "Thinking..."}</Text>
</View>
)}
</ScrollView>
<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
<View style={s.inputArea}>
<TextInput style={s.input} placeholder={isAr ? "اسأل عن بقرتك..." : "Ask about cow..."} placeholderTextColor="#8A96A8" value={message} onChangeText={setMessage} multiline />
<TouchableOpacity style={s.sendBtn} onPress={sendMessage}>
<Text style={s.sendTxt}>↑</Text>
</TouchableOpacity>
</View>
</KeyboardAvoidingView>
</View>
)}
{mode === "video" && (
<ScrollView style={s.scroll} contentContainerStyle={{ padding: 16 }}>
<Text style={s.vTitle}>🎬 {isAr ? "فيديو" : "Video"}</Text>
<Text style={s.vSub}>{isAr ? "اكتب اللي عايز تتعلمه" : "Write what to learn"}</Text>
<TextInput style={s.vInput} placeholder={isAr ? "مثال: اربي عجل" : "Ex: raise calf"} placeholderTextColor="#8A96A8" value={vPrompt} onChangeText={setVPrompt} multiline />
<TouchableOpacity style={s.genBtn} onPress={generateVideo}>
<Text style={s.genTxt}>{isAr ? "✨ ولد فيديو" : "✨ Generate"}</Text>
</TouchableOpacity>
{vLoading && <Text style={s.loadingTxt}>{isAr ? "بيتم التوليد..." : "Generating..."}</Text>}
{vResult && <View style={s.resBox}><Text style={s.resTxt}>{vResult}</Text></View>}
</ScrollView>
)}
<Text style={s.footer}>AI8 الفلاح © 2026</Text>
</SafeAreaView>
);
}
const s = StyleSheet.create({
container: { flex: 1, backgroundColor: "#F6F8F3" },
topBar: { backgroundColor: "#1B5E20", paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
topSmall: { color: "#C8E6C9", fontSize: 12 },
logo: { color: "#fff", fontSize: 21, fontWeight: "bold", marginTop: 2 },
langRow: { flexDirection: "row", gap: 6 },
langBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: "#2E7D32" },
langOn: { backgroundColor: "#FFC107" },
langTxt: { color: "#fff", fontWeight: "bold" },
tabs: { flexDirection: "row", padding: 10, gap: 6, backgroundColor: "#fff" },
tab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: "#E8F5E9", alignItems: "center" },
tabOn: { backgroundColor: "#2E7D32" },
tabTxt: { color: "#1B5E20", fontWeight: "bold", fontSize: 13 },
scroll: { flex: 1 },
hero: { backgroundColor: "#2E7D32", borderRadius: 20, padding: 20, alignItems: "center" },
heroIcon: { fontSize: 40 },
heroTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 8, textAlign: "center" },
heroSub: { color: "#E8F5E9", textAlign: "center", marginTop: 8 },
heroBtn: { backgroundColor: "#FFC107", paddingHorizontal: 22, paddingVertical: 12, borderRadius: 25, marginTop: 14 },
heroBtnTxt: { color: "#1B5E20", fontWeight: "bold", fontSize: 15 },
secTitle: { fontSize: 18, fontWeight: "bold", color: "#1B5E20", marginTop: 20, marginBottom: 10 },
grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
gridCard: { width: "48%", borderRadius: 16, padding: 14, alignItems: "center", backgroundColor: "#fff" },
gridIcon: { fontSize: 32 },
gridTxt: { fontWeight: "bold", fontSize: 15, color: "#1B5E20", marginTop: 6 },
tipBox: { backgroundColor: "#FFF8E1", borderRadius: 14, padding: 14, marginTop: 18 },
tipTitle: { fontWeight: "bold", color: "#F57F17" },
tipText: { color: "#333", marginTop: 6 },
askBox: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginTop: 12 },
askTitle: { fontWeight: "bold", color: "#1B5E20" },
searchBox: { paddingHorizontal: 16, paddingTop: 10 },
searchInput: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 11, color: "#111827" },
catScroll: { maxHeight: 44, paddingHorizontal: 12, marginTop: 10 },
catBtn: { backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, height: 36 },
catOn: { backgroundColor: "#2E7D32" },
catTxt: { color: "#333", fontWeight: "bold" },
catTxtOn: { color: "#fff" },
card: { backgroundColor: "#fff", padding: 14, borderRadius: 16, marginBottom: 10 },
cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
cardIcon: { fontSize: 32, backgroundColor: "#E8F5E9", padding: 8, borderRadius: 12 },
cardTitle: { color: "#1B5E20", fontSize: 16, fontWeight: "bold" },
cardCat: { color: "#2E7D32", fontSize: 12, marginTop: 2 },
arrow: { color: "#999" },
cardBody: { color: "#333", fontSize: 15, lineHeight: 23, marginTop: 12, backgroundColor: "#F9FBE7", padding: 10, borderRadius: 10 },
welcome: { alignItems: "center", marginTop: 40 },
wLogo: { fontSize: 50 },
wTitle: { color: "#1B5E20", fontSize: 22, fontWeight: "bold", marginTop: 10 },
sub: { color: "#666", marginTop: 8 },
msg: { padding: 14, borderRadius: 16, marginBottom: 12, maxWidth: "85%" },
uMsg: { backgroundColor: "#2E7D32", alignSelf: "flex-end" },
aiMsg: { backgroundColor: "#fff", alignSelf: "flex-start" },
msgTxt: { fontSize: 16, lineHeight: 24 },
uTxt: { color: "#fff" },
aiTxt: { color: "#111827" },
loading: { flexDirection: "row", gap: 10, padding: 12, alignItems: "center" },
loadingTxt: { color: "#333" },
inputArea: { flexDirection: "row", padding: 10, backgroundColor: "#fff", gap: 8, alignItems: "center" },
input: { flex: 1, backgroundColor: "#F5F5F5", borderRadius: 22, paddingHorizontal: 15, paddingVertical: 11, color: "#111827" },
sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#2E7D32", justifyContent: "center", alignItems: "center" },
sendTxt: { color: "#fff", fontSize: 22, fontWeight: "bold" },
footer: { color: "#888", backgroundColor: "#fff", textAlign: "center", padding: 8, fontSize: 10 },
vTitle: { color: "#1B5E20", fontSize: 22, fontWeight: "bold" },
vSub: { color: "#666", marginVertical: 8 },
vInput: { backgroundColor: "#fff", borderRadius: 16, padding: 14, minHeight: 90, color: "#111827" },
genBtn: { backgroundColor: "#2E7D32", paddingVertical: 15, borderRadius: 16, alignItems: "center", marginTop: 12 },
genTxt: { color: "#fff", fontWeight: "bold", fontSize: 17 },
resBox: { backgroundColor: "#E8F5E9", padding: 14, borderRadius: 14, marginTop: 14 },
resTxt: { color: "#1B5E20" },
});
