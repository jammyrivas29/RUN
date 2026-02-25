import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Linking,
  Modal, TextInput, FlatList, KeyboardAvoidingView, Platform,
  ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { logout } from '../../store/authSlice';

// ─── Quick Questions & Responses ─────────────────────────────────────────────
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
  'How can you assist with first aid?',
];

const RESPONSES = {
  cpr:        '🫀 **CPR Steps:**\n1. Check scene is safe\n2. Check responsiveness - tap shoulder, shout\n3. Call 911\n4. Open airway - tilt head back\n5. Give 30 chest compressions (2 inches deep, 100-120/min)\n6. Give 2 rescue breaths\n7. Repeat until help arrives',
  choking:    '😮‍💨 **For Choking:**\n1. Ask "Are you choking?"\n2. Give 5 firm back blows between shoulder blades\n3. Give 5 abdominal thrusts (Heimlich)\n4. Alternate until object expelled\n⚠️ If unconscious, call 911 and start CPR',
  burn:       '🔥 **Burn Treatment:**\n1. Cool with running water for 10-20 minutes\n2. Remove jewelry/tight items\n3. Cover with sterile bandage\n⚠️ Never use ice, butter, or toothpaste\n⚠️ Seek medical help for large or deep burns',
  bleed:      '🩹 **Stop Bleeding:**\n1. Apply firm direct pressure with clean cloth\n2. Do NOT remove cloth (add more on top)\n3. Elevate the wound above heart level\n4. Call 911 if bleeding is severe\n⚠️ Do not remove embedded objects',
  heart:      '❤️ **Heart Attack Signs:**\n• Chest pain or pressure\n• Pain in arm, neck, or jaw\n• Shortness of breath\n• Cold sweat, nausea\n\n**Do:** Call 911, help them sit, loosen clothing\n**If trained:** Begin CPR if unresponsive',
  fracture:   '🦴 **Broken Bone Care:**\n1. Do not try to realign bone\n2. Immobilize with a splint\n3. Apply ice wrapped in cloth\n4. Call for medical help\n⚠️ Never move someone with suspected spinal injury',
  seizure:    '⚡ **During a Seizure:**\n1. Stay calm and time it\n2. Clear dangerous objects nearby\n3. Cushion their head\n4. Roll them on their side\n⚠️ NEVER put anything in their mouth\n⚠️ Call 911 if it lasts over 5 minutes',
  stroke:     '☀️ **Stroke Care:**\n1. Call 911 immediately!\n2. Note the time symptoms started\n3. Keep them still and comfortable\n4. Do NOT give fluids or food\n⚠️ Stroke is a medical emergency!',
  poison:     '☠️ **Poisoning Response:**\n1. Call Poison Control (1-800-222-1222)\n2. Do NOT induce vomiting unless instructed\n3. Provide information about the poison\n4. Follow their instructions carefully\n⚠️ If person is unconscious, call 911 immediately!',
  greeting:   '👋 Hi! I\'m MediFirst AI Assistant.\n\nI can help you with first aid guidance. Ask me anything about emergency procedures!\n\n⚠️ For real emergencies, always call 911 first!',
  emergency:  '🚨 For emergencies, always call 911 immediately! I can provide first aid guidance, but I am not a substitute for professional medical help. Stay calm and get help on the way!',
  responsible:'⚠️ In a medical emergency, your first responsibility is to call 911 to get professional help on the way. While waiting for help, you can provide basic first aid if you are trained. Stay calm and keep the person comfortable until help arrives.',
  commonaid:  '🩹 Common First Aid Procedures:\n• CPR for cardiac arrest\n• Heimlich maneuver for choking\n• Cooling burns with water\n• Applying pressure to stop bleeding\n• Recognizing stroke symptoms\n• Helping someone having a seizure\n• Responding to poisoning\n\n💡 Always call 911 for emergencies!',
};

