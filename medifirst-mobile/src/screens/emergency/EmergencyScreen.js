import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const EMERGENCY_NUMBERS = [
  { title: 'Emergency Services',     number: '911',            sub: 'Police · Ambulance · Fire Department', icon: 'call',         color: '#e74c3c', bg: '#fdecea' },
  { title: 'Poison Control Center',  number: '1-800-222-1222', sub: 'Toxic substance exposure & overdose',  icon: 'medkit',       color: '#2980b9', bg: '#e8f4fb' },
  { title: 'Crisis & Suicide Line',  number: '988',            sub: 'Mental health & suicide prevention',   icon: 'heart-half',   color: '#8e44ad', bg: '#f5eef8' },
  { title: 'Disaster Distress Line', number: '1-800-985-5990', sub: 'Emotional support after disasters',    icon: 'alert-circle', color: '#d35400', bg: '#fef5ec' },
];

const RESOURCES = [
  { title: 'American Red Cross',      sub: 'Disaster relief & emergency assistance',   url: 'https://www.redcross.org',  icon: 'globe',   color: '#e74c3c', bg: '#fdecea' },
  { title: 'FEMA Emergency Mgmt.',    sub: 'Federal disaster preparedness & response', url: 'https://www.fema.gov',      icon: 'shield',  color: '#2980b9', bg: '#e8f4fb' },
  { title: 'CDC Emergency Prep.',     sub: 'Public health emergency guidelines',        url: 'https://emergency.cdc.gov', icon: 'fitness', color: '#27ae60', bg: '#e9f7ef' },
  { title: 'National Poison Control', sub: 'Poisoning prevention & treatment info',    url: 'https://www.poison.org',    icon: 'warning', color: '#f39c12', bg: '#fef9e7' },
];

const FIRST_AID_TIPS = [
  { icon: 'heart',   color: '#e74c3c', title: 'Cardiac Arrest / CPR', tip: 'Call 911. Give 30 compressions at 100–120/min, 2 rescue breaths. Use AED if available. Repeat until help arrives.' },
  { icon: 'warning', color: '#e67e22', title: 'Choking',              tip: 'Give 5 firm back blows between shoulder blades, then 5 abdominal thrusts (Heimlich). Repeat until cleared.' },
  { icon: 'bandage', color: '#c0392b', title: 'Severe Bleeding',      tip: 'Apply firm continuous pressure with a clean cloth. Do not remove. Elevate the limb if possible and call 911.' },
  { icon: 'flame',   color: '#f39c12', title: 'Burns',                tip: 'Cool under running water for 10–20 min. Do not use ice, butter, or creams. Cover loosely with a sterile bandage.' },
  { icon: 'pulse',   color: '#2980b9', title: 'Seizures',             tip: 'Clear hazards. Place on their side. Do not restrain or put anything in their mouth. Time the seizure.' },
  { icon: 'medkit',  color: '#8e44ad', title: 'Stroke',               tip: 'Call 911 immediately. Note when symptoms began. Do not give food or water. Use F.A.S.T. to identify symptoms.' },
  { icon: 'skull',   color: '#16a085', title: 'Poisoning',            tip: 'Call Poison Control (1-800-222-1222). Do not induce vomiting unless instructed. Note what was ingested.' },
];

