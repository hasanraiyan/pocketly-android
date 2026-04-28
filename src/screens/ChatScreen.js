import React, { useState, useRef, useCallback } from 'react';
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
import { usePocketly } from '../context/PocketlyContext';
import FinanceChatBlockRenderer from '../components/ui/chat/FinanceChatBlockRenderer';
import AddTransactionModal from '../components/AddTransactionModal';

export default function ChatScreen() {
  const { createTransaction } = usePocketly();
  const [messages, setMessages] = useState([
    { 
      id: 'welcome', 
      role: 'assistant', 
      content: "Hi! I'm your Finance Assistant. I can help you understand your spending habits, track budgets, and get insights about your finances. How can I help you today?",
      steps: [],
      uiBlocks: []
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editData, setEditData] = useState(null);
  
  const abortRef = useRef(null);
  const listRef = useRef(null);

  const processStream = useCallback(async (res, assistantId) => {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.id !== assistantId) return prev;

            let nextContent = last.content;
            let nextSteps = [...(last.steps || [])];
            let nextBlocks = [...(last.uiBlocks || [])];

            if (event.type === 'content' && event.message) {
              nextContent += event.message;
            } else if (event.type === 'tool_start') {
              nextSteps.push({ id: event.toolCallId, label: event.label, done: false });
            } else if (event.type === 'tool_end') {
              nextSteps = nextSteps.map(s => 
                (s.id === event.toolCallId || s.label === event.label) ? { ...s, done: true } : s
              );
              // Add any UI blocks returned by the tool
              if (event.uiBlocks) {
                for (const block of event.uiBlocks) {
                  if (!nextBlocks.some(b => JSON.stringify(b) === JSON.stringify(block))) {
                    nextBlocks.push(block);
                  }
                }
              }
            }

            return [
              ...prev.slice(0, -1),
              { ...last, content: nextContent, steps: nextSteps, uiBlocks: nextBlocks }
            ];
          });
        } catch {}
      }
    }
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg = { id: String(Date.now()), role: 'user', content: text };
    const assistantId = String(Date.now() + 1);
    const assistantMsg = { 
      id: assistantId, 
      role: 'assistant', 
      content: '', 
      steps: [], 
      uiBlocks: [],
      _streaming: true 
    };

    setInput('');
    setStreaming(true);
    setMessages(prev => [...prev, userMsg, assistantMsg]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const chatHistory = messages
        .filter(m => m.content)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await streamChat(
        { userMessage: text, chatHistory, meta: { now: new Date().toISOString() } },
        controller.signal
      );

      if (!res.ok) throw new Error('Failed to connect');
      await processStream(res, assistantId);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.id === assistantId) {
            return [...prev.slice(0, -1), { ...last, content: 'Sorry, I encountered an error. Please try again.' }];
          }
          return prev;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.id === assistantId) {
          return [...prev.slice(0, -1), { ...last, _streaming: false }];
        }
        return prev;
      });
    }
  }, [input, streaming, messages, processStream]);

  const handleBlockInteract = async (action) => {
    if (action.type === 'confirm_transaction') {
      const { data, setStatus } = action;
      try {
        const payload = {
          type: data.type,
          amount: data.amount,
          note: data.description || 'Transaction from Chat',
          account: data.accountId,
          category: data.categoryId,
          toAccount: data.toAccountId,
          date: new Date().toISOString(),
        };
        await createTransaction(payload);
        setStatus('success');
      } catch (err) {
        setStatus('idle');
        Alert.alert('Error', 'Failed to save transaction: ' + err.message);
      }
    } else if (action.type === 'cancel_transaction') {
      const { data } = action;
      setEditData({
        type: data.type,
        amount: data.amount,
        note: data.description,
        account: { id: data.accountId, name: data.accountName },
        category: { id: data.categoryId, name: data.categoryName },
        toAccount: { id: data.toAccountId, name: data.toAccountName },
      });
      setShowAddModal(true);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.bubbleContainer, item.role === 'user' ? styles.userContainer : styles.assistantContainer]}>
      {item.role === 'assistant' && (
        <View style={styles.assistantIcon}><Ionicons name="sparkles" size={12} color="#fff" /></View>
      )}
      <View style={[styles.bubbleWrapper, { flex: 1 }]}>
        <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
          {item.steps && item.steps.length > 0 && (
            <View style={styles.stepsContainer}>
              {item.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  {step.done ? (
                    <Ionicons name="checkmark-circle" size={14} color="#1f644e" />
                  ) : (
                    <ActivityIndicator size="small" color="#1f644e" style={{ transform: [{ scale: 0.7 }] }} />
                  )}
                  <Text style={styles.stepText}>{step.label}</Text>
                </View>
              ))}
            </View>
          )}
          {item.content ? (
            <Text style={[styles.bubbleText, item.role === 'user' && styles.userBubbleText]}>{item.content}</Text>
          ) : (
            item._streaming && item.steps?.length === 0 && <ActivityIndicator size="small" color="#1f644e" />
          )}
        </View>

        {/* UI Blocks */}
        {item.role === 'assistant' && item.uiBlocks?.map((block, i) => (
          <FinanceChatBlockRenderer 
            key={i} 
            block={block} 
            onInteract={handleBlockInteract} 
          />
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fcfbf5' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 32 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
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
          <TouchableOpacity style={styles.stopBtn} onPress={() => abortRef.current?.abort()}>
            <Ionicons name="stop-circle" size={32} color="#c94c4c" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
            onPress={send} 
            disabled={!input.trim()}
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <AddTransactionModal 
        visible={showAddModal} 
        onClose={() => { setShowAddModal(false); setEditData(null); }} 
        editData={editData} 
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, width: '100%' },
  userContainer: { justifyContent: 'flex-end', paddingLeft: 40 },
  assistantContainer: { justifyContent: 'flex-start', paddingRight: 40 },
  assistantIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#1f644e', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  bubbleWrapper: { maxWidth: '100%' },
  bubble: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12 },
  userBubble: { backgroundColor: '#1f644e', borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e5e3d8' },
  bubbleText: { fontSize: 15, color: '#1e3a34', lineHeight: 22 },
  userBubbleText: { color: '#fff' },
  stepsContainer: { marginBottom: 8, gap: 6 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0f5f2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  stepText: { fontSize: 12, fontWeight: '700', color: '#1f644e' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e3d8', gap: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#e5e3d8', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, maxHeight: 120, color: '#1e3a34', backgroundColor: '#fcfbf5' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1f644e', justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  sendBtnDisabled: { opacity: 0.4 },
  stopBtn: { padding: 4, marginBottom: 2 },
});
