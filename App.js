import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";

const API = "https://onrender.com";
const APIV = "https://onrender.com-video";
const K1 = "AI8_LIB_V3",
  K2 = "AI8_FARM_V3",
  K3 = "AI8_OVR_V3",
  K4 = "AI8_VIDS_V3";

function uid() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

async function sSave(k, v) {
  try {
    await AsyncStorage.setItem(k, JSON.stringify(v));
    return true;
  } catch (e) {
    return false;
  }
}

async function sLoad(k) {
  try {
    const s = await AsyncStorage.getItem(k);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}

const DATA = [
  {
    t: "قمح",
    i: "🌾",
    b: "ميعاد:15نوفمبر-15ديسمبر.\nتربة:طينية جيدة الصرف.\nتقاوي:60كجم/فدان.\nري:بعد25،50،سنابل،امتلاء.\nتسميد:2سوبر+3يوريا.\nمرض:صدأ اصفر رش فطري.\nحصاد:160يوم.\nانتاج:20-24اردب.",
  },
  {
    t: "ذرة",
    i: "🌽",
    b: "ميعاد:ابريل-يونيو.\nتربة:صفراء خفيفة.\nتقاوي:10كجم.\nري:كل10ايام ممنوع تعطيش تزهير.\nتسميد:2سوبر+4يوريا.\nافة:دودة حشد رش اول ثقوب.\nحصاد:110يوم.\nانتاج:22-28اردب.",
  },
  {
    t: "بطاطس",
    i: "🥔",
    b: "ميعاد:سبتمبر ويناير.\nتربة:رملية.\nتقاوي:750كجم 2عين.\nري:منتظم.\nتسميد:4سوبر+3بوتاسيوم.\nمرض:ندوة رش كل10ايام.\nحصاد:110يوم.\nانتاج:12-15طن.",
  },
  {
    t: "طماطم",
    i: "🍅",
    b: "ميعاد:مارس وسبتمبر.\nشتلة:30يوم.\nري:تنقيط ممنوع رش ورق.\nتسميد:نترات+كالسيوم.\nمرض:توتا مصايد+رش.\nحصاد:كل3ايام.\nانتاج:20-30طن.",
  },
  {
    t: "أرز",
    i: "🍚",
    b: "ميعاد:مشتل مايو شتل يونيو.\nتربة:طينية.\nتقاوي:60كجم انقع24س.\nري:مية5سم.\nتسميد:2سوبر+3يوريا.\nحصاد:140يوم.\nانتاج:4-5طن.",
  },
  {
    t: "بصل",
    i: "🧅",
    b: "ميعاد:مشتل سبتمبر شتل نوفمبر.\nشتلة:60يوم.\nري:كل10ايام قلل قبل حصاد20يوم.\nتسميد:3سوبر+3نترات.\nحصاد:150يوم.\nانتاج:15-20طن.",
  },
  {
    t: "بقر",
    i: "🐄",
    b: "سلالة:هولشتاين لبن.\nاكل:علف18% 2% وزنها.\nمية:60-80لتر.\nحليب:ميعاد ثابت.\nتحصين:قلاعية6شهور.\nولادة:9شهور.\nنصيحة:متغيرش علف فجأة.",
  },
  {
    t: "جاموس",
    i: "🐃",
    b: "بيحب مية وطين رش مرتين صيف.\nلبن:دهون7%.\nانتاج:8-12كجم.\nتحصين:قلاعية6شهور.\nولادة:10شهور.",
  },
  {
    t: "غنم",
    i: "🐑",
    b: "سلالة:رحماني.\nاكل:1.5كجم والدة2كجم.\nولادة:مرتين سنة حمل5شهور.\nتحصين:جدري تسمم طاعون.\nديدان:كل3شهور.",
  },
  {
    t: "ماعز",
    i: "🐐",
    b: "انشط من غنم.\nلبن:مفيد دهون قليلة.\nولادة:توأم حمل5شهور.\nتسمين:6شهور بيع عيد.",
  },
  {
    t: "فراخ",
    i: "🐔",
    b: "تسمين:35-40يوم 2كجم.\nحرارة:33 اول اسبوع تنزل2.\nاكل:بادي21% نامي19%.\nبياض:نور16س علف16%+كالسيوم.\nتحصين:نيوكاسل7و21 جمبورو14.",
  },
  {
    t: "بط",
    i: "🦆",
    b: "اكل:150جم+خضرة.\nدبح:60يوم 3كجم.\nتحصين:طاعون بط.\nبيض:150/سنة.",
  },
  {
    t: "ارانب",
    i: "🐰",
    b: "ولادة:كل شهر 8 حمل30يوم.\nاكل:علف+برسيم ناشف ممنوع مبلول.\nتحصين:تسمم دموي6شهور.\nفطام:30يوم بيع شهرين.",
  },
  {
    t: "اسماك",
    i: "🐟",
    b: "بلطي اسهل.\nحوض:فدان10الاف.\nمية:نضيفة غير10% اسبوع.\nاكل:علف30% 3% وزن وجبتين.\nحصاد:6شهور 300جم.",
  },
  {
    t: "نحل",
    i: "🐝",
    b: "خلية:10براويز مشمس هادي.\nانتاج:10-15كجم عسل.\nفحص:كل10ايام.\nمرض:فاروا شرائط.",
  },
  {
    t: "اعلاف",
    i: "🌿",
    b: "تسمين16% حلاب18% بياض16%+كالسيوم.\nبرسيم:احسن شتوي.\nتبن:ناشف مفيهوش عفن.\nتغيير:في7ايام.",
  },
];

export default function App() {
  const [lang, setLang] = useState("ar");
  const [mode, setMode] = useState("home");
  const [search, setSearch] = useState("");
  const [extra, setExtra] = useState([]);
  const [over, setOver] = useState({});
  const [libLoad, setLibLoad] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editTxt, setEditTxt] = useState("");
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [vPrompt, setVPrompt] = useState("");
  const [vLoad, setVLoad] = useState(false);
  const [vRes, setVRes] = useState(null);
  const [vList, setVList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [speechOk, setSpeechOk] = useState(true);

  const ref = useRef(null);
  const isAr = lang === "ar";
  const activeChat = chats.find((c) => c.id === activeId);

  const baseLib = DATA.map((d, idx) => ({
    id: "d" + idx,
    title: d.t,
    body: over["d" + idx] || d.b,
    icon: d.i,
    fixed: true,
    edited: !!over["d" + idx],
  }));
  const allLib = [...baseLib, ...extra];

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (loaded) sSave(K2, chats);
  }, [chats, loaded]);

  useEffect(() => {
    if (loaded) sSave(K1, extra);
  }, [extra, loaded]);

  useEffect(() => {
    if (loaded) sSave(K3, over);
  }, [over, loaded]);

  useEffect(() => {
    if (loaded) sSave(K4, vList);
  }, [vList, loaded]);

  async function loadAll() {
    try {
      const a = await sLoad(K2);
      const b = await sLoad(K1);
      const c = await sLoad(K3);
      const d = await sLoad(K4);
      if (b) setExtra(b || []);
      if (c) setOver(c || {});
      if (d) setVList(d || []);
      if (a && a.length > 0) {
        setChats(a);
        setActiveId(a[0].id);
      } else {
        newChat(true);
      }
    } catch (e) {
      newChat(true);
    } finally {
      setLoaded(true);
    }
  }

  function newChat(silent) {
    const f = {
      id: uid(),
      title: isAr ? "محادثة جديدة" : "New chat",
      messages: [],
    };
    setChats((p) => [f, ...p]);
    setActiveId(f.id);
    if (!silent) setMode("chat");
    return f;
  }

  function delChat(id) {
    Alert.alert(isAr ? "مسح محادثة" : "Delete", isAr ? "متأكد؟" : "Sure?", [
      { text: isAr ? "لا" : "No" },
      {
        text: isAr ? "مسح" : "Delete",
        onPress: () => {
          const r = chats.filter((c) => c.id !== id);
          if (r.length === 0) {
            const nf = {
              id: uid(),
              title: isAr ? "محادثة جديدة" : "New chat",
              messages: [],
            };
            setChats([nf]);
            setActiveId(nf.id);
          } else {
            setChats(r);
            if (id === activeId) setActiveId(r[0].id);
          }
        },
      },
    ]);
  }

  function speak(t) {
    if (!t) return;
    try {
      if (!Speech || !Speech.speak) {
        setSpeechOk(false);
        Alert.alert(
          "AI8",
          isAr ? "ثبت expo-speech من Dependencies" : "Install expo-speech"
        );
        return;
      }
      Speech.stop();
      Speech.speak(t, { language: isAr ? "ar-EG" : "en-US", rate: 0.95 });
    } catch (e) {
      setSpeechOk(false);
      Alert.alert("AI8", isAr ? "ثبت expo-speech" : "Install expo-speech");
    }
  }

  function upChat(id, msgs) {
    setChats((p) =>
      p.map((c) =>
        c.id !== id
          ? c
          : { ...c, messages: msgs, title: msgs[0]?.text?.slice(0, 25) || c.title }
      )
    );
  }

  async function askAI(prompt, history) {
    const r = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, language: lang, history: history || [] }),
    });
    const d = await r.json();
    return d.text || "لا توجد اجابة";
  }

  async function searchLib(topic) {
    const q = (topic || search).trim();
    if (!q || libLoad) return;
    const f = allLib.find((x) => x.title === q);
    if (f) {
      setOpenId(f.id);
      setMode("library");
      return;
    }
    setLibLoad(true);
    setMode("library");
    try {
      const pr = isAr
        ? "انت مهندس زراعي ودكتور بيطري خبير في مصر. اشرح بالتفصيل الكامل عن: " +
          q +
          " ميعاد تربة تقاوي ري تسميد امراض حصاد انتاج تكلفة نصائح بالعربي المصري."
        : "Expert farmer vet explain full detail about: " + q;
      const txt = await askAI(pr, []);
      const it = { id: uid(), title: q, body: txt, icon: "📚", fixed: false };
      setExtra((p) => [it, ...p]);
      setOpenId(it.id);
    } catch (e) {
      Alert.alert("AI8", e.message);
    } finally {
      setLibLoad(false);
    }
  }

  function delLib(id) {
    Alert.alert(isAr ? "مسح" : "Delete", isAr ? "متأكد؟" : "Sure?", [
      { text: isAr ? "لا" : "No" },
      {
        text: isAr ? "مسح" : "Delete",
        onPress: () => {
          if (id.startsWith("d")) {
            const n = { ...over };
            delete n[id];
            setOver(n);
          } else {
            setExtra((p) => p.filter((x) => x.id !== id));
          }
          if (openId === id) setOpenId(null);
        },
      },
    ]);
  }

  function saveEdit() {
    if (!editId) return;
    if (editId.startsWith("d")) {
      setOver((p) => ({ ...p, [editId]: editTxt }));
    } else {
      setExtra((p) =>
        p.map((x) => (x.id === editId ? { ...x, body: editTxt } : x))
      );
    }
    setEditId(null);
    setEditTxt("");
  }

  async function sendMsg() {
    const txt = message.trim();
    if (!txt || loading || !activeChat) return;
    setMessage("");
    const cid = activeId;
    const prev = activeChat.messages;
    const nm = [...prev, { role: "user", text: txt }];
    upChat(cid, nm);
    setLoading(true);
    try {
      const hist = nm.slice(-10).map((m) => ({ role: m.role, content: m.text }));
      const sum = hist
        .map((h) => (h.role === "user" ? "فلاح: " : "مساعد: ") + h.content)
        .join("\n");
      const base = isAr
        ? "انت دكتور بيطري ومهندس زراعي خبير في مصر. جاوب بالتفصيل بالعربي المصري، وافتكر المحادثة:\n" +
          sum
        : "Expert vet answer full detail, remember:\n" + sum;
      const ans = await askAI(base + "\nالسؤال الجديد: " + txt, hist);
