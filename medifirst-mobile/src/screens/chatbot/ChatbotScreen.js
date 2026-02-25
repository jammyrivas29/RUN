import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QUICK_QUESTIONS = [
  'How to do CPR?',
  'Someone is choking, what do I do?',
  'How to treat a burn?',
  'How to stop bleeding?',
  'Signs of a heart attack?',
  'What to do for a broken bone?',
  'How to help someone having a seizure?',
  'What to do if someone is having a stroke?',
  'How to respond to poisoning?',
  'What should I do in a medical emergency?',
  'What are common first aid procedures?',
  'What should I do in an emergency?',
  'How can you assist with first aid?'

];

const RESPONSES = {
  'cpr': '🫀 **CPR Steps:**\n1. Check scene is safe\n2. Check responsiveness - tap shoulder, shout\n3. Call 911\n4. Open airway - tilt head back\n5. Give 30 chest compressions (2 inches deep, 100-120/min)\n6. Give 2 rescue breaths\n7. Repeat until help arrives',
  'choking': '😮‍💨 **For Choking:**\n1. Ask "Are you choking?"\n2. Give 5 firm back blows between shoulder blades\n3. Give 5 abdominal thrusts (Heimlich)\n4. Alternate until object expelled\n⚠️ If unconscious, call 911 and start CPR',
  'burn': '🔥 **Burn Treatment:**\n1. Cool with running water for 10-20 minutes\n2. Remove jewelry/tight items\n3. Cover with sterile bandage\n⚠️ Never use ice, butter, or toothpaste\n⚠️ Seek medical help for large or deep burns',
  'bleed': '🩹 **Stop Bleeding:**\n1. Apply firm direct pressure with clean cloth\n2. Do NOT remove cloth (add more on top)\n3. Elevate the wound above heart level\n4. Call 911 if bleeding is severe\n⚠️ Do not remove embedded objects',
  'heart attack': '❤️ **Heart Attack Signs:**\n• Chest pain or pressure\n• Pain in arm, neck, or jaw\n• Shortness of breath\n• Cold sweat, nausea\n\n**Do:** Call 911, help them sit, loosen clothing\n**If trained:** Begin CPR if unresponsive',
  'fracture': '🦴 **Broken Bone Care:**\n1. Do not try to realign bone\n2. Immobilize with a splint\n3. Apply ice wrapped in cloth\n4. Call for medical help\n⚠️ Never move someone with suspected spinal injury',
  'seizure': '⚡ **During a Seizure:**\n1. Stay calm and time it\n2. Clear dangerous objects nearby\n3. Cushion their head\n4. Roll them on their side\n⚠️ NEVER put anything in their mouth\n⚠️ Call 911 if it lasts over 5 minutes',
  'stroke': '☀️ **Stroke Care:**\n1. Call 911 immediately!\n2. Note the time symptoms started\n3. Keep them still and comfortable\n4. Do NOT give fluids or food\n⚠️ Stroke is a medical emergency!',
  'poison': '☠️ **Poisoning Response:**\n1. Call Poison Control (1-800-222-1222)\n2. Do NOT induce vomiting unless instructed\n3. Provide information about the poison\n4. Follow their instructions carefully\n⚠️ If person is unconscious, call 911 immediately!',
  'greeting': '👋 Hi! I\'m MediFirst AI Assistant.\n\nI can help you with first aid guidance. Ask me anything about emergency procedures!\n\n⚠️ For real emergencies, always call 911 first!',
  'emergency': '🚨 For emergencies, always call 911 immediately! I can provide first aid guidance, but I am not a substitute for professional medical help. Stay calm and get help on the way!',
  'responsible': '⚠️ In a medical emergency, your first responsibility is to call 911 to get professional help on the way. While waiting for help, you can provide basic first aid if you are trained, but do not attempt anything beyond your skill level. Stay calm and keep the person comfortable until help arrives.',
  'common first aid': '🩹 Common First Aid Procedures:\n• CPR for cardiac arrest\n• Heimlich maneuver for choking\n• Cooling burns with water\n• Applying pressure to stop bleeding\n• Recognizing stroke symptoms\n• Helping someone having a seizure\n• Responding to poisoning\n\n💡 Always call 911 for emergencies!',
};
''