export default function EmergencyScreen() {
  const [locating, setLocating] = useState(false);

  const callNumber = (number, title) => {
    Alert.alert(`📞 ${title}`, `Call ${number}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', style: 'destructive', onPress: () => Linking.openURL(`tel:${number}`) },
    ]);
  };

  const openResource = (url, title) => {
    Alert.alert(title, 'This will open an external website.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => Linking.openURL(url) },
    ]);
  };

  const shareLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Denied', 'Location access is required.'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      const msg = `🚨 EMERGENCY! I need help!\nMy location: ${mapsLink}\nLat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;
      const smsUrl = `sms:?body=${encodeURIComponent(msg)}`;
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) { await Linking.openURL(smsUrl); Alert.alert('Success', 'SMS app opened with your location!'); }
      else Alert.alert('Location Retrieved', `Your location:\n${mapsLink}`, [{ text: 'OK' }, { text: 'Open Maps', onPress: () => Linking.openURL(mapsLink) }]);
    } catch { Alert.alert('Error', 'Could not get location. Check your settings.'); }
    finally { setLocating(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

      {/* ══════════════════════════════════════════════════════════════
          HEADER — pixel-perfect match to ProfileScreen header
          Structure:
            paddingTop 52  (same as ProfileScreen)
            ① hdrTop   : logo + brand name  |  right badge
            ── hdrDivider ──
            ② userRow  : big icon (like avatar) + title + subtitle + live badge
            ③ statsRow : 4 stats in frosted pill (same component)
      ══════════════════════════════════════════════════════════════ */}
      <View style={styles.header}>

        {/* ① Top row — logo brand  |  EMERGENCY badge */}
        <View style={styles.hdrTop}>

          {/* Left: logo + brand (identical to ProfileScreen) */}
          <View style={styles.hdrBrand}>
            <View style={styles.hdrLogoWrap}>
              <View style={styles.hdrLogo}>
                <Ionicons name="medical" size={20} color="#fff" />
              </View>
              {/* Green pulse dot — same as ProfileScreen */}
              <View style={styles.hdrPulseDot} />
            </View>
            <View>
              <Text style={styles.hdrTitle}>MediFirst</Text>
              <Text style={styles.hdrSub}>Emergency Center</Text>
            </View>
          </View>

          {/* Right: badge (replaces ProfileScreen's Sign Out button) */}
          <View style={styles.hdrBadge}>
            <Ionicons name="warning" size={13} color="#e74c3c" />
            <Text style={styles.hdrBadgeText}>EMERGENCY</Text>
          </View>
        </View>

        {/* ── Divider (same as ProfileScreen hdrDivider) ── */}
        <View style={styles.hdrDivider} />

        {/* ② Info row — big circle icon + title/subtitle/badge
            Mirrors ProfileScreen's userRow:
              avatar  →  big warning/call icon circle
              userName →  "Emergency Center"
              userEmail → subtitle
              verifiedBadge → "Services Available 24/7" green dot badge  */}
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Ionicons name="call" size={26} color="#fff" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Emergency Center</Text>
            <Text style={styles.userEmail}>Quick access to critical services & guidance</Text>
            {/* verifiedBadge equivalent */}
            <View style={styles.verifiedBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.verifiedText}>Services Available 24 / 7</Text>
            </View>
          </View>
        </View>

        {/* ③ Stats row (identical style to ProfileScreen statsRow) */}
        <View style={styles.statsRow}>
          {[
            { num: '4',    label: 'Hotlines'  },
            { num: '7',    label: 'Protocols' },
            { num: '4',    label: 'Resources' },
            { num: '24/7', label: 'Available' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{s.num}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* ── Alert banner ── */}
      <View style={styles.alertBanner}>
        <Ionicons name="information-circle" size={16} color="#7d6608" />
        <Text style={styles.alertBannerText}>In any life-threatening situation, call 911 first. Do not delay professional help.</Text>
      </View>

      {/* ══════════════════════════════════════
          QUICK ACTIONS — unified card
      ══════════════════════════════════════ */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <Text style={styles.sectionTitle}>Immediate Response</Text>
      </View>

      <View style={styles.unifiedCard}>
        <View style={styles.cardHeaderStrip}>
          <Ionicons name="flash" size={14} color="#e74c3c" />
          <Text style={styles.cardHeaderText}>Tap to act immediately</Text>
        </View>

        <TouchableOpacity style={styles.cardRow} onPress={() => callNumber('911', 'Emergency Services')} activeOpacity={0.82}>
          <View style={[styles.rowIcon, { backgroundColor: '#e74c3c' }]}>
            <Ionicons name="call" size={22} color="#fff" />
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

        <TouchableOpacity style={styles.cardRow} onPress={shareLocation} disabled={locating} activeOpacity={0.82}>
          <View style={[styles.rowIcon, { backgroundColor: '#27ae60' }]}>
            <Ionicons name={locating ? 'hourglass-outline' : 'location'} size={22} color="#fff" />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{locating ? 'Getting Location…' : 'Send My Location'}</Text>
            <Text style={styles.rowSub}>SMS your GPS coordinates to contacts</Text>
          </View>
          <View style={[styles.rowBadge, { backgroundColor: '#e9f7ef' }]}>
            <Text style={styles.rowBadgeText}>SMS</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ══════════════════════════════════════
          EMERGENCY NUMBERS — unified card
      ══════════════════════════════════════ */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>EMERGENCY NUMBERS</Text>
        <Text style={styles.sectionTitle}>Call for Help</Text>
      </View>

      <View style={styles.unifiedCard}>
        {EMERGENCY_NUMBERS.map((e, idx) => (
          <React.Fragment key={e.number}>
            <TouchableOpacity style={styles.cardRow} onPress={() => callNumber(e.number, e.title)} activeOpacity={0.82}>
              <View style={[styles.rowIcon, { backgroundColor: e.bg }]}>
                <Ionicons name={e.icon} size={21} color={e.color} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{e.title}</Text>
                <Text style={[styles.rowNumber, { color: e.color }]}>{e.number}</Text>
                <Text style={styles.rowSub}>{e.sub}</Text>
              </View>
              <View style={[styles.rowIconBtn, { backgroundColor: e.bg }]}>
                <Ionicons name="call" size={15} color={e.color} />
              </View>
            </TouchableOpacity>
            {idx < EMERGENCY_NUMBERS.length - 1 && <View style={styles.cardDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* ══════════════════════════════════════
          FIRST AID — unified card
      ══════════════════════════════════════ */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>QUICK REFERENCE</Text>
        <Text style={styles.sectionTitle}>First Aid Protocols</Text>
      </View>

      <View style={styles.unifiedCard}>
        {FIRST_AID_TIPS.map((item, idx) => (
          <React.Fragment key={item.title}>
            <View style={styles.tipRow}>
              <View style={[styles.tipIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.tipBody}>
                <Text style={styles.tipTitle}>{item.title}</Text>
                <Text style={styles.tipText}>{item.tip}</Text>
              </View>
            </View>
            {idx < FIRST_AID_TIPS.length - 1 && <View style={styles.cardDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* ══════════════════════════════════════
          RESOURCES — unified card
      ══════════════════════════════════════ */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>RESOURCES</Text>
        <Text style={styles.sectionTitle}>Trusted Organizations</Text>
      </View>

      <View style={styles.unifiedCard}>
        {RESOURCES.map((r, idx) => (
          <React.Fragment key={r.title}>
            <TouchableOpacity style={styles.cardRow} onPress={() => openResource(r.url, r.title)} activeOpacity={0.82}>
              <View style={[styles.rowIcon, { backgroundColor: r.bg }]}>
                <Ionicons name={r.icon} size={20} color={r.color} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{r.title}</Text>
                <Text style={styles.rowSub}>{r.sub}</Text>
              </View>
              <Ionicons name="open-outline" size={16} color="#bbb" />
            </TouchableOpacity>
            {idx < RESOURCES.length - 1 && <View style={styles.cardDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* ── Disclaimer ── */}
      <View style={styles.disclaimer}>
        <Ionicons name="shield-checkmark" size={15} color="#aaa" />
        <Text style={styles.disclaimerText}>
          This app provides general first aid guidance only and is not a substitute for professional medical advice. Always seek qualified emergency assistance immediately.
        </Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f5f6f8' },
  contentContainer: { paddingBottom: 20 },

  // ══════════════════════════════════════════════════════════
  // HEADER — copy-paste of ProfileScreen header styles
  // Only changes: background colour (#c0392b instead of #e74c3c)
  //               avatar icon instead of initials text
  //               right button = badge instead of sign-out
  // ══════════════════════════════════════════════════════════
  header: {
    backgroundColor: '#c0392b',       // slightly deeper red for emergency
    paddingTop: 52,                    // same as ProfileScreen
    paddingHorizontal: 16,
    paddingBottom: 18,
    elevation: 6,
    shadowColor: '#c0392b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },

  // ① Top row
  hdrTop:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  hdrBrand:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hdrLogoWrap: { position: 'relative' },
  hdrLogo: {
    width: 40, height: 40, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  hdrPulseDot: {                        // identical to ProfileScreen
    position: 'absolute', bottom: -2, right: -2,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#2ecc71',
    borderWidth: 2, borderColor: '#c0392b',
  },
  hdrTitle: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  hdrSub:   { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', marginTop: 1 },

  // Right badge (replaces sign-out button)
  hdrBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
  hdrBadgeText: { fontSize: 12, fontWeight: '700', color: '#e74c3c' },

  // ── Divider — same as ProfileScreen ──
  hdrDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 14 },

  // ② Info row — mirrors ProfileScreen userRow exactly
  userRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: {                             // same size/style as ProfileScreen avatar
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  userInfo:  { flex: 1 },
  userName:  { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 2 },
  userEmail: { fontSize: 12, color: 'rgba(255,255,255,0.78)', marginBottom: 6 },
  verifiedBadge: {                      // same as ProfileScreen verifiedBadge
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  liveDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2ecc71' },
  verifiedText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // ③ Stats row — identical to ProfileScreen statsRow
  statsRow:    { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 18, fontWeight: '900', color: '#fff' },
  statLabel:   { fontSize: 9, color: 'rgba(255,255,255,0.78)', marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, height: 26, backgroundColor: 'rgba(255,255,255,0.25)' },

  // ── Alert banner ──
  alertBanner:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fef9e7', borderLeftWidth: 4, borderLeftColor: '#f39c12', marginHorizontal: 16, marginTop: 14, borderRadius: 10, padding: 12 },
  alertBannerText: { flex: 1, fontSize: 12, color: '#7d6608', lineHeight: 18, fontWeight: '500' },

  // ── Section headers ──
  sectionHeader: { paddingHorizontal: 16, marginTop: 22, marginBottom: 12 },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: '#c0392b', letterSpacing: 1.5, marginBottom: 4 },
  sectionTitle:  { fontSize: 20, fontWeight: '800', color: '#1a1a2e' },

  // ── Unified card ──
  unifiedCard:     { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  cardHeaderStrip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fef5f5', paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#fce8e8' },
  cardHeaderText:  { fontSize: 11, color: '#c0392b', fontWeight: '700', letterSpacing: 0.4 },
  cardRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 13 },
  cardDivider:     { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 },
  rowIcon:         { width: 46, height: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  rowText:         { flex: 1 },
  rowTitle:        { fontSize: 14, fontWeight: '800', color: '#1a1a2e' },
  rowNumber:       { fontSize: 17, fontWeight: '900', marginTop: 1, marginBottom: 2 },
  rowSub:          { fontSize: 11, color: '#999', lineHeight: 16 },
  rowBadge:        { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  rowBadgeText:    { fontSize: 11, fontWeight: '800', color: '#555', letterSpacing: 0.4 },
  rowIconBtn:      { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  // ── First aid tips ──
  tipRow:   { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 13, alignItems: 'flex-start' },
  tipIcon:  { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  tipBody:  { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  tipText:  { fontSize: 12, color: '#666', lineHeight: 18 },

  // ── Disclaimer ──
  disclaimer:     { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginHorizontal: 16, marginTop: 20, padding: 14, backgroundColor: '#f0f0f0', borderRadius: 12 },
  disclaimerText: { flex: 1, fontSize: 11, color: '#999', lineHeight: 17 },
});