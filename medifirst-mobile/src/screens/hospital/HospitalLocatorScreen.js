import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Linking, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const MOCK_HOSPITALS = [
  { id: 1, name: 'Cebu Doctors University Hospital', address: 'Osmeña Blvd, Cebu City', phone: '032-255-5555', lat: 10.3157, lng: 123.8854, distance: 1.2, type: 'Tertiary' },
  { id: 2, name: 'Chong Hua Hospital', address: 'Fuente Osmeña, Cebu City', phone: '032-255-8000', lat: 10.3110, lng: 123.8926, distance: 1.8, type: 'Private' },
  { id: 3, name: 'Vicente Sotto Memorial Medical Center', address: 'B. Rodriguez St, Cebu City', phone: '032-253-9891', lat: 10.3012, lng: 123.8950, distance: 2.3, type: 'Government' },
  { id: 4, name: 'Perpetual Succour Hospital', address: 'Gorordo Ave, Cebu City', phone: '032-233-8620', lat: 10.3290, lng: 123.9058, distance: 3.1, type: 'Private' },
  { id: 5, name: 'Cebu South Medical Center', address: 'South Road Properties, Cebu City', phone: '032-888-2000', lat: 10.2784, lng: 123.8653, distance: 3.7, type: 'Government' },
];

const APP_RESOURCES = [
  { title: 'First Aid Guides',    sub: 'Step-by-step guides for CPR, choking, burns & more', icon: 'medical',       color: '#e74c3c', bg: '#fdecea', onPress: (nav) => nav.navigate('Guides', { screen: 'GuidesList' }) },
  { title: 'AI First Aid Chatbot',sub: 'Get instant answers to any first aid question',        icon: 'chatbubbles',   color: '#16a085', bg: '#e8f8f5', onPress: (nav) => nav.navigate('Chatbot') },
  { title: 'Emergency Contacts',  sub: 'Manage your personal emergency contact list',          icon: 'people',        color: '#2980b9', bg: '#e8f4fb', onPress: (nav) => nav.navigate('Emergency') },
  { title: 'Medical Profile',     sub: 'Your blood type, allergies, and medical history',      icon: 'person-circle', color: '#8e44ad', bg: '#f5eef8', onPress: (nav) => nav.navigate('Profile') },
  { title: 'Instructional Videos',sub: 'Watch first aid tutorials and demonstrations',         icon: 'play-circle',   color: '#d35400', bg: '#fef5ec', onPress: (nav) => nav.navigate('Guides', { screen: 'Videos' }) },
];

const TYPE_COLORS = {
  Tertiary:   { bg: '#e8f4fb', text: '#2980b9' },
  Private:    { bg: '#f5eef8', text: '#8e44ad' },
  Government: { bg: '#e9f7ef', text: '#27ae60' },
};