function getResponse(question) {
  const q = question.toLowerCase();
  if (q.includes('cpr') || q.includes('resuscitation') || q.includes('heart stopped')) return RESPONSES['cpr'];
  if (q.includes('chok')) return RESPONSES['choking'];
  if (q.includes('burn') || q.includes('fire') || q.includes('scald')) return RESPONSES['burn'];
  if (q.includes('bleed') || q.includes('wound') || q.includes('cut')) return RESPONSES['bleed'];
  if (q.includes('heart attack') || q.includes('chest pain')) return RESPONSES['heart attack'];
  if (q.includes('fracture') || q.includes('broken') || q.includes('bone')) return RESPONSES['fracture'];
  if (q.includes('seizure') || q.includes('epilepsy') || q.includes('convuls')) return RESPONSES['seizure'];
  if (q.includes('heat') || q.includes('hot') || q.includes('hyperthermia')) return RESPONSES['heatstroke'];
  if (q.includes('stroke') || q.includes('brain attack') || q.includes('cerebrovascular')) return RESPONSES['stroke'];
  if (q.includes('poison') || q.includes('toxic') || q.includes('overdose')) return RESPONSES['poison'];
  if (q.includes('hi') || q.includes('hello') || q.includes('hey')) return RESPONSES['greeting'];
  if (q.includes('emergency') || q.includes('urgent') || q.includes('911')) return RESPONSES['emergency'];
  if (q.includes('What should I do in a medical emergency?') || q.includes('how can i do in medical') || q.includes('what to do in medical emergency')) return RESPONSES['responsible'];
  if (q.includes('can u help me about my health condition') || q.includes('condition') || q.includes('help me with my health')) return RESPONSES['responsible'];
  if (q.includes('what are common first aid procedures') || q.includes('common first aid') || q.includes('first aid procedures')) return RESPONSES['common first aid'];
  if (q.includes('first aid') || q.includes('help') || q.includes('assist')) {
    return `I can help with first aid questions! Try asking about:\n• CPR\n• Choking\n• Burns\n• Bleeding\n• Heart attack\n• Fractures\n• Seizures\n• Stroke\n• Poison\n\n💡 Tip: For real emergencies, always call 911 first!`;
  }
  if (q.includes('emergency') || q.includes('urgent') || q.includes('911')) {
    return `For emergencies, always call 911 immediately! I can provide first aid guidance, but I am not a substitute for professional medical help. Stay calm and get help on the way!`;
  }
  if (q.includes('help') || q.includes('assist') || q.includes('aid')) {
    return `I can help with first aid questions! Try asking about:\n• CPR\n• Choking\n• Burns\n• Bleeding\n• Heart attack\n• Fractures\n• Seizures\n• Stroke\n• Poison\n\n💡 Tip: For real emergencies, always call 911 first!`;
  }
  return `Sorry, I don't have information on that topic. Please ask about common first aid procedures like CPR, choking, burns, bleeding, heart attacks, fractures, seizures, poisons, or stroke. For emergencies, always call 911!`;     
  return `I can help with first aid questions! Try asking about:\n• CPR\n• Choking\n• Burns\n• Bleeding\n• Heart attack\n• Fractures\n• Seizures\n• Stroke\n• Poison\n\n💡 Tip: For real emergencies, always call 911 first!`;   
}

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([
    { id: '1', text: '👋 Hi! I\'m MediFirst AI Assistant.\n\nI can help you with first aid guidance. Ask me anything about emergency procedures!\n\n⚠️ For real emergencies, always call 911 first!', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question) return;

    const userMsg = { id: Date.now().toString(), text: question, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const botResponse = getResponse(question);
      const botMsg = { id: (Date.now() + 1).toString(), text: botResponse, isBot: true };
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 800);
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.isBot ? styles.botBubble : styles.userBubble]}>
      {item.isBot && (
        <View style={styles.botAvatar}>
          <Ionicons name="medkit" size={16} color="#fff" />
        </View>
      )}
      <View style={[styles.messageContent, item.isBot ? styles.botContent : styles.userContent]}>
        <Text style={[styles.messageText, item.isBot ? styles.botText : styles.userText]}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Quick Questions */}
      <View style={styles.quickContainer}>
        <FlatList
          data={QUICK_QUESTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.quickBtn} onPress={() => sendMessage(item)}>
              <Text style={styles.quickText}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 10 }}
        />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {loading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#e74c3c" />
          <Text style={styles.typingText}>AI is typing...</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about first aid..."
          placeholderTextColor="#999"
          multiline
          maxLength={200}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()} disabled={!input.trim()}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  quickContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  quickBtn: { backgroundColor: '#ffe6e6', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#ffb3b3' },
  quickText: { color: '#e74c3c', fontSize: 13, fontWeight: '500' },
  messageList: { padding: 15 },
  messageBubble: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  botBubble: { justifyContent: 'flex-start' },
  userBubble: { justifyContent: 'flex-end' },
  botAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  messageContent: { maxWidth: '78%', borderRadius: 16, padding: 12 },
  botContent: { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1 },
  userContent: { backgroundColor: '#e74c3c', borderBottomRightRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 22 },
  botText: { color: '#333' },
  userText: { color: '#fff' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8 },
  typingText: { color: '#999', fontSize: 13, marginLeft: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff', padding: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, color: '#333', backgroundColor: '#f9f9f9' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center', marginLeft: 8 }
});
