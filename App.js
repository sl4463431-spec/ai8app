import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
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
  StatusBar
} from "react-native";
import AsyncStorage
from "@react-native-async-storage/async-storage";

const API_URL =
"https://ai8app.onrender.com/api/generate";
const KEY = "AI8_FARM_CHATS";

const DATA = [
  { id: 1, cat: "زراعة", catEn: "Crops", icon: "🌾",
    tAr: "زراعة القمح",
    tEn: "Wheat Farming",
    bAr: "الميعاد: 15 نوفمبر - 15 ديسمبر.\nالتقاوي: 60 كجم / فدان.\nالري: أول رية بعد 25 يوم، ثم كل 20 يوم.\nالتسميد: 3 شكاير يوريا + 2 سوبر.\nالحصاد: بعد 160 يوم.\nالمرض: الصدأ الأصفر، علاجه رش فطري عند أول ظهور.\nنصيحة: متزرعش قمح بعد قمح، بدل مع برسيم.",
    bEn: "Planting: 15 Nov - 15 Dec.\nSeeds: 60kg / feddan.\nIrrigation: first after 25 days.\nFertilizer: 3 urea + 2 super.\nHarvest: after 160 days.\nDisease: Yellow rust." },
  { id: 2, cat: "زراعة", catEn: "Crops", icon: "🌽",
    tAr: "زراعة الذرة",
    tEn: "Corn Farming",
    bAr: "الميعاد: أبريل - يونيو.\nالتقاوي: 10 كجم / فدان.\nالري: كل 10-12 يوم.\nالتسميد: يوريا + نترات.\nالآفة: دودة الحشد، رشها فورا.\nنصيحة: الذرة بتحب الشمس والري المنتظم.",
    bEn: "Planting: April - June.\nSeeds: 10kg / feddan.\nIrrigation: every 10 days.\nPest: Fall armyworm." },
  { id: 3, cat: "زراعة", catEn: "Crops", icon: "🍚",
    tAr: "زراعة الأرز",
    tEn: "Rice Farming",
    bAr: "الميعاد: مايو - يونيو.\nالمية: لازم تكون موجودة أول 40 يوم.\nالتقاوي: 60 كجم / فدان.\nالتسميد: يوريا على دفعتين.\nالحصاد: لما السنبلة تصفر 90%.",
    bEn: "Planting: May - June.\nWater: must be present first 40 days.\nSeeds: 60kg / feddan." },
  { id: 4, cat: "زراعة", catEn: "Crops", icon: "🥔",
    tAr: "زراعة البطاطس",
    tEn: "Potato Farming",
    bAr: "الميعاد: سبتمبر ويناير.\nالتقاوي: 750 كجم / فدان.\nالري: منتظم، لا تعطش ولا تغرق.\nالتسميد: البوتاسيوم مهم للتحجيم.\nالمرض: الندوة المتأخرة، رش وقائي.",
    bEn: "Planting: Sept & Jan.\nSeeds: 750kg / feddan.\nPotassium is key for size." },
  { id: 5, cat: "زراعة", catEn: "Crops", icon: "🍅",
    tAr: "زراعة الطماطم",
    tEn: "Tomato Farming",
    bAr: "الميعاد: طول السنة في الصوب.\nالري: تنقيط أفضل حاجة.\nالتسميد: كالسيوم عشان عفن الطرف الزهري.\nالمرض: التوتا ابسلوتا، ركب مصايد.\nالحصاد: كل 3 أيام.",
    bEn: "Planting: all year in greenhouse.\nDrip irrigation is best.\nCalcium prevents blossom rot." },
  { id: 6, cat: "زراعة", catEn: "Crops", icon: "🧅",
    tAr: "زراعة البصل",
    tEn: "Onion Farming",
    bAr: "الميعاد: أكتوبر - نوفمبر.\nالشتل: بعد 50 يوم من المشتل.\nالري: كل 15 يوم.\nالتسميد: نترات + بوتاسيوم.\nالتخزين: في مكان جاف مهوي.",
    bEn: "Planting: Oct - Nov.\nTransplant after 50 days.\nStore in dry ventilated place." },
  { id: 7, cat: "مواشي", catEn: "Livestock", icon: "🐄",
    tAr: "تربية البقر الحلاب",
    tEn: "Dairy Cow",
    bAr: "الأكل: علف مركز 18% بروتين + برسيم + تبن.\nالكمية: 2% من وزنها علف جاف.\nالمية: نضيفة 24 ساعة.\nالحليب: احلب في ميعاد ثابت.\nالتحصين: قلاعية كل 6 شهور.\nعلامة الصحة: عين لامعة، أكل كويس.",
    bEn: "Feed: 18% protein + clover + hay.\nWater: clean 24h.\nVaccine: FMD every 6 months." },
  { id: 8, cat: "مواشي", catEn: "Livestock", icon: "🐃",
    tAr: "تربية الجاموس",
    tEn: "Buffalo Raising",
    bAr: "الجاموس بيحب المية في الصيف.\nاللبن: دهون أعلى من البقر، سعره أعلى.\nالأكل: طاقة عالية + برسيم.\nالتحصين: قلاعية + تسمم دموي.\nنصيحة: الجاموس حساس للحرارة، وفر ضل.",
    bEn: "Loves water in summer.\nMilk fat higher than cow.\nProvide shade." },
  { id: 9, cat: "مواشي", catEn: "Livestock", icon: "🐑",
    tAr: "تربية الغنم",
    tEn: "Sheep Raising",
    bAr: "الولادة: مرتين في السنة.\nالأكل: برسيم + علف قليل.\nالتحصين: جدري + تسمم معوي.\nالديدان: جرعة كل 3 شهور.\nالجز: مرتين في السنة، الصوف بيتباع.",
    bEn: "Birth: twice a year.\nDeworming every 3 months.\nShearing twice a year." },
  { id: 10, cat: "مواشي", catEn: "Livestock", icon: "🐐",
    tAr: "تربية الماعز",
    tEn: "Goat Raising",
    bAr: "الماعز أنشط من الغنم وبتاكل أي خضرة.\nاللبن: مفيد جدا للأطفال.\nالتسمين: 6 شهور وبيع في العيد.\nالتحصين: نفس الغنم.\nمشروع مربح ورأس ماله صغير.",
    bEn: "More active than sheep.\nMilk is very healthy.\nFatten 6 months, sell in Eid." },
  { id: 11, cat: "طيور", catEn: "Poultry", icon: "🐔",
    tAr: "تربية الفراخ البياض",
    tEn: "Laying Hens",
    bAr: "النور: 16 ساعة نور في اليوم عشان تبيض.\nالأكل: علف بياض 16% بروتين + كالسيوم.\nالمية: نضيفة طول اليوم.\nالبيض: اجمعه مرتين في اليوم.\nالتحصين: نيوكاسل + جمبورو.",
    bEn: "Light: 16h per day for eggs.\nFeed: layer 16% + calcium.\nCollect eggs twice daily." },
  { id: 12, cat: "طيور", catEn: "Poultry", icon: "🍗",
    tAr: "تربية الفراخ التسمين",
    tEn: "Broiler Chicken",
    bAr: "الحرارة: أول أسبوع 33 درجة.\nالأكل: بادي 21% ثم نامي 19%.\nالدورة: 35-40 يوم.\nالتهوية: أهم حاجة عشان الأمراض التنفسية.\nالوزن: 2 كجم في 35 يوم لو الأكل صح.",
    bEn: "Temp: first week 33°C.\nCycle: 35-40 days.\nVentilation is key." },
  { id: 13, cat: "طيور", catEn: "Poultry", icon: "🦆",
    tAr: "تربية البط",
    tEn: "Duck Raising",
    bAr: "البط بيكبر أسرع من الفراخ.\nالأكل: علف + خضرة.\nالتحصين: طاعون البط.\nالدبح: بعد 60 يوم.\nنصيحة: البط بيحب المية بس مش لازم حمام.",
    bEn: "Grows faster than chicken.\nSlaughter after 60 days." },
  { id: 14, cat: "طيور", catEn: "Poultry", icon: "🦃",
    tAr: "تربية الرومي",
    tEn: "Turkey Raising",
    bAr: "الرومي سعره عالي في رمضان والعيد.\nالأكل: بروتين عالي 28% أول شهر.\nالحرارة: حساس للبرد أول أسبوعين.\nالدورة: 4-5 شهور.",
    bEn: "High price in Ramadan & Eid.\nHigh protein 28% first month." },
  { id: 15, cat: "أمراض", catEn: "Diseases", icon: "🩺",
    tAr: "أمراض المواشي وعلاجها",
    tEn: "Livestock Diseases",
    bAr: "1- قلاعية: حرارة + فقاقيع فم. اعزل فورا.\n2- تسمم معوي: انتفاخ وموت مفاجئ.\n3- التهاب ضرع: ضرع سخن ولبن متقطع.\n4- ديدان: خسسان رغم الأكل.\nالقاعدة: اعزل، كلم دكتور، متديش مضاد من نفسك.",
    bEn: "1- FMD: fever + blisters. Isolate.\n2- Enterotoxemia: sudden death.\n3- Mastitis: hot udder.\nCall vet, don't self-treat." },
  { id: 16, cat: "أمراض", catEn: "Diseases", icon: "🌿",
    tAr: "أمراض النبات",
    tEn: "Plant Diseases",
    bAr: "الندوة: بقع سوداء، رش فطري.\nالمن: حشرات صغيرة، رش صابون زراعي.\nدودة الحشد: بتاكل الذرة، رش فورا.\nالفيروس: ملهوش علاج، اقلع النبات المصاب.",
    bEn: "Blight: black spots, fungicide.\nAphids: small insects.\nVirus: no cure, remove plant." },
  { id: 17, cat: "أعلاف", catEn: "Feed", icon: "🌿",
    tAr: "الأعلاف والتغذية الصح",
    tEn: "Feed & Nutrition",
    bAr: "تسمين: 16% بروتين.\nحلاب: 18% بروتين + طاقة.\nبياض: 16% + كالسيوم.\nالبرسيم: أحسن علف شتوي.\nممنوع تغير العلف فجأة، غيره في 7 أيام.\nالتبن لازم يكون ناشف مفيهوش عفن.",
    bEn: "Fattening: 16% protein.\nDairy: 18% protein.\nNever change feed suddenly." },
  { id: 18, cat: "تحصينات", catEn: "Vaccines", icon: "💉",
    tAr: "جدول التحصينات الكامل",
    tEn: "Vaccination Schedule",
    bAr: "بقر: قلاعية كل 6 شهور.\nغنم: جدري + تسمم معوي.\nفراخ: نيوكاسل يوم 7 و 21.\nبط: طاعون البط.\nسجل كل تحصين في كراسة بتاريخه.",
    bEn: "Cow: FMD every 6 months.\nSheep: pox + enterotoxemia.\nChicken: Newcastle day 7 & 21." },
  { id: 19, cat: "مشاريع", catEn: "Projects", icon: "💰",
    tAr: "مشاريع فلاحية مربحة",
    tEn: "Profitable Projects",
    bAr: "1- 10 فراخ بلدي للبيض: تكلفة قليلة وبيض يومي.\n2- جديين ماعز تسمين 6 شهور وبيع في العيد.\n3- أرنبين ولادة كل شهر.\n4- منحل صغير 5 خلايا عسل.\nابدأ صغير، متاخدش قرض أول مرة.",
    bEn: "1- 10 hens for eggs.\n2- 2 goats fatten 6 months.\n3- 2 rabbits.\n4- 5 beehives.\nStart small." },
  { id: 20, cat: "مشاريع", catEn: "Projects", icon: "🐝",
    tAr: "تربية النحل والعسل",
    tEn: "Beekeeping",
    bAr: "الخلية: بتبدأ بـ 5 براويز.\nالمكان: بعيد عن الدوشة والشمس القوية.\nالعسل: قطفة في الربيع وقطفة في الصيف.\nالتغذية: محلول سكري في الشتاء.\nالربح: عسل + شمع + طرود.",
    bEn: "Hive: start with 5 frames.\nHoney: spring & summer harvest.\nProfit: honey + wax." },
];