function getResponse(question) {
  const q = question.toLowerCase();
  if (q.includes('cpr') || q.includes('resuscitation') || q.includes('heart stopped')) return RESPONSES.cpr;
  if (q.includes('chok')) return RESPONSES.choking;
  if (q.includes('burn') || q.includes('fire') || q.includes('scald')) return RESPONSES.burn;
  if (q.includes('bleed') || q.includes('wound') || q.includes('cut')) return RESPONSES.bleed;
  if (q.includes('heart attack') || q.includes('chest pain')) return RESPONSES.heart;
  if (q.includes('fracture') || q.includes('broken') || q.includes('bone')) return RESPONSES.fracture;
  if (q.includes('seizure') || q.includes('epilepsy') || q.includes('convuls')) return RESPONSES.seizure;
  if (q.includes('stroke') || q.includes('brain attack') || q.includes('cerebrovascular')) return RESPONSES.stroke;
  if (q.includes('poison') || q.includes('toxic') || q.includes('overdose')) return RESPONSES.poison;
  if (q.includes('hi') || q.includes('hello') || q.includes('hey')) return RESPONSES.greeting;
  if (q.includes('emergency') || q.includes('urgent') || q.includes('911')) return RESPONSES.emergency;
  if (q.includes('what to do in medical') || q.includes('medical emergency')) return RESPONSES.responsible;
  if (q.includes('common first aid') || q.includes('first aid procedures')) return RESPONSES.commonaid;
  if (q.includes('first aid') || q.includes('help') || q.includes('assist'))
    return 'I can help with first aid questions! Try asking about:\n• CPR\n• Choking\n• Burns\n• Bleeding\n• Heart attack\n• Fractures\n• Seizures\n• Stroke\n• Poison\n\n💡 Tip: For real emergencies, always call 911 first!';
  return "Sorry, I don't have information on that topic. Please ask about common first aid procedures like CPR, choking, burns, bleeding, heart attacks, fractures, seizures, poisons, or stroke. For emergencies, always call 911!";
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'cpr',       title: 'CPR',       icon: 'heart',   color: '#e74c3c', description: 'Cardiopulmonary Resuscitation' },
  { id: 'choking',   title: 'Choking',   icon: 'warning', color: '#e67e22', description: 'Heimlich Maneuver' },
  { id: 'burns',     title: 'Burns',     icon: 'flame',   color: '#f39c12', description: 'Burn Treatment & Care' },
  { id: 'bleeding',  title: 'Bleeding',  icon: 'bandage', color: '#c0392b', description: 'Stop Severe Bleeding' },
  { id: 'fractures', title: 'Fractures', icon: 'body',    color: '#8e44ad', description: 'Broken Bone Care' },
  { id: 'seizure',   title: 'Seizures',  icon: 'pulse',   color: '#2980b9', description: 'Seizure Response' },
  { id: 'stroke',    title: 'Stroke',    icon: 'medkit',  color: '#d35400', description: 'Stroke Emergency Care' },
  { id: 'poison',    title: 'Poisons',   icon: 'skull',   color: '#16a085', description: 'Poisoning Emergency' },
];

const QUICK_TOOLS = [
  { title: 'Nearby Hospitals',    sub: 'Find emergency care near you',  icon: 'location',    color: '#27ae60', bg: '#e9f7ef', action: 'hospital' },
  { title: 'Emergency Contacts',  sub: 'Your saved emergency contacts',  icon: 'people',      color: '#2980b9', bg: '#e8f4fb', action: 'emergency' },
  { title: 'Medical Profile',     sub: 'Blood type, allergies & more',   icon: 'person',      color: '#8e44ad', bg: '#f5eef8', action: 'profile' },
  { title: 'MediFirst Assistant', sub: 'Ask any first aid question',     icon: 'chatbubbles', color: '#16a085', bg: '#e8f8f5', action: 'chatbot' },
  { title: 'All Topics',          sub: 'Step-by-step emergency guides',  icon: 'list',        color: '#c0392b', bg: '#fdecea', action: 'guides' },
];

