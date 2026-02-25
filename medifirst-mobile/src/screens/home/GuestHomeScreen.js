import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Animated, Linking,
  Modal, TextInput, FlatList, KeyboardAvoidingView, Platform,
  ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../../store/authSlice';

// ─── Mini chatbot ─────────────────────────────────────────────────────────────
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

const LOCKED_FEATURES = [
  { icon: 'people', color: '#2980b9', bg: '#e8f4fb', label: 'Emergency Contacts', sub: 'Your saved emergency contacts' },
  { icon: 'person', color: '#8e44ad', bg: '#f5eef8', label: 'Medical Profile',    sub: 'Blood type, allergies & more' },
  { icon: 'send',   color: '#e67e22', bg: '#fef5ec', label: 'Send Location SMS',  sub: 'GPS location to contacts' },
  { icon: 'time',   color: '#c0392b', bg: '#fdecea', label: 'Call History',       sub: 'Your emergency call log' },
];

const MEMBER_PERKS = [
  { icon: 'people',        color: '#2980b9', bg: '#e8f4fb', label: 'Emergency\nContacts' },
  { icon: 'person',        color: '#8e44ad', bg: '#f5eef8', label: 'Medical\nProfile' },
  { icon: 'send',          color: '#e67e22', bg: '#fef5ec', label: 'Location\nSMS' },
  { icon: 'time',          color: '#c0392b', bg: '#fdecea', label: 'Call\nHistory' },
  { icon: 'heart',         color: '#e74c3c', bg: '#fdecea', label: 'Health\nTips' },
  { icon: 'notifications', color: '#16a085', bg: '#e8f8f5', label: 'Emergency\nAlerts' },
];

