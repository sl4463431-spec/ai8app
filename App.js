
import React, { useState } from "react";
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
} from "react-native";

const API_URL = "https://ai8app.onrender.com/api/generate";

export default function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage("");

    setMessages((old) => [
      ...old,
      { role: "user", text: userMessage },
    ]);

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMessage,
          task: "assistant",
          language: "ar",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ في الاتصال");
      }

      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          text: data.text || "لم يصل رد من الذكاء الاصطناعي",
        },
      ]);
    } catch (error) {
      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          text: "حدث خطأ: " + error.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>AI8</Text>
        <Text style={styles.subtitle}>
          مساعدك الذكي
        </Text>
        <Text style={styles.status}>
          ● متصل بالسيرفر
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={10}
      >
        <ScrollView
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && (
            <View style={styles.welcome}>
              <Text style={styles.welcomeTitle}>
                أهلاً بك في AI8 👋
              </Text>
              <Text style={styles.welcomeText}>
                اكتب سؤالك وسأساعدك
              </Text>
            </View>
          )}

          {messages.map((item, index) => (
            <View
              key={index}
              style={[
                styles.message,
                item.role === "user"
                  ? styles.userMessage
                  : styles.aiMessage,
              ]}
            >
              <Text style={styles.messageLabel}>
                {item.role === "user" ? "أنت" : "AI8"}
              </Text>
              <Text style={styles.messageText}>
                {item.text}
              </Text>
            </View>
          ))}

          {loading && (
            <View style={styles.loading}>
              <ActivityIndicator color="#28C7A5" />
              <Text style={styles.loadingText}>
                AI8 يفكر... انتظر قليلاً
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="اكتب رسالتك هنا..."
            placeholderTextColor="#888"
            value={message}
            onChangeText={setMessage}
            multiline
            textAlign="right"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || loading) && styles.disabledButton,
            ]}
            onPress={sendMessage}
            disabled={!message.trim() || loading}
          >
            <Text style={styles.sendText}>إرسال</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Text style={styles.footer}>
        AI8 © 2026
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101827",
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#172438",
    borderBottomWidth: 1,
    borderBottomColor: "#26364B",
  },
  logo: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#28C7A5",
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 4,
  },
  status: {
    color: "#28C7A5",
    fontSize: 12,
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  chat: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 25,
  },
  welcome: {
    alignItems: "center",
    marginTop: 100,
  },
  welcomeTitle: {
    color: "#28C7A5",
    fontSize: 25,
    fontWeight: "bold",
  },
  welcomeText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 12,
  },
  message: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    maxWidth: "90%",
  },
  userMessage: {
    backgroundColor: "#245B58",
    alignSelf: "flex-end",
  },
  aiMessage: {
    backgroundColor: "#202F43",
    alignSelf: "flex-start",
  },
  messageLabel: {
    color: "#28C7A5",
    fontWeight: "bold",
    marginBottom: 6,
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 25,
    textAlign: "right",
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  loadingText: {
    color: "#FFFFFF",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#172438",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxHeight: 110,
    color: "#111111",
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#28C7A5",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendText: {
    color: "#102027",
    fontWeight: "bold",
  },
  footer: {
    color: "#78899D",
    textAlign: "center",
    padding: 10,
    fontSize: 12,
  },
});
