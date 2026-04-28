import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { streamChat } from '../api/client';

let msgId = 0;
const nextId = () => String(++msgId);

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: nextId(), role: 'assistant', content: 'Hi! I can help you analyze your finances. Ask me anything.' },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef(null);
  const listRef = useRef(null);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const updateLastAssistant = useCallback((delta) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === 'assistant' && last._streaming) {
        return [...prev.slice(0, -1), { ...last, content: last.content + delta }];
      }
      return prev;
    });
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg = { id: nextId(), role: 'user', content: text };
    const assistantMsg = { id: nextId(), role: 'assistant', content: '', _streaming: true };

    setInput('');
    setStreaming(true);
    addMessage(userMsg);
    addMessage(assistantMsg);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const chatHistory = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await streamChat(
        { userMessage: text, chatHistory, meta: { now: new Date().toISOString() } },
        controller.signal
      );

      if (!res.ok) {
        updateLastAssistant('\n[Error: ' + res.status + ']');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === 'content' && event.content) {
              updateLastAssistant(event.content);
            }
          } catch {}
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        updateLastAssistant('\n[Network error]');
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?._streaming) {
          return [...prev.slice(0, -1), { ...last, _streaming: false }];
        }
        return prev;
      });
    }
  }, [input, streaming, messages, addMessage, updateLastAssistant]);

  const renderMessage = ({ item }) => (
    <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
      <Text style={[styles.bubbleText, item.role === 'user' && styles.userBubbleText]}>
        {item.content || (item._streaming ? '…' : '')}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fcfbf5' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 16 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your finances..."
          placeholderTextColor="#7c8e88"
          multiline
          maxLength={1000}
          editable={!streaming}
        />
        {streaming ? (
          <TouchableOpacity
            style={styles.stopBtn}
            onPress={() => abortRef.current?.abort()}
          >
            <Ionicons name="stop-circle" size={28} color="#c94c4c" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1f644e',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e3d8',
  },
  bubbleText: { fontSize: 15, color: '#1e3a34', lineHeight: 22 },
  userBubbleText: { color: '#fff' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e3d8',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e3d8',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 120,
    color: '#1e3a34',
    backgroundColor: '#fff',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f644e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: { opacity: 0.4 },
  stopBtn: { padding: 4, marginBottom: 2 },
});