export default function GuestHomeScreen({ navigation }) {
  const dispatch = useDispatch();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', text: '👋 Hi! I\'m MediFirst AI.\n\nAsk me anything about first aid or emergencies!\n\n⚠️ For real emergencies, always call 911 first!', isBot: true },
  ]);
  const [input, setInput]         = useState('');
  const [botTyping, setBotTyping] = useState(false);
  const flatListRef               = useRef(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const sendMessage = (text) => {
    const question = text || input.trim();
    if (!question) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), text: question, isBot: false }]);
    setInput('');
    setBotTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: getResponse(question), isBot: true }]);
      setBotTyping(false);
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 800);
  };

  const renderMsg = ({ item }) => (
    <View style={[styles.msgRow, item.isBot ? styles.msgRowBot : styles.msgRowUser]}>
      {item.isBot && <View style={styles.botAvatar}><Ionicons name="medkit" size={13} color="#fff" /></View>}
      <View style={[styles.msgBubble, item.isBot ? styles.bubbleBot : styles.bubbleUser]}>
        <Text style={[styles.msgText, item.isBot ? styles.msgTextBot : styles.msgTextUser]}>{item.text}</Text>
      </View>
    </View>
  );

  const handleCall911 = () => {
    Alert.alert('🚨 Call 911', 'Do you want to call emergency services?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', style: 'destructive', onPress: () => Linking.openURL('tel:911') },
    ]);
  };

  const handleSignUp = () => { dispatch(logout()); setTimeout(() => navigation.navigate('Register'), 100); };
  const handleLogIn  = () => { dispatch(logout()); };

  const handleLockedFeature = () => {
    Alert.alert('🔒 Sign In Required', 'Create a free account or log in to access this feature.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign In',  onPress: handleLogIn },
      { text: 'Register', onPress: handleSignUp },
    ]);
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >

        {/* ══════════════════════════════════════════
            CLEAN APP HEADER (no bubbles)
        ══════════════════════════════════════════ */}
        <SafeAreaView style={styles.appHeader}>
          <View style={styles.hdrInner}>
            {/* Left: logo icon + brand */}
            <View style={styles.hdrBrand}>
              <View style={styles.hdrLogoWrap}>
                <View style={styles.hdrLogo}>
                  <Ionicons name="medical" size={22} color="#fff" />
                </View>
                <View style={styles.hdrPulseDot}>
                  <Ionicons name="pulse" size={8} color="#fff" />
                </View>
              </View>
              <View>
                <Text style={styles.hdrTitle}>MediFirst</Text>
                <Text style={styles.hdrSub}>First Aid Assistant</Text>
              </View>
            </View>

            {/* Right: Log In + Sign Up */}
            <View style={styles.hdrAuthRow}>
              <TouchableOpacity style={styles.hdrLoginBtn} onPress={handleLogIn} activeOpacity={0.85}>
                <Text style={styles.hdrLoginText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.hdrRegisterBtn} onPress={handleSignUp} activeOpacity={0.85}>
                <Ionicons name="person-add-outline" size={13} color="#fff" />
                <Text style={styles.hdrRegisterText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* ── Welcome strip ── */}
        <Animated.View style={[styles.welcomeStrip, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.welcomeLeft}>
            <Ionicons name="hand-right" size={18} color="#e74c3c" />
            <Text style={styles.welcomeText}>Welcome! Explore free tools below.</Text>
          </View>
          <TouchableOpacity onPress={handleSignUp} activeOpacity={0.85}>
            <Text style={styles.welcomeLink}>Get full access →</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ══════ EMERGENCY ══════ */}
        <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 16, marginTop: 20, marginBottom: 4 }}>
          <Text style={styles.sectionLabel}>EMERGENCY</Text>
          <Text style={styles.sectionTitle}>Quick Response</Text>
        </Animated.View>

        <Animated.View style={[styles.unifiedCard, { opacity: fadeAnim }]}>
          <View style={styles.cardHeaderStrip}>
            <Ionicons name="warning" size={14} color="#e74c3c" />
            <Text style={styles.cardHeaderText}>Always available — no sign-in needed</Text>
          </View>

          <TouchableOpacity style={styles.cardRow} onPress={handleCall911} activeOpacity={0.82}>
            <View style={[styles.rowIcon, { backgroundColor: '#e74c3c' }]}>
              <Ionicons name="call" size={20} color="#fff" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Call 911</Text>
              <Text style={styles.rowSub}>Ambulance · Fire · Police</Text>
            </View>
            <View style={[styles.rowBadge, { backgroundColor: '#fdecea' }]}>
              <Text style={styles.rowBadgeText}>CALL</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.cardDivider} />

          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('Guides')} activeOpacity={0.82}>
            <View style={[styles.rowIcon, { backgroundColor: '#2980b9' }]}>
              <Ionicons name="medical" size={20} color="#fff" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>First Aid Guides</Text>
              <Text style={styles.rowSub}>CPR, burns, choking & more — offline</Text>
            </View>
            <View style={[styles.rowBadge, { backgroundColor: '#e8f4fb' }]}>
              <Text style={styles.rowBadgeText}>FREE</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ══════ FREE TOOLS ══════ */}
        <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 16, marginTop: 24, marginBottom: 12 }}>
          <Text style={styles.sectionLabel}>FREE TOOLS</Text>
          <Text style={styles.sectionTitle}>Available to You</Text>
        </Animated.View>

        <Animated.View style={[styles.unifiedCard, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('Hospital')} activeOpacity={0.82}>
            <View style={[styles.rowIcon, { backgroundColor: '#27ae60' }]}>
              <Ionicons name="location" size={20} color="#fff" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Nearby Hospitals</Text>
              <Text style={styles.rowSub}>Find emergency care near you</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.cardDivider} />

          <TouchableOpacity style={styles.cardRow} onPress={() => setChatVisible(true)} activeOpacity={0.82}>
            <View style={[styles.rowIcon, { backgroundColor: '#16a085' }]}>
              <Ionicons name="chatbubbles" size={20} color="#fff" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>MediFirst AI</Text>
              <Text style={styles.rowSub}>Ask any first aid question</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        </Animated.View>

        {/* ══════ MEMBERS ONLY ══════ */}
        <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 16, marginTop: 24, marginBottom: 12 }}>
          <Text style={styles.sectionLabel}>MEMBERS ONLY</Text>
          <Text style={styles.sectionTitle}>Sign In to Unlock</Text>
        </Animated.View>

        <Animated.View style={[styles.unifiedCard, { opacity: fadeAnim }]}>
          <View style={styles.lockBanner}>
            <Ionicons name="lock-closed" size={13} color="#856404" />
            <Text style={styles.lockBannerText}>These features require a free account</Text>
          </View>
          {LOCKED_FEATURES.map((f, idx) => (
            <React.Fragment key={f.label}>
              <TouchableOpacity style={[styles.cardRow, { opacity: 0.7 }]} onPress={handleLockedFeature} activeOpacity={0.75}>
                <View style={[styles.rowIcon, { backgroundColor: f.bg }]}>
                  <Ionicons name={f.icon} size={20} color={f.color} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: '#666' }]}>{f.label}</Text>
                  <Text style={styles.rowSub}>{f.sub}</Text>
                </View>
                <Ionicons name="lock-closed" size={15} color="#ddd" />
              </TouchableOpacity>
              {idx < LOCKED_FEATURES.length - 1 && <View style={styles.cardDivider} />}
            </React.Fragment>
          ))}
        </Animated.View>

        {/* ══════ WITH A FREE ACCOUNT ══════ */}
        <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 16, marginTop: 24, marginBottom: 14 }}>
          <Text style={styles.sectionLabel}>WITH A FREE ACCOUNT</Text>
          <Text style={styles.sectionTitle}>Everything You Get</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 16 }}>
          <View style={styles.perkGrid}>
            {MEMBER_PERKS.map((p) => (
              <View key={p.label} style={styles.perkCard}>
                <View style={[styles.perkIconWrap, { backgroundColor: p.bg }]}>
                  <Ionicons name={p.icon} size={24} color={p.color} />
                </View>
                <Text style={styles.perkLabel}>{p.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.registerBtn} onPress={handleSignUp} activeOpacity={0.85}>
            <Ionicons name="person-add" size={18} color="#fff" />
            <Text style={styles.registerBtnText}>Create Free Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogIn} activeOpacity={0.85}>
            <Text style={styles.loginBtnText}>Already have an account?</Text>
            <Text style={styles.loginBtnHighlight}> Log In</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Tip ── */}
        <View style={styles.tip}>
          <Ionicons name="information-circle" size={17} color="#f39c12" />
          <Text style={styles.tipText}>In any emergency, <Text style={{ fontWeight: '700' }}>call 911 first</Text> before attempting first aid.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ════════ AI CHATBOT MODAL ════════ */}
      <Modal visible={chatVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setChatVisible(false)}>
        <KeyboardAvoidingView style={styles.chatModal} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderLeft}>
              <View style={styles.chatAvatar}><Ionicons name="medkit" size={18} color="#fff" /></View>
              <View>
                <Text style={styles.chatHeaderTitle}>MediFirst AI</Text>
                <Text style={styles.chatHeaderSub}>First Aid Assistant</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setChatVisible(false)} style={styles.chatCloseBtn}>
              <Ionicons name="close" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          <View style={styles.chipsWrap}>
            <FlatList
              data={QUICK_QUESTIONS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(i) => i}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.chip} onPress={() => sendMessage(item)}>
                  <Text style={styles.chipText}>{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 10 }}
            />
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(i) => i.id}
            renderItem={renderMsg}
            contentContainerStyle={styles.msgList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {botTyping && (
            <View style={styles.typingRow}>
              <ActivityIndicator size="small" color="#e74c3c" />
              <Text style={styles.typingText}>AI is typing…</Text>
            </View>
          )}

          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              value={input}
              onChangeText={setInput}
              placeholder="Ask about first aid…"
              placeholderTextColor="#aaa"
              multiline
              maxLength={200}
            />
            <TouchableOpacity style={[styles.chatSendBtn, !input.trim() && { opacity: 0.4 }]} onPress={() => sendMessage()} disabled={!input.trim()}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f7f8fa' },
  contentContainer: { paddingBottom: 20 },

  // ══════ CLEAN APP HEADER (no bubbles) ══════
  appHeader: {
    backgroundColor: '#e74c3c',
    elevation: 6,
    shadowColor: '#c0392b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  hdrInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Brand (logo + name)
  hdrBrand:   { flexDirection: 'row', alignItems: 'center', gap: 11 },
  hdrLogoWrap:{ position: 'relative' },
  hdrLogo: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  hdrPulseDot: {
    position: 'absolute', bottom: -3, right: -3,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#27ae60',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#e74c3c',
  },
  hdrTitle: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  hdrSub:   { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 1, fontStyle: 'italic' },

  // Auth buttons — transparent outlined + white pill
  hdrAuthRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hdrLoginBtn:    {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  hdrLoginText:   { fontSize: 13, fontWeight: '700', color: '#fff' },
  hdrRegisterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: 18,
    backgroundColor: '#fff',
  },
  hdrRegisterText:{ fontSize: 13, fontWeight: '700', color: '#e74c3c' },

  // Welcome strip
  welcomeStrip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  welcomeLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  welcomeText: { fontSize: 12, color: '#555', fontWeight: '500' },
  welcomeLink: { fontSize: 12, color: '#e74c3c', fontWeight: '700' },

  // Section labels
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#c0392b', letterSpacing: 1.5, marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e' },

  // Unified card
  unifiedCard: {
    marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 8, borderWidth: 1, borderColor: '#f0f0f0',
  },
  cardHeaderStrip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fef5f5', paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#fce8e8' },
  cardHeaderText:  { fontSize: 11, color: '#c0392b', fontWeight: '700', letterSpacing: 0.4 },
  cardRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 13 },
  cardDivider:     { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 },
  rowIcon:         { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  rowText:         { flex: 1 },
  rowTitle:        { fontSize: 14, fontWeight: '800', color: '#1a1a2e' },
  rowSub:          { fontSize: 11, color: '#999', marginTop: 2 },
  rowBadge:        { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  rowBadgeText:    { fontSize: 11, fontWeight: '800', color: '#555', letterSpacing: 0.4 },

  // Lock banner
  lockBanner:     { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fef9e7', paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#fef0c0' },
  lockBannerText: { fontSize: 11, color: '#856404', fontWeight: '700' },

  // Perk grid
  perkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginBottom: 18 },
  perkCard: {
    width: '30%', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8,
    alignItems: 'center', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5,
  },
  perkIconWrap: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 9 },
  perkLabel:    { fontSize: 11, fontWeight: '700', color: '#1a1a2e', textAlign: 'center', lineHeight: 15 },

  // Auth buttons (body)
  registerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#27ae60', borderRadius: 14, paddingVertical: 15, gap: 9, marginBottom: 10,
    shadowColor: '#27ae60', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 8, elevation: 4,
  },
  registerBtnText:   { fontSize: 15, fontWeight: '800', color: '#fff' },
  loginBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 14, paddingVertical: 13, borderWidth: 1.5, borderColor: '#e0e0e0' },
  loginBtnText:      { fontSize: 14, color: '#888' },
  loginBtnHighlight: { fontSize: 14, fontWeight: '700', color: '#3498db' },

  // Tip
  tip: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fffbf0', marginHorizontal: 16, marginTop: 22, borderRadius: 12, padding: 14, gap: 10, borderLeftWidth: 4, borderLeftColor: '#f39c12' },
  tipText: { flex: 1, fontSize: 12, color: '#7d6608', lineHeight: 18 },

  // Chat modal
  chatModal:       { flex: 1, backgroundColor: '#f5f5f5' },
  chatHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  chatHeaderLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chatAvatar:      { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center' },
  chatHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a2e' },
  chatHeaderSub:   { fontSize: 11, color: '#999', marginTop: 1 },
  chatCloseBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  chipsWrap:       { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  chip:            { backgroundColor: '#ffe6e6', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: '#ffb3b3' },
  chipText:        { color: '#e74c3c', fontSize: 12, fontWeight: '500' },
  msgList:         { padding: 14 },
  msgRow:          { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowBot:       { justifyContent: 'flex-start' },
  msgRowUser:      { justifyContent: 'flex-end' },
  botAvatar:       { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center', marginRight: 7 },
  msgBubble:       { maxWidth: '78%', borderRadius: 16, padding: 11 },
  bubbleBot:       { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1 },
  bubbleUser:      { backgroundColor: '#e74c3c', borderBottomRightRadius: 4 },
  msgText:         { fontSize: 13.5, lineHeight: 21 },
  msgTextBot:      { color: '#333' },
  msgTextUser:     { color: '#fff' },
  typingRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 6 },
  typingText:      { color: '#999', fontSize: 12, marginLeft: 7 },
  chatInputRow:    { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff', padding: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  chatInput:       { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, fontSize: 14, maxHeight: 100, color: '#333', backgroundColor: '#f9f9f9' },
  chatSendBtn:     { width: 42, height: 42, borderRadius: 21, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
});