
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
  Image,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";
import { VideoView, useVideoPlayer } from "expo-video";

const API_URL = "https://ai8app.onrender.com/api";

const VideoPreview = ({ uri }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });

  return (
    <VideoView
      player={player}
      style={{ width: "100%", height: 230, borderRadius: 12 }}
      nativeControls
      contentFit="contain"
    />
  );
};

export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("ar");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [resultMedia, setResultMedia] = useState(null);

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
      chooseImage: "اختيار صورة من الهاتف",
      chooseVideo: "اختيار فيديو من الهاتف",
      editImage: "تعديل الصورة بالذكاء الاصطناعي",
      createVideo: "إنشاء فيديو بالذكاء الاصطناعي",
      editVideo: "تعديل الفيديو بالذكاء الاصطناعي",
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
      noMedia: "اختر صورة أو فيديو أولًا",
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
      chooseImage: "Choose Image",
      chooseVideo: "Choose Video",
      editImage: "AI Edit Image",
      createVideo: "AI Create Video",
      editVideo: "AI Edit Video",
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
      noMedia: "Choose media first",
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
      chooseImage: "Choisir une image",
      chooseVideo: "Choisir une vidéo",
      editImage: "Modifier avec l'IA",
      createVideo: "Créer une vidéo avec l'IA",
      editVideo: "Modifier la vidéo avec l'IA",
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
      noMedia: "Choisissez un fichier d'abord",
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
    setMedia(null);
    setMediaType(null);
    setResultMedia(null);
  }

  async function chooseMedia(type) {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("AI8", "يرجى السماح للتطبيق بالوصول إلى الصور والفيديوهات.");
        return;
      }

      const options = {
        mediaTypes:
          type === "image"
            ? ["images"]
            : ["videos"],
        allowsEditing: type === "image",
        quality: 0.8,
      };

      const picked = await ImagePicker.launchImageLibraryAsync(options);

      if (picked.canceled || !picked.assets?.length) return;

      setMedia(picked.assets[0]);
      setMediaType(type);
      setResultMedia(null);
      setResult("");
    } catch (error) {
      Alert.alert("AI8", error.message);
    }
  }

  async function generate() {
    const prompt = input.trim();

    if (!prompt) {
      Alert.alert(t.empty);
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          task: page === "writing" ? "writing" : "assistant",
          language: lang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.error);
      }

      const answer = data.text || data.answer;

      if (!answer) throw new Error(t.error);

      setResult(answer);
    } catch (error) {
      Alert.alert("AI8", error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  async function sendMediaTask(task) {
    if (!media) {
      Alert.alert("AI8", t.noMedia);
      return;
    }

    if (!input.trim()) {
      Alert.alert("AI8", t.empty);
      return;
    }

    setLoading(true);
    setResult("");
    setResultMedia(null);

    try {
      const form = new FormData();

      form.append("prompt", input.trim());
      form.append("language", lang);
      form.append("task", task);

      form.append("file", {
        uri: media.uri,
        name: media.fileName ||
          (mediaType === "image" ? "photo.jpg" : "video.mp4"),
        type: media.mimeType ||
          (mediaType === "image" ? "image/jpeg" : "video/mp4"),
      });

      const endpoint =
        task === "image_edit"
          ? "/image/edit"
          : task === "video_edit"
          ? "/video/edit"
          : "/video/generate";

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.error);
      }

      setResult(data.text || data.message || "تم استلام النتيجة");

      if (data.imageUrl || data.videoUrl || data.mediaUrl) {
        setResultMedia({
          uri: data.imageUrl || data.videoUrl || data.mediaUrl,
          type: data.videoUrl ? "video" :
            data.imageUrl ? "image" : data.mediaType,
        });
      }
    } catch (error) {
      Alert.alert(
        "AI8",
        error.message || "خدمة الصور والفيديو غير متصلة بالخادم بعد."
      );
    } finally {
      setLoading(false);
    }
  }

  function speak() {
    if (!result.trim()) {
      Alert.alert("AI8", "لا يوجد نص لتشغيله");
      return;
    }

    Speech.stop();

    Speech.speak(result, {
      language:
        lang === "ar" ? "ar-SA" :
        lang === "fr" ? "fr-FR" : "en-US",
      rate: 0.9,
      pitch: 1,
    });
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
            </View>
          ))
        )}
      </View>
    );
  }

  function renderResult() {
    if (!result && !resultMedia) return null;

    return (
      <View style={s.box}>
        <Text style={s.boxTitle}>{t.result}</Text>

        {!!result && (
          <Text style={s.boxText}>{result}</Text>
        )}

        {resultMedia?.type === "image" && (
          <Image
            source={{ uri: resultMedia.uri }}
            style={s.preview}
            resizeMode="contain"
          />
        )}

        {resultMedia?.type === "video" && (
          <VideoPreview uri={resultMedia.uri} />
        )}

        {!!result && button(t.speak, speak, true)}
        {!!result && button(t.save, saveProject, true)}
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
          {button(t.speak, () => {
            if (!input.trim()) {
              Alert.alert("AI8", t.empty);
              return;
            }
            Speech.stop();
            Speech.speak(input, {
              language:
                lang === "ar" ? "ar-SA" :
                lang === "fr" ? "fr-FR" : "en-US",
            });
          })}
          {button(t.stop, () => Speech.stop(), true)}
        </View>
      );
    }

    if (page === "image") {
      return (
        <View>
          <Text style={s.title}>{t.image}</Text>

          {button(t.chooseImage, () => chooseMedia("image"))}

          {media && mediaType === "image" && (
            <Image
              source={{ uri: media.uri }}
              style={s.preview}
              resizeMode="contain"
            />
          )}

          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="اكتب كيف تريد تعديل الصورة..."
            placeholderTextColor="#8794AD"
            multiline
          />

          {button(t.editImage, () => sendMediaTask("image_edit"))}
          {renderResult()}
        </View>
      );
    }

    if (page === "video") {
      return (
        <View>
          <Text style={s.title}>{t.video}</Text>

          {button(t.chooseVideo, () => chooseMedia("video"))}

          {media && mediaType === "video" && (
            <VideoPreview uri={media.uri} />
          )}

          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="اكتب وصف الفيديو أو التعديل المطلوب..."
            placeholderTextColor="#8794AD"
            multiline
          />

          {button(t.createVideo, () => sendMediaTask("video_generate"))}
          {button(t.editVideo, () => sendMediaTask("video_edit"), true)}

          {renderResult()}
        </View>
      );
    }

    return (
      <View>
        <Text style={s.title}>{t[page]}</Text>

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
          style={[s.btn, loading && { opacity: 0.6 }]}
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
  preview: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginVertical: 12,
    backgroundColor: "#071329",
  },
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
