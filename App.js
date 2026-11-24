
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import * as Speech from "expo-speech";

const API_URL = "https://ai8app.onrender.com/api/generate";

export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("ar");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [result, setResult] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const T = {
    ar: {
      slogan: "من فكرة إلى تأثير",
      welcome: "أهلاً بك في AI8 👋",
      subtitle: "مساعدك الذكي",
      description: "حوّل أفكارك إلى إبداعات ومشاريع",
      assistant: "المساعد الذكي",
      writing: "كتابة المحتوى",
      image: "الصور",
      video: "الفيديو",
      voice: "تحويل النص إلى صوت",
      projects: "مشاريعي",
      input: "اكتب رسالتك هنا...",
      send: "إرسال",
      generate: "إنشاء المحتوى",
      speak: "تشغيل الصوت",
      stop: "إيقاف الصوت",
      save: "حفظ المشروع",
      back: "الرئيسية",
      result: "النتيجة",
      loading: "جاري التفكير...",
      empty: "اكتب رسالتك أولاً",
      noProjects: "لا توجد مشاريع محفوظة حتى الآن",
      error: "تعذر الاتصال بالخادم",
      saved: "تم حفظ المشروع بنجاح",
      imageInfo: "خدمة إنشاء وتعديل الصور تحتاج إلى ربط مزود صور بالذكاء الاصطناعي بالخادم.",
      videoInfo: "خدمة إنشاء وتعديل الفيديو تحتاج إلى ربط مزود فيديو بالذكاء الاصطناعي بالخادم.",
      online: "مساعد AI8",
      start: "ابدأ محادثة جديدة",
      delete: "حذف",
    },
    en: {
      slogan: "Ideas into Impact",
      welcome: "Welcome to AI8 👋",
      subtitle: "Your AI Assistant",
      description: "Turn your ideas into creative projects",
      assistant: "AI Assistant",
      writing: "Content Writer",
      image: "Images",
      video: "Video",
      voice: "Text to Speech",
      projects: "My Projects",
      input: "Write your message here...",
      send: "Send",
      generate: "Generate Content",
      speak: "Play Voice",
      stop: "Stop Voice",
      save: "Save Project",
      back: "Home",
      result: "Result",
      loading: "Thinking...",
      empty: "Write a message first",
      noProjects: "No saved projects yet",
      error: "Server connection failed",
      saved: "Project saved successfully",
      imageInfo: "Image generation and editing require an AI image provider on the backend.",
      videoInfo: "Video generation and editing require an AI video provider on the backend.",
      online: "AI8 Assistant",
      start: "Start New Chat",
      delete: "Delete",
    },
    fr: {
      slogan: "Des idées à l'impact",
      welcome: "Bienvenue sur AI8 👋",
      subtitle: "Votre assistant IA",
      description: "Transformez vos idées en projets créatifs",
      assistant: "Assistant IA",
      writing: "Rédaction",
      image: "Images",
      video: "Vidéo",
      voice: "Texte en voix",
      projects: "Mes projets",
      input: "Écrivez votre message ici...",
      send: "Envoyer",
      generate: "Créer le contenu",
      speak: "Écouter",
      stop: "Arrêter",
      save: "Enregistrer",
      back: "Accueil",
      result: "Résultat",
      loading: "Réflexion...",
      empty: "Écrivez un message",
      noProjects: "Aucun projet enregistré",
      error: "Connexion au serveur impossible",
      saved: "Projet enregistré",
      imageInfo: "La création et la modification d'images nécessitent un fournisseur IA sur le serveur.",
      videoInfo: "La création et la modification de vidéos nécessitent un fournisseur IA sur le serveur.",
      online: "Assistant AI8",
      start: "Nouvelle conversation",
      delete: "Supprimer",
    },
  };

  const t = T[lang];

  const menu = [
    { id: "assistant", icon: "✦" },
    { id: "writing", icon: "✎" },
    { id: "image", icon: "▧" },
    { id: "video", icon: "▶" },
    { id: "voice", icon: "♫" },
    { id: "projects", icon: "▤" },
  ];

  function openPage(name) {
    Speech.stop();
    setPage(name);
    setInput("");
    setResult("");
  }

  function newChat() {
    setMessages([]);
    setInput("");
    Speech.stop();
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

  async function sendMessage() {
    const userMessage = input.trim();

    if (!userMessage || loading) {
      if (!userMessage) Alert.alert("AI8", t.empty);
      return;
    }

    setInput("");
    setLoading(true);

    setMessages((old) => [
      ...old,
      {
        id: Date.now().toString(),
        role: "user",
        text: userMessage,
      },
    ]);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMessage,
          task: "assistant",
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

      setMessages((old) => [
        ...old,
        {
          id: Date.now().toString() + "-ai",
          role: "ai",
          text: answer,
        },
      ]);
    } catch (error) {
      Alert.alert("AI8", error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  async function generateContent() {
    const prompt = input.trim();

    if (!prompt || loading) {
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
          prompt,
          task: "writing",
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

  function saveProject(content, title) {
    if (!content || !content.trim()) return;

    setProjects((old) => [
      {
        id: Date.now().toString(),
        title: title || "AI8",
        content,
      },
      ...old,
    ]);

    Alert.alert("AI8", t.saved);
  }

  function deleteProject(id) {
    setProjects((old) => old.filter((item) => item.id !== id));
  }

  function ActionButton({ label, onPress, secondary = false }) {
    return (
      <TouchableOpacity
        style={secondary ? styles.secondaryButton : styles.button}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  function renderHome() {
    return (
      <View>
        <View style={styles.hero}>
          <Text style={styles.logo}>AI8</Text>
          <Text style={styles.slogan}>{t.slogan}</Text>
          <Text style={styles.welcome}>{t.welcome}</Text>
          <Text style={styles.description}>{t.description}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI8 TOOLS</Text>
        </View>

        <View style={styles.grid}>
          {menu.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => openPage(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardText}>{t[item.id]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  function renderChat() {
    return (
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <View>
            <Text style={styles.chatTitle}>{t.assistant}</Text>
            <Text style={styles.onlineText}>● {t.online}</Text>
          </View>

          <TouchableOpacity
            style={styles.newChatButton}
            onPress={newChat}
          >
            <Text style={styles.newChatText}>＋</Text>
          </TouchableOpacity>
        </View>

        {messages.length === 0 && (
          <View style={styles.emptyChat}>
            <Text style={styles.chatWelcome}>{t.welcome}</Text>
            <Text style={styles.chatSubtitle}>{t.subtitle}</Text>
            <Text style={styles.description}>{t.description}</Text>
          </View>
        )}

        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.message,
              message.role === "user"
                ? styles.userMessage
                : styles.aiMessage,
            ]}
          >
            <Text style={styles.messageLabel}>
              {message.role === "user" ? "You" : "AI8"}
            </Text>
            <Text style={styles.messageText}>{message.text}</Text>

            {message.role === "ai" && (
              <TouchableOpacity
                style={styles.messageSpeak}
                onPress={() => speak(message.text)}
              >
                <Text style={styles.messageSpeakText}>🔊</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#28C7A5" />
            <Text style={styles.loadingText}>{t.loading}</Text>
          </View>
        )}

        <View style={styles.chatInputArea}>
          <TextInput
            style={styles.chatInput}
            value={input}
            onChangeText={setInput}
            placeholder={t.input}
            placeholderTextColor="#8A9BB1"
            multiline
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={loading}
          >
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderWriting() {
    return (
      <View>
        <Text style={styles.sectionTitle}>{t.writing}</Text>

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t.input}
          placeholderTextColor="#8A9BB1"
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={generateContent}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{t.generate}</Text>
          )}
        </TouchableOpacity>

        {result !== "" && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>{t.result}</Text>
            <Text style={styles.resultText}>{result}</Text>

            <ActionButton
              label={"🔊 " + t.speak}
              onPress={() => speak(result)}
              secondary
            />

            <ActionButton
              label={t.stop}
              onPress={() => Speech.stop()}
              secondary
            />

            <ActionButton
              label={t.save}
              onPress={() => saveProject(result, input)}
              secondary
            />
          </View>
        )}
      </View>
    );
  }

  function renderVoice() {
    return (
      <View style={styles.resultBox}>
        <Text style={styles.sectionTitle}>{t.voice}</Text>

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t.input}
          placeholderTextColor="#8A9BB1"
          multiline
          textAlignVertical="top"
        />

        <ActionButton
          label={"🔊 " + t.speak}
          onPress={() => speak(input)}
        />

        <ActionButton
          label={"⏹ " + t.stop}
          onPress={() => Speech.stop()}
          secondary
        />

        <ActionButton
          label={t.save}
          onPress={() => saveProject(input, t.voice)}
          secondary
        />
      </View>
    );
  }

  function renderProjects() {
    return (
      <View>
        <Text style={styles.sectionTitle}>{t.projects}</Text>

        {projects.length === 0 ? (
          <Text style={styles.info}>{t.noProjects}</Text>
        ) : (
          projects.map((item) => (
            <View key={item.id} style={styles.resultBox}>
              <Text style={styles.resultTitle}>{item.title}</Text>
              <Text style={styles.resultText}>{item.content}</Text>

              <ActionButton
                label={"🔊 " + t.speak}
                onPress={() => speak(item.content)}
                secondary
              />

              <ActionButton
                label={"✕ " + t.delete}
                onPress={() => deleteProject(item.id)}
                secondary
              />
            </View>
          ))
        )}
      </View>
    );
  }

  function renderPage() {
    if (page === "home") return renderHome();
    if (page === "assistant") return renderChat();
    if (page === "writing") return renderWriting();
    if (page === "voice") return renderVoice();
    if (page === "projects") return renderProjects();

    if (page === "image" || page === "video") {
      return (
        <View style={styles.resultBox}>
          <Text style={styles.sectionTitle}>{t[page]}</Text>
          <Text style={styles.info}>
            {page === "image" ? t.imageInfo : t.videoInfo}
          </Text>
        </View>
      );
    }

    return renderHome();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#101827"
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => openPage("home")}>
            <Text style={styles.topLogo}>AI8</Text>
          </TouchableOpacity>

          <View style={styles.languageRow}>
            {["ar", "en", "fr"].map((code) => (
              <TouchableOpacity
                key={code}
                onPress={() => setLang(code)}
                style={[
                  styles.languageButton,
                  lang === code && styles.languageActive,
                ]}
              >
                <Text style={styles.languageText}>
                  {code.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {renderPage()}

          {page !== "home" && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => openPage("home")}
            >
              <Text style={styles.backText}>← {t.back}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            AI8 © 2026 • {t.slogan}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#101827",
  },

  topBar: {
    minHeight: 65,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#26374D",
  },

  topLogo: {
    color: "#28C7A5",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 2,
  },

  languageRow: {
    flexDirection: "row",
  },

  languageButton: {
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: "#243349",
    marginLeft: 5,
  },

  languageActive: {
    backgroundColor: "#168D7A",
  },

  languageText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },

  content: {
    padding: 18,
    paddingBottom: 35,
  },

  hero: {
    backgroundColor: "#172438",
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#2D435C",
  },

  logo: {
    color: "#28C7A5",
    fontSize: 65,
    fontWeight: "900",
    letterSpacing: 5,
  },

  slogan: {
    color: "#28C7A5",
    fontSize: 17,
    fontWeight: "700",
  },

  welcome: {
    color: "#FFF",
    fontSize: 23,
    fontWeight: "800",
    marginTop: 25,
    textAlign: "center",
  },

  description: {
    color: "#AFC1D5",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
    lineHeight: 23,
  },

  sectionHeader: {
    marginBottom: 15,
  },

  sectionTitle: {
    color: "#FFF",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 16,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    minHeight: 125,
    backgroundColor: "#172438",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#2D435C",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    marginBottom: 13,
  },

  cardIcon: {
    color: "#28C7A5",
    fontSize: 35,
    marginBottom: 10,
  },

  cardText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  chatContainer: {
    flex: 1,
  },

  chatHeader: {
    backgroundColor: "#172438",
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  chatTitle: {
    color: "#FFF",
    fontSize: 19,
    fontWeight: "800",
  },

  onlineText: {
    color: "#28C7A5",
    fontSize: 12,
    marginTop: 5,
  },

  newChatButton: {
    width: 40,
    height: 40,
    backgroundColor: "#168D7A",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  newChatText: {
    color: "#FFF",
    fontSize: 26,
  },

  emptyChat: {
    backgroundColor: "#172438",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    marginBottom: 15,
  },

  chatWelcome: {
    color: "#FFF",
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
  },

  chatSubtitle: {
    color: "#28C7A5",
    fontSize: 17,
    marginTop: 12,
  },

  message: {
    borderRadius: 15,
    padding: 14,
    marginBottom: 12,
    maxWidth: "95%",
  },

  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#176B78",
  },

  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#243349",
  },

  messageLabel: {
    color: "#28C7A5",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
  },

  messageText: {
    color: "#FFF",
    fontSize: 15,
    lineHeight: 24,
  },

  messageSpeak: {
    alignSelf: "flex-end",
    padding: 7,
    marginTop: 5,
  },

  messageSpeakText: {
    color: "#FFF",
    fontSize: 18,
  },

  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },

  loadingText: {
    color: "#28C7A5",
    marginLeft: 10,
  },

  chatInputArea: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  chatInput: {
    flex: 1,
    minHeight: 52,
    maxHeight: 120,
    backgroundColor: "#243349",
    borderRadius: 14,
    padding: 14,
    color: "#FFF",
    fontSize: 15,
    textAlignVertical: "center",
  },

  sendButton: {
    width: 52,
    height: 52,
    backgroundColor: "#28C7A5",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 9,
  },

  sendText: {
    color: "#101827",
    fontSize: 24,
    fontWeight: "900",
  },

  input: {
    minHeight: 130,
    backgroundColor: "#172438",
    borderColor: "#2D435C",
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    color: "#FFF",
    fontSize: 16,
    marginVertical: 15,
  },

  button: {
    backgroundColor: "#168D7A",
    padding: 15,
    borderRadius: 13,
    alignItems: "center",
    marginBottom: 12,
  },

  secondaryButton: {
    backgroundColor: "#243B52",
    padding: 13,
    borderRadius: 11,
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },

  resultBox: {
    backgroundColor: "#172438",
    borderWidth: 1,
    borderColor: "#2D435C",
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
  },

  resultTitle: {
    color: "#28C7A5",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  resultText: {
    color: "#FFF",
    fontSize: 15,
    lineHeight: 26,
  },

  info: {
    color: "#C3D1E0",
    fontSize: 15,
    lineHeight: 25,
  },

  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#243B52",
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 17,
    marginTop: 20,
  },

  backText: {
    color: "#FFF",
    fontWeight: "700",
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: "#26374D",
    padding: 13,
    alignItems: "center",
  },

  footerText: {
    color: "#8EA6C4",
    fontSize: 12,
  },
});