const FIRST_AID_FACTS = [
  { fact: 'CPR can double or triple survival chances after cardiac arrest.',              icon: 'heart',   color: '#e74c3c' },
  { fact: 'The Heimlich maneuver removes blockages in over 80% of choking cases.',       icon: 'warning', color: '#e67e22' },
  { fact: 'Running cool water on a burn for 20 minutes significantly reduces damage.',   icon: 'flame',   color: '#f39c12' },
  { fact: 'Applying firm pressure for 10 minutes stops most external bleeding.',         icon: 'bandage', color: '#c0392b' },
  { fact: 'Most seizures stop on their own within 1–3 minutes without intervention.',   icon: 'pulse',   color: '#2980b9' },
  { fact: 'Stroke can cause organ damage; immediate cooling is critical.',               icon: 'medkit',  color: '#d35400' },
  { fact: 'Fractures are classified as open or closed based on skin integrity.',         icon: 'body',    color: '#8e44ad' },
  { fact: 'Poisoning is the leading cause of injury-related death in children under 6.', icon: 'skull',  color: '#16a085' },
  { fact: 'Only 46% of cardiac arrest victims outside hospitals receive bystander CPR.', icon: 'people', color: '#16a085' },
  { fact: 'The "golden hour" after trauma is when prompt treatment saves the most lives.',icon: 'time',   color: '#f1c40f' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function UserHomeScreen({ navigation }) {
  const dispatch  = useDispatch();
  const { user }  = useSelector((state) => state.auth);
  const firstName = user?.firstName || null;
  const [locating, setLocating] = useState(false);

  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', text: '👋 Hi! I\'m MediFirst AI Assistant.\n\nI can help you with first aid guidance. Ask me anything about emergency procedures!\n\n⚠️ For real emergencies, always call 911 first!', isBot: true },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef           = useRef(null);

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), text: question, isBot: false }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const botMsg = { id: (Date.now() + 1).toString(), text: getResponse(question), isBot: true };
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

  const handleToolPress = (action) => {
    switch (action) {
      case 'hospital':  navigation.navigate('Hospital'); break;
      case 'emergency': navigation.navigate('Emergency'); break;
      case 'profile':   navigation.navigate('Profile'); break;
      case 'chatbot':   setChatVisible(true); break;
      case 'guides':    navigation.navigate('Guides', { screen: 'GuidesList' }); break;
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const handleCall911 = () => {
    Alert.alert('🚨 Call 911', 'Do you want to call emergency services?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', style: 'destructive', onPress: () => Linking.openURL('tel:911') },
    ]);
  };

  const shareLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Denied', 'Location permission is required.'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      const message  = `🚨 EMERGENCY! I need help!\nMy location: ${mapsLink}\nLat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;
      const smsUrl   = `sms:?body=${encodeURIComponent(message)}`;
      const canOpen  = await Linking.canOpenURL(smsUrl);
      if (canOpen) { await Linking.openURL(smsUrl); Alert.alert('Success', 'SMS app opened with your location!'); }
      else Alert.alert('Location Retrieved', `Your location:\n${mapsLink}`, [{ text: 'OK' }, { text: 'Open Maps', onPress: () => Linking.openURL(mapsLink) }]);
    } catch { Alert.alert('Error', 'Could not get location. Please check your settings.'); }
    finally { setLocating(false); }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        {/* ══════════════════════════════════════════
            HEADER — no bubbles, transparent buttons
            matching GuestHomeScreen exactly
        ══════════════════════════════════════════ */}
        <SafeAreaView style={styles.appHeader}>
          <View style={styles.hdrInner}>

            {/* Left: Logo + Brand */}
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
                <Text style={styles.hdrSub}>
                  {firstName ? `Hello, ${firstName}! 👋` : 'Your Emergency Companion'}
                </Text>
              </View>
            </View>

            {/* Right: Profile (outlined transparent) + Sign Out (white pill) */}
            <View style={styles.hdrAuthRow}>
              <TouchableOpacity
                style={styles.hdrProfileBtn}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.85}
              >
                <Text style={styles.hdrProfileText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.hdrLogoutBtn}
                onPress={handleLogout}
                activeOpacity={0.85}
              >
                <Ionicons name="log-out-outline" size={13} color="#e74c3c" />
                <Text style={styles.hdrLogoutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>

        {/* ── Quick Tools ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>QUICK ACCESS</Text>
          <Text style={styles.sectionTitle}>Your Tools</Text>
        </View>
        <View style={styles.toolsGrid}>
          {QUICK_TOOLS.map((tool) => (
            <TouchableOpacity key={tool.title} style={styles.toolCard} onPress={() => handleToolPress(tool.action)} activeOpacity={0.8}>
              <View style={[styles.toolIcon, { backgroundColor: tool.bg }]}>
                <Ionicons name={tool.icon} size={22} color={tool.color} />
              </View>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolSub}>{tool.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Emergency ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>EMERGENCY</Text>
          <Text style={styles.sectionTitle}>Quick Response</Text>
        </View>
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyCardHeader}>
            <Ionicons name="warning" size={15} color="#e74c3c" />
            <Text style={styles.emergencyCardHeaderText}>Tap below in case of emergency</Text>
          </View>
          <TouchableOpacity style={styles.emergencyRow} onPress={handleCall911} activeOpacity={0.82}>
            <View style={styles.emergencyRowIcon911}><Ionicons name="call" size={22} color="#fff" /></View>
            <View style={styles.emergencyRowText}>
              <Text style={styles.emergencyRowTitle}>Call 911</Text>
              <Text style={styles.emergencyRowSub}>Ambulance · Fire · Police</Text>
            </View>
            <View style={[styles.emergencyBadge, { backgroundColor: '#fdecea' }]}>
              <Text style={styles.emergencyBadgeText}>CALL</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.emergencyDivider} />
          <TouchableOpacity style={styles.emergencyRow} onPress={shareLocation} disabled={locating} activeOpacity={0.82}>
            <View style={styles.emergencyRowIconSMS}>
              <Ionicons name={locating ? 'hourglass-outline' : 'location'} size={22} color="#fff" />
            </View>
            <View style={styles.emergencyRowText}>
              <Text style={styles.emergencyRowTitle}>{locating ? 'Locating…' : 'Send My Location'}</Text>
              <Text style={styles.emergencyRowSub}>SMS your GPS to emergency contact</Text>
            </View>
            <View style={[styles.emergencyBadge, { backgroundColor: '#e9f7ef' }]}>
              <Text style={styles.emergencyBadgeText}>SMS</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── First Aid Guides ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>FIRST AID GUIDES</Text>
          <Text style={styles.sectionTitle}>Choose a Topic</Text>
        </View>
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.card}
              onPress={() => navigation.navigate('Guides', { screen: 'GuidesList', params: { category: cat.id } })}
              activeOpacity={0.78}
            >
              <View style={[styles.cardIconWrap, { backgroundColor: cat.color + '18' }]}>
                <Ionicons name={cat.icon} size={24} color={cat.color} />
              </View>
              <Text style={styles.cardTitle}>{cat.title}</Text>
              <Text style={styles.cardDesc}>{cat.description}</Text>
              <View style={[styles.cardAccent, { backgroundColor: cat.color }]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── First Aid Facts ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>DID YOU KNOW?</Text>
          <Text style={styles.sectionTitle}>First Aid Facts</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.factsScroll}>
          {FIRST_AID_FACTS.map((item, idx) => (
            <View key={idx} style={styles.factCard}>
              <View style={[styles.factIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.factText}>{item.fact}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Tip ── */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={16} color="#f39c12" />
            <Text style={styles.tipTitle}>Quick Tip</Text>
          </View>
          <Text style={styles.tipText}>
            In any emergency, always <Text style={{ fontWeight: '700', color: '#c0392b' }}>call 911 first</Text> before attempting first aid.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── AI Assistant Modal ── */}
      <Modal visible={chatVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setChatVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <View style={styles.sheetHandle}>
            <View style={styles.sheetPill} />
            <TouchableOpacity onPress={() => setChatVisible(false)} style={styles.sheetClose}>
              <Ionicons name="close" size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView style={styles.chatScreenContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f5f6f8' },
  contentContainer: { paddingBottom: 20 },

  // ══════════════════════════════════════════
  // HEADER — no bubbles, same as GuestHomeScreen
  // ══════════════════════════════════════════
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

  // Brand
  hdrBrand:    { flexDirection: 'row', alignItems: 'center', gap: 11 },
  hdrLogoWrap: { position: 'relative' },
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
  hdrSub:   { fontSize: 15, color: 'rgba(255,255,255,0.75)', marginTop: 1, fontStyle: 'italic' },

  // Right buttons — transparent outlined + white pill (same as GuestHomeScreen)
  hdrAuthRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hdrProfileBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  hdrProfileText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  hdrLogoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: 18,
    backgroundColor: '#fff',
  },
  hdrLogoutText: { fontSize: 13, fontWeight: '700', color: '#e74c3c' },

  // ── Sections ──
  sectionHeader: { paddingHorizontal: 16, marginTop: 20, marginBottom: 12 },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: '#c0392b', letterSpacing: 1.5, marginBottom: 4 },
  sectionTitle:  { fontSize: 20, fontWeight: '800', color: '#1a1a2e' },

  // ── Tools Grid ──
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between', gap: 12 },
  toolCard:  { width: '47%', backgroundColor: '#fff', borderRadius: 13, padding: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  toolIcon:  { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  toolTitle: { fontSize: 13, fontWeight: '700', color: '#1a1a2e', marginBottom: 3 },
  toolSub:   { fontSize: 11, color: '#888', lineHeight: 15 },

  // ── Emergency Card ──
  emergencyCard:           { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.09, shadowRadius: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  emergencyCardHeader:     { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fef5f5', paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#fce8e8' },
  emergencyCardHeaderText: { fontSize: 11, color: '#c0392b', fontWeight: '700', letterSpacing: 0.4 },
  emergencyRow:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 14 },
  emergencyDivider:        { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 },
  emergencyRowIcon911:     { width: 46, height: 46, borderRadius: 13, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center' },
  emergencyRowIconSMS:     { width: 46, height: 46, borderRadius: 13, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center' },
  emergencyRowText:        { flex: 1 },
  emergencyRowTitle:       { fontSize: 15, fontWeight: '800', color: '#1a1a2e' },
  emergencyRowSub:         { fontSize: 11, color: '#999', marginTop: 2 },
  emergencyBadge:          { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  emergencyBadgeText:      { fontSize: 11, fontWeight: '800', color: '#555', letterSpacing: 0.5 },

  // ── Categories Grid ──
  grid:         { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between', marginTop: 4 },
  card:         { width: '48%', backgroundColor: '#fff', borderRadius: 13, padding: 15, overflow: 'hidden', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardIconWrap: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 9 },
  cardTitle:    { fontSize: 14, fontWeight: '800', color: '#1a1a2e', marginBottom: 3 },
  cardDesc:     { fontSize: 11, color: '#888', lineHeight: 15 },
  cardAccent:   { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 },

  // ── Facts Carousel ──
  factsScroll: { paddingHorizontal: 16, gap: 12 },
  factCard:    { width: 190, backgroundColor: '#fff', borderRadius: 13, padding: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  factIcon:    { width: 40, height: 40, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginBottom: 9 },
  factText:    { fontSize: 12, color: '#444', lineHeight: 18 },

  // ── Tip ──
  tipCard:   { margin: 16, marginTop: 20, backgroundColor: '#fffbf0', borderRadius: 13, padding: 15, borderLeftWidth: 4, borderLeftColor: '#f39c12' },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 },
  tipTitle:  { fontSize: 14, fontWeight: '700', color: '#856404' },
  tipText:   { fontSize: 13, color: '#856404', lineHeight: 19 },

  // ── AI Chat Modal ──
  sheetHandle:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 10, paddingBottom: 6, paddingHorizontal: 16, backgroundColor: '#f5f5f5' },
  sheetPill:    { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#ddd', maxWidth: 40, alignSelf: 'center' },
  sheetClose:   { position: 'absolute', right: 14, top: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: '#ececec', justifyContent: 'center', alignItems: 'center' },

  chatScreenContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  quickContainer:      { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  quickBtn:            { backgroundColor: '#ffe6e6', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#ffb3b3' },
  quickText:           { color: '#e74c3c', fontSize: 13, fontWeight: '500' },
  messageList:         { padding: 15 },
  messageBubble:       { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  botBubble:           { justifyContent: 'flex-start' },
  userBubble:          { justifyContent: 'flex-end' },
  botAvatar:           { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  messageContent:      { maxWidth: '78%', borderRadius: 16, padding: 12 },
  botContent:          { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1 },
  userContent:         { backgroundColor: '#e74c3c', borderBottomRightRadius: 4 },
  messageText:         { fontSize: 14, lineHeight: 22 },
  botText:             { color: '#333' },
  userText:            { color: '#fff' },
  typingIndicator:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8 },
  typingText:          { color: '#999', fontSize: 13, marginLeft: 8 },
  inputContainer:      { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff', padding: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  input:               { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, color: '#333', backgroundColor: '#f9f9f9' },
  sendBtn:             { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
});