export default function App() {
  const [lang, setLang] =
  useState("ar");
  const [mode, setMode] =
  useState("home");
  const [search, setSearch] =
  useState("");
  const [filter, setFilter] =
  useState("الكل");
  const [openId, setOpenId] =
  useState(null);
  const [chats, setChats] =
  useState([]);
  const [activeId, setActiveId] =
  useState(null);
  const [message, setMessage] =
  useState("");
  const [loading, setLoading] =
  useState(false);
  const [vPrompt, setVPrompt] =
  useState("");
  const [vLoading, setVLoading] =
  useState(false);
  const [vResult, setVResult] =
  useState(null);
  const scrollRef = useRef(null);

  const isAr = lang === "ar";
  const activeChat = chats.find(
    (c) => c.id === activeId
  );

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    try {
      const saved = await AsyncStorage
        .getItem(KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.length > 0) {
          setChats(d);
          setActiveId(d[0].id);
          return;
        }
      }
    } catch (e) {}
    const f = {
      id: Date.now(),
      title: "new",
      messages: [],
    };
    setChats([f]);
    setActiveId(f.id);
  }

  function updateChat(id, msgs) {
    setChats((p) =>
      p.map((c) => {
        if (c.id !== id) return c;
        return { ...c, messages: msgs };
      })
    );
  }

  async function sendMessage() {
    const text = message.trim();
    if (!text) return;
    if (loading) return;
    if (!activeChat) return;
    setMessage("");
    const cid = activeId;
    const prev = activeChat.messages;
    const nm = [
      ...prev,
      { role: "user", text },
    ];
    updateChat(cid, nm);
    setLoading(true);
    try {
      const prompt = isAr
        ? "انت دكتور بيطري ومهندس زراعي مصري خ