export default function HospitalLocatorScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [hospitals]             = useState(MOCK_HOSPITALS);

  useEffect(() => { getLocation(); }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to find nearby hospitals.');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch {
      Alert.alert('Error', 'Could not get your location.');
    } finally { setLoading(false); }
  };

  const callHospital    = (phone, name) => Alert.alert(`Call ${name}`, `Dial ${phone}?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Call Now', style: 'destructive', onPress: () => Linking.openURL(`tel:${phone}`) }]);
  const getDirections   = (lat, lng, name) => Alert.alert(`Directions to ${name}`, 'This will open Google Maps.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Maps', onPress: () => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`) }]);
  const openInGoogleMaps = () => {
    if (location) Linking.openURL(`https://www.google.com/maps/search/hospitals/@${location.latitude},${location.longitude},15z`);
    else Alert.alert('Location Required', 'Please enable location to view map.');
  };
  const safeNavigate = (fn) => { try { fn(navigation); } catch (e) { console.warn(e); } };

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingIcon}><Ionicons name="medical" size={32} color="#e74c3c" /></View>
        <ActivityIndicator size="large" color="#e74c3c" style={{ marginTop: 16 }} />
        <Text style={styles.loadingTitle}>Finding Nearby Hospitals</Text>
        <Text style={styles.loadingSubtitle}>Accessing your location…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

      {/* ══════════════════════════════════════════════════════════
          HEADER — same compact design as UserHomeScreen
          Left: logo icon + "MediFirst" title + subtitle
          Right: location status pill
      ══════════════════════════════════════════════════════════ */}
      <View style={styles.header}>
        {/* Decorative bubbles */}
        <View style={styles.hdrBubble1} />
        <View style={styles.hdrBubble2} />

        <View style={styles.hdrInner}>
          {/* Left: logo + brand */}
          <View style={styles.hdrBrand}>
            <View style={styles.hdrLogoWrap}>
              <View style={styles.hdrLogo}>
                <Ionicons name="medical" size={22} color="#fff" />
              </View>
              <View style={styles.hdrPulseDot} />
            </View>
            <View>
              <Text style={styles.hdrTitle}>Hospital Locator</Text>
              <Text style={styles.hdrSub}>Find emergency care near you</Text>
            </View>
          </View>

          {/* Right: GPS status badge */}
          <View style={[styles.hdrBadge, { backgroundColor: location ? 'rgba(46,204,113,0.22)' : 'rgba(255,255,255,0.18)' }]}>
            <View style={[styles.hdrBadgeDot, { backgroundColor: location ? '#2ecc71' : '#f39c12' }]} />
            <Text style={styles.hdrBadgeText}>{location ? 'GPS On' : 'No GPS'}</Text>
          </View>
        </View>

        {/* Stats row — same frosted pill as ProfileScreen */}
        <View style={styles.statsRow}>
          {[
            { num: hospitals.length, label: 'Hospitals' },
            { num: '24/7',           label: 'Available' },
            { num: '3',              label: 'Types'     },
            { num: 'Free',           label: 'Service'   },
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

      {/* ── Open in Maps CTA ── */}
      <TouchableOpacity style={styles.mapBtn} onPress={openInGoogleMaps} activeOpacity={0.85}>
        <View style={styles.mapBtnLeft}>
          <Ionicons name="map" size={22} color="#fff" />
        </View>
        <View style={styles.mapBtnBody}>
          <Text style={styles.mapBtnTitle}>View on Google Maps</Text>
          <Text style={styles.mapBtnSub}>Search all hospitals near your location</Text>
        </View>
        <Ionicons name="open-outline" size={18} color="rgba(255,255,255,0.8)" style={{ marginRight: 14 }} />
      </TouchableOpacity>

      {/* ── Location Status ── */}
      <View style={styles.locationStatus}>
        <View style={[styles.locationDot, { backgroundColor: location ? '#27ae60' : '#e74c3c' }]} />
        <Text style={styles.locationStatusText}>
          {location
            ? `GPS Active — Showing ${hospitals.length} hospitals sorted by distance`
            : 'Location unavailable — Showing default results'}
        </Text>
      </View>

      {/* ── Hospitals ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>NEARBY FACILITIES</Text>
        <Text style={styles.sectionTitle}>Hospitals Near You</Text>
      </View>

      {hospitals.map((item) => {
        const typeStyle = TYPE_COLORS[item.type] || { bg: '#f0f0f0', text: '#666' };
        return (
          <View key={item.id} style={styles.hospitalCard}>
            <View style={styles.hospitalCardHeader}>
              <View style={styles.hospitalIconWrap}>
                <Ionicons name="medical" size={22} color="#fff" />
              </View>
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.hospitalMeta}>
                  <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
                    <Text style={[styles.typeBadgeText, { color: typeStyle.text }]}>{item.type}</Text>
                  </View>
                  <View style={styles.distanceBadge}>
                    <Ionicons name="location" size={11} color="#e74c3c" />
                    <Text style={styles.distanceText}>{item.distance} km away</Text>
                  </View>
                </View>
                <Text style={styles.hospitalAddress}>{item.address}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.hospitalActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => callHospital(item.phone, item.name)} activeOpacity={0.8}>
                <View style={[styles.actionBtnIcon, { backgroundColor: '#e9f7ef' }]}>
                  <Ionicons name="call" size={18} color="#27ae60" />
                </View>
                <Text style={[styles.actionBtnText, { color: '#27ae60' }]}>Call</Text>
              </TouchableOpacity>
              <View style={styles.actionDivider} />
              <TouchableOpacity style={styles.actionBtn} onPress={() => getDirections(item.lat, item.lng, item.name)} activeOpacity={0.8}>
                <View style={[styles.actionBtnIcon, { backgroundColor: '#e8f4fb' }]}>
                  <Ionicons name="navigate" size={18} color="#2980b9" />
                </View>
                <Text style={[styles.actionBtnText, { color: '#2980b9' }]}>Directions</Text>
              </TouchableOpacity>
              <View style={styles.actionDivider} />
              <TouchableOpacity style={styles.actionBtn} onPress={() => callHospital(item.phone, item.name)} activeOpacity={0.8}>
                <View style={[styles.actionBtnIcon, { backgroundColor: '#f5eef8' }]}>
                  <Ionicons name="information-circle" size={18} color="#8e44ad" />
                </View>
                <Text style={[styles.actionBtnText, { color: '#8e44ad' }]}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* ── App Resources ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>APP RESOURCES</Text>
        <Text style={styles.sectionTitle}>More Tools for You</Text>
      </View>

      {APP_RESOURCES.map((r) => (
        <TouchableOpacity key={r.title} style={styles.resourceCard} onPress={() => safeNavigate(r.onPress)} activeOpacity={0.8}>
          <View style={[styles.resourceIcon, { backgroundColor: r.bg }]}>
            <Ionicons name={r.icon} size={22} color={r.color} />
          </View>
          <View style={styles.resourceBody}>
            <Text style={styles.resourceTitle}>{r.title}</Text>
            <Text style={styles.resourceSub}>{r.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
      ))}

      {/* ── Disclaimer ── */}
      <View style={styles.disclaimer}>
        <Ionicons name="shield-checkmark" size={15} color="#aaa" />
        <Text style={styles.disclaimerText}>
          Hospital data is for reference only. In a life-threatening emergency, always call 911 immediately. MediFirst does not guarantee the accuracy or availability of listed facilities.
        </Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f5f6f8' },
  contentContainer: { paddingBottom: 20 },

  center:          { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6f8', padding: 30 },
  loadingIcon:     { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fdecea', justifyContent: 'center', alignItems: 'center' },
  loadingTitle:    { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginTop: 14 },
  loadingSubtitle: { fontSize: 13, color: '#888', marginTop: 6 },

  // ══════ HEADER — UserHomeScreen style ══════
  header: {
    backgroundColor: '#27ae60',   // green to distinguish from red screens
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 18,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#1e8449',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  hdrBubble1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.07)', top: -40, right: -40 },
  hdrBubble2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -25, left: -15 },

  hdrInner:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
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
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: '#e74c3c',
    borderWidth: 2, borderColor: '#27ae60',
  },
  hdrTitle: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  hdrSub:   { fontSize: 10, color: 'rgba(255,255,255,0.78)', fontStyle: 'italic', marginTop: 2 },

  hdrBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  hdrBadgeDot: { width: 7, height: 7, borderRadius: 4 },
  hdrBadgeText:{ fontSize: 11, fontWeight: '700', color: '#fff' },

  // Stats row — identical to ProfileScreen
  statsRow:    { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 17, fontWeight: '900', color: '#fff' },
  statLabel:   { fontSize: 9, color: 'rgba(255,255,255,0.78)', marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.25)' },

  // ── Map Button ──
  mapBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2980b9', marginHorizontal: 16, marginTop: 16, borderRadius: 14, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
  mapBtnLeft:  { width: 56, alignSelf: 'stretch', backgroundColor: '#1a5276', justifyContent: 'center', alignItems: 'center' },
  mapBtnBody:  { flex: 1, paddingVertical: 14, paddingHorizontal: 14 },
  mapBtnTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  mapBtnSub:   { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // ── Location Status ──
  locationStatus:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 12, backgroundColor: '#fff', borderRadius: 10, padding: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  locationDot:        { width: 9, height: 9, borderRadius: 5 },
  locationStatusText: { fontSize: 12, color: '#555', fontWeight: '500', flex: 1 },

  // ── Section Header ──
  sectionHeader: { paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: '#27ae60', letterSpacing: 1.5, marginBottom: 4 },
  sectionTitle:  { fontSize: 20, fontWeight: '800', color: '#1a1a2e' },

  // ── Hospital Cards ──
  hospitalCard:       { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, overflow: 'hidden' },
  hospitalCardHeader: { flexDirection: 'row', padding: 16, alignItems: 'flex-start' },
  hospitalIconWrap:   { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  hospitalInfo:       { flex: 1 },
  hospitalName:       { fontSize: 14, fontWeight: '800', color: '#1a1a2e', lineHeight: 20, marginBottom: 6 },
  hospitalMeta:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  typeBadge:          { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText:      { fontSize: 10, fontWeight: '700' },
  distanceBadge:      { flexDirection: 'row', alignItems: 'center', gap: 3 },
  distanceText:       { fontSize: 11, color: '#e74c3c', fontWeight: '600' },
  hospitalAddress:    { fontSize: 11, color: '#999', lineHeight: 16 },
  divider:            { height: 1, backgroundColor: '#f4f4f4', marginHorizontal: 16 },
  hospitalActions:    { flexDirection: 'row', paddingVertical: 4 },
  actionBtn:          { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 4 },
  actionBtnIcon:      { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  actionBtnText:      { fontSize: 11, fontWeight: '700' },
  actionDivider:      { width: 1, backgroundColor: '#f4f4f4', marginVertical: 8 },

  // ── App Resources ──
  resourceCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5 },
  resourceIcon:  { width: 48, height: 48, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  resourceBody:  { flex: 1 },
  resourceTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 3 },
  resourceSub:   { fontSize: 11, color: '#888', lineHeight: 16 },

  // ── Disclaimer ──
  disclaimer:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginHorizontal: 16, marginTop: 20, padding: 14, backgroundColor: '#f0f0f0', borderRadius: 12 },
  disclaimerText: { flex: 1, fontSize: 11, color: '#999', lineHeight: 17 },
});