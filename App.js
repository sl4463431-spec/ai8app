
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";

import * as Speech from "expo-speech";

const API_URL = "https://ai8app.onrender.com/api/generate";

export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("ar");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const T = {
    ar: {
      slogan: "من فكرة إلى تأثير",
      welcome: "أهلاً بك في AI8",
      description: "حوّل أفكارك إلى مشاريع وإبداعات",
      assistant: "المساعد الذكي",
      writing: "كتابة المحتوى",
      video: "إنشاء وتعديل الفيديو",
      image: "تعديل الصور",
      voice: "تحويل النص لصوت",
      projects: "مشاريعي",
      input: "اكتب فكرتك هنا...",
      generate: "إرسال للذكاء الاصطناعي",
      speak: "تشغيل الصوت",
      stop: "إيقاف الصوت",
      save: "حفظ المشروع",
      back: "الرئيسية",
      result: "النتيجة",
      loading: "جاري العمل...",
      empty: "اكتب وصفًا أولًا",
      noProjects: "لا توجد مشاريع محفوظة.",
      error: "تعذر الاتصال بالخادم",
      saved: "تم حفظ المشروع",
    },
    en: {
      slogan: "Ideas into Impact",
      welcome: "Welcome to AI8",
      description: "Turn your ideas into projects",
      assistant: "AI Assistant",
      writing: "Content Writer",
      video: "Create & Edit Video",
      image: "Image Editor",
      voice: "Text to Speech",
      projects: "My Projects",
      input: "Write your idea here...",
      generate: "Send to AI",
      speak: "Play Voice",
      stop: "Stop Voice",
      save: "Save Project",
      back: "Home",
      result: "Result",
      loading: "Working...",
      empty: "Write a description first",
      noProjects: "No saved projects",
      error: "Server connection failed",
      saved: "Project saved",
    },
    fr: {
      slogan: "Des idées à l'impact",
      welcome: "Bienvenue sur AI8",
      description: "Transformez vos idées en projets",
      assistant: "Assistant IA",
      writing: "Rédaction",
      video: "Créer et modifier une vidéo",
      image: "Modifier une image",
      voice: "Texte en voix",
      projects: "Mes projets",
      input: "Écrivez votre idée ici...",
      generate: "Envoyer à l'IA",
      speak: "Écouter",
      stop: "Arrêter",
      save: "Enregistrer",
      back: "Accueil",
      result: "Résultat",
      loading: "Traitement...",
      empty: "Écrivez une description",
      noProjects: "Aucun projet enregistré",
      error: "Connexion au serveur impossible",
      saved: "Projet enregistré",
    },
  };

  const t = T[lang];

  const menu = [
    ["assistant", "✦"],
    ["writing", "✎"],
    ["video", "▶"],
    ["image", "▧"],
    ["voice", "♫"],
    ["projects", "▤"],
  ];

  function openPage(name) {
    Speech.stop();
    setPage(name);
    setInput("");
    setResult("");
  }

  function speak(text) {
    if (!text || !text.trim()) {
      Alert.alert("AI8", t.empty);
      return;
    }

    Speech.stop();

    Speech.speak(text, {
      language:
        lang === "ar"
          ? "ar-SA"
          : lang === "fr"
          ? "fr-FR"
          : "en-US",
      rate: 0.9,
      pitch: 1,
    });
  }

  async function generate() {
    if (!input.trim()) {
      Alert.alert("AI8", t.empty);
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: input.trim(),
          task: page === "writing" ? "writing" : "assistant",
          language: lang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.error);
      }

      const answer = data.text || data.answer;

      if (!answer) {
        throw new Error(t.error);
      }

      setResult(answer);
    } catch (error) {
      Alert.alert("AI8", error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  function saveProject() {
    if (!result.trim()) return;

    setProjects((old) => [
      {
        id: Date.now().toString(),
        title: input || "AI8",
        content: result,
      },
      ...old,
    ]);

    Alert.alert("AI8", t.saved);
  }

  function button(label, action, secondary = false) {
    return (
      <TouchableOpacity
        style={secondary ? s.btn2 : s.btn}
        onPress={action}
        disabled={loading}
      >
        <Text style={s.btnText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  function renderResult() {
    if (!result) return null;

    return (
      <View style={s.box}>
        <Text style={s.boxTitle}>{t.result}</Text>

        <Text style={s.boxText}>{result}</Text>

        {button(t.speak, () => speak(result), true)}
        {button(t.stop, () => Speech.stop(), true)}
        {button(t.save, saveProject, true)}
      </View>
    );
  }

  function renderHome() {
    return (
      <View>
        <View style={s.hero}>
          <Text style={s.logo}>AI8</Text>
          <Text style={s.slogan}>{t.slogan}</Text>
          <Text style={s.welcome}>{t.welcome}</Text>
          <Text style={s.description}>{t.description}</Text>
        </View>

        <Text style={s.title}>AI8 TOOLS</Text>

        <View style={s.grid}>
          {menu.map(([id, icon]) => (
            <TouchableOpacity
              key={id}
              style={s.card}
              onPress={() => openPage(id)}
            >
              <Text style={s.icon}>{icon}</Text>
              <Text style={s.cardText}>{t[id]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  function renderProjects() {
    return (
      <View>
        <Text style={s.title}>{t.projects}</Text>

        {projects.length === 0 ? (
          <Text style={s.info}>{t.noProjects}</Text>
        ) : (
          projects.map((item) => (
            <View key={item.id} style={s.box}>
              <Text style={s.boxTitle}>{item.title}</Text>
              <Text style={s.boxText}>{item.content}</Text>
              {button(t.speak, () => speak(item.content), true)}
            </View>
          ))
        )}
      </View>
    );
  }

  function renderPage() {
    if (page === "home") return renderHome();
    if (page === "projects") return renderProjects();

    if (page === "voice") {
      return (
        <View style={s.box}>
          <Text style={s.boxTitle}>{t.voice}</Text>

          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder={t.input}
            placeholderTextColor="#8794AD"
            multiline
          />

          {button(t.speak, () => speak(input))}
          {button(t.stop, () => Speech.stop(), true)}
        </View>
      );
    }

    return (
      <View>
        <Text style={s.title}>{t[page]}</Text>

        {(page === "image" || page === "video") && (
          <Text style={s.info}>
            {lang === "ar"
              ? "هذه الخدمة تحتاج إلى ربط مزود متخصص بالخادم."
              : "This service requires an external AI provider."}
          </Text>
        )}

        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder={t.input}
          placeholderTextColor="#8794AD"
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={s.btn}
          onPress={generate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={s.btnText}>{t.generate}</Text>
          )}
        </TouchableOpacity>

        {renderResult()}
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#071329" />

      <View style={s.top}>
        <TouchableOpacity onPress={() => openPage("home")}>
          <Text style={s.topLogo}>AI8</Text>
        </TouchableOpacity>

        <View style={s.langRow}>
          {["ar", "en", "fr"].map((code) => (
            <TouchableOpacity
              key={code}
              onPress={() => setLang(code)}
              style={[
                s.langBtn,
                lang === code && s.langActive,
              ]}
            >
              <Text style={s.langText}>{code.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {renderPage()}

        {page !== "home" && (
          <TouchableOpacity
            style={s.back}
            onPress={() => openPage("home")}
          >
            <Text style={s.backText}>← {t.back}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={s.footer}>
        <Text style={s.footerText}>AI8 • {t.slogan}</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#071329" },
  top: {
    minHeight: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1B3154",
  },
  topLogo: {
    color: "#48A7FF",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 2,
  },
  langRow: { flexDirection: "row" },
  langBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: "#142542",
    marginLeft: 5,
  },
  langActive: { backgroundColor: "#1677D2" },
  langText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  content: { padding: 20, paddingBottom: 35 },
  hero: {
    backgroundColor: "#10294D",
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#23518A",
  },
  logo: {
    color: "#55B5FF",
    fontSize: 58,
    fontWeight: "900",
    letterSpacing: 5,
  },
  slogan: { color: "#69BFFF", fontSize: 17, fontWeight: "700" },
  welcome: {
    color: "#FFF",
    fontSize: 23,
    fontWeight: "800",
    marginTop: 25,
    textAlign: "center",
  },
  description: {
    color: "#C2D2E8",
    fontSize: 14,
    marginTop: 9,
    textAlign: "center",
  },
  title: {
    color: "#FFF",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 17,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    minHeight: 125,
    backgroundColor: "#102443",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#24466F",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
  },
  icon: { color: "#53B4FF", fontSize: 34, marginBottom: 10 },
  cardText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  input: {
    minHeight: 125,
    backgroundColor: "#102443",
    borderColor: "#31577F",
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    color: "#FFF",
    fontSize: 16,
    marginVertical: 15,
  },
  btn: {
    backgroundColor: "#1688E8",
    padding: 15,
    borderRadius: 13,
    alignItems: "center",
    marginBottom: 12,
  },
  btn2: {
    backgroundColor: "#1B3A60",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  btnText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  box: {
    backgroundColor: "#102443",
    borderWidth: 1,
    borderColor: "#31577F",
    borderRadius: 15,
    padding: 16,
    marginVertical: 12,
  },
  boxTitle: {
    color: "#61B9FF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  boxText: { color: "#FFF", fontSize: 15, lineHeight: 25 },
  info: { color: "#D0DCEC", fontSize: 15, lineHeight: 24 },
  back: {
    alignSelf: "flex-start",
    backgroundColor: "#17385F",
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 17,
    marginTop: 20,
  },
  backText: { color: "#FFF", fontWeight: "700" },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#1B3154",
    padding: 13,
    alignItems: "center",
  },
  footerText: { color: "#8EA6C4", fontSize: 12 },
});
