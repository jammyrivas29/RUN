import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { logout } from '../../store/authSlice';
import api from '../../api/axiosConfig';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

const getRecommendations = (profile) => {
  const recs = [];
  const bt         = profile?.medicalProfile?.bloodType;
  const allergies  = profile?.medicalProfile?.allergies || [];
  const conditions = profile?.medicalProfile?.medicalConditions || [];

  if (!bt || bt === 'Unknown')
    recs.push({ icon: 'water', color: '#e74c3c', title: 'Know Your Blood Type', desc: 'Knowing your blood type is critical in emergencies.', urgency: 'high' });
  if (allergies.length === 0)
    recs.push({ icon: 'alert-circle', color: '#e67e22', title: 'Document Allergies', desc: 'Recording allergies ensures emergency responders provide safe treatment.', urgency: 'medium' });
  if (conditions.some(c => c.toLowerCase().includes('diabetes')))
    recs.push({ icon: 'fitness', color: '#2980b9', title: 'Diabetes First Aid Kit', desc: 'Keep glucose tablets, glucagon, and your medical ID accessible.', urgency: 'high' });
  if (conditions.some(c => c.toLowerCase().includes('hypertension') || c.toLowerCase().includes('blood pressure')))
    recs.push({ icon: 'heart', color: '#e74c3c', title: 'Hypertension Awareness', desc: 'Learn to recognize hypertensive crisis: severe headache, chest pain, blurred vision.', urgency: 'high' });
  if (conditions.some(c => c.toLowerCase().includes('asthma')))
    recs.push({ icon: 'medical', color: '#8e44ad', title: 'Asthma Action Plan', desc: 'Always carry your inhaler. Learn triggers and have a written action plan.', urgency: 'high' });
  if (conditions.some(c => c.toLowerCase().includes('heart')))
    recs.push({ icon: 'pulse', color: '#e74c3c', title: 'Cardiac Emergency Prep', desc: 'Inform household members of your condition. Keep nitroglycerin accessible.', urgency: 'high' });
  if (allergies.some(a => ['peanut', 'bee', 'shellfish'].some(k => a.toLowerCase().includes(k))))
    recs.push({ icon: 'warning', color: '#c0392b', title: 'Carry an EpiPen', desc: 'Severe allergies can cause anaphylaxis. Always have an epinephrine auto-injector.', urgency: 'critical' });

  recs.push({ icon: 'people', color: '#27ae60', title: 'Add Emergency Contacts', desc: 'Ensure at least 2–3 emergency contacts are saved for responders.', urgency: 'medium' });
  recs.push({ icon: 'book',   color: '#2980b9', title: 'Learn CPR', desc: 'CPR is the most important life-saving skill. Take a certified course.', urgency: 'medium' });

  return recs.slice(0, 5);
};

const URGENCY_COLORS = { critical: '#e74c3c', high: '#e67e22', medium: '#2980b9', low: '#27ae60' };
const URGENCY_BG     = { critical: '#fdecea', high: '#fef5ec', medium: '#e8f4fb', low: '#e9f7ef' };

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const userId   = user?._id || user?.id || 'guest';

  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [editing, setEditing]       = useState(false);
  const [bloodType, setBloodType]   = useState('Unknown');
  const [allergies, setAllergies]   = useState('');
  const [conditions, setConditions] = useState('');
  const [saving, setSaving]         = useState(false);
  const [activeTab, setActiveTab]   = useState('profile');
  const [callHistory, setCallHistory] = useState([]);

  const CALL_HISTORY_KEY = `medifirst_call_history_${userId}`;

  useEffect(() => { fetchProfile(); }, []);

  useFocusEffect(useCallback(() => { loadCallHistory(); }, [userId]));

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      setProfile(res.data.user);
      setBloodType(res.data.user.medicalProfile?.bloodType || 'Unknown');
      setAllergies((res.data.user.medicalProfile?.allergies || []).join(', '));
      setConditions((res.data.user.medicalProfile?.medicalConditions || []).join(', '));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadCallHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem(CALL_HISTORY_KEY);
      if (raw) setCallHistory(JSON.parse(raw));
    } catch (_) {}
  };

  const logCall = async (number, label) => {
    const entry   = { number, label, timestamp: new Date().toISOString(), id: Date.now().toString() };
    const updated = [entry, ...callHistory].slice(0, 50);
    setCallHistory(updated);
    try { await AsyncStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(updated)); } catch (_) {}
    Linking.openURL(`tel:${number}`);
  };

  const clearCallHistory = () => {
    Alert.alert('Clear History', 'Remove all call history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        setCallHistory([]);
        await AsyncStorage.removeItem(CALL_HISTORY_KEY);
      }},
    ]);
  };

  const saveMedicalProfile = async () => {
    try {
      setSaving(true);
      await api.put('/user/medical-profile', {
        bloodType,
        allergies:         allergies.split(',').map(a => a.trim()).filter(Boolean),
        medicalConditions: conditions.split(',').map(c => c.trim()).filter(Boolean),
      });
      await fetchProfile();
      setEditing(false);
      Alert.alert('✅ Saved', 'Medical profile updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally { setSaving(false); }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#e74c3c" />
      <Text style={styles.loadingText}>Loading profile…</Text>
    </View>
  );

  const recommendations = getRecommendations(profile);
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <View style={styles.root}>

      {/* ══════════════════════════════════
          HEADER — matches app-wide design
      ══════════════════════════════════ */}
      <View style={styles.header}>

        {/* Top row: logo brand + sign out */}
        <View style={styles.hdrTop}>
          <View style={styles.hdrBrand}>
            <View style={styles.hdrLogoWrap}>
              <View style={styles.hdrLogo}>
                <Ionicons name="medical" size={20} color="#fff" />
              </View>
              <View style={styles.hdrPulseDot} />
            </View>
            <View>
              <Text style={styles.hdrTitle}>MediFirst</Text>
              <Text style={styles.hdrSub}>My Profile</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.hdrSignOutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={13} color="#e74c3c" />
            <Text style={styles.hdrSignOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.hdrDivider} />

        {/* User info row */}
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={11} color="#fff" />
              <Text style={styles.verifiedText}>Verified Member</Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { num: callHistory.length, label: 'Calls Made' },
            { num: recommendations.length, label: 'Health Tips' },
            { num: profile?.medicalProfile?.allergies?.length || 0, label: 'Allergies' },
            { num: profile?.medicalProfile?.medicalConditions?.length || 0, label: 'Conditions' },
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

      {/* ── Tab Bar ── */}
      <View style={styles.tabBar}>
        {[
          { key: 'profile',  label: 'Medical',  icon: 'medical' },
          { key: 'contacts', label: 'Contacts', icon: 'people'  },
          { key: 'history',  label: 'History',  icon: 'time'    },
          { key: 'tips',     label: 'Tips',     icon: 'bulb'    },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? '#e74c3c' : '#bbb'} />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── TAB 1: MEDICAL ── */}
        {activeTab === 'profile' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWrap}>
                <Ionicons name="medical" size={18} color="#e74c3c" />
                <Text style={styles.sectionTitle}>Medical Profile</Text>
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(!editing)}>
                <Ionicons name={editing ? 'close' : 'pencil'} size={15} color={editing ? '#e74c3c' : '#666'} />
                <Text style={[styles.editBtnText, editing && { color: '#e74c3c' }]}>{editing ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Blood Type</Text>
              {editing ? (
                <View style={styles.bloodTypeGrid}>
                  {BLOOD_TYPES.map(bt => (
                    <TouchableOpacity
                      key={bt}
                      style={[styles.bloodTypeBtn, bloodType === bt && styles.bloodTypeBtnActive]}
                      onPress={() => setBloodType(bt)}
                    >
                      <Text style={[styles.bloodTypeBtnText, bloodType === bt && styles.bloodTypeBtnTextActive]}>{bt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.bloodTypeBadge}>
                  <Ionicons name="water" size={14} color="#e74c3c" />
                  <Text style={styles.bloodTypeBadgeText}>{profile?.medicalProfile?.bloodType || 'Not set'}</Text>
                </View>
              )}
            </View>

            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Allergies</Text>
              {editing ? (
                <TextInput style={styles.input} value={allergies} onChangeText={setAllergies}
                  placeholder="e.g. Peanuts, Penicillin (comma separated)" placeholderTextColor="#bbb" multiline />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile?.medicalProfile?.allergies?.length
                    ? profile.medicalProfile.allergies.join(' • ')
                    : <Text style={styles.notSet}>None listed</Text>}
                </Text>
              )}
            </View>

            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Medical Conditions</Text>
              {editing ? (
                <TextInput style={styles.input} value={conditions} onChangeText={setConditions}
                  placeholder="e.g. Diabetes, Hypertension (comma separated)" placeholderTextColor="#bbb" multiline />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile?.medicalProfile?.medicalConditions?.length
                    ? profile.medicalProfile.medicalConditions.join(' • ')
                    : <Text style={styles.notSet}>None listed</Text>}
                </Text>
              )}
            </View>

            {editing && (
              <TouchableOpacity style={styles.saveBtn} onPress={saveMedicalProfile} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : (
                  <><Ionicons name="checkmark" size={17} color="#fff" /><Text style={styles.saveBtnText}>Save Medical Profile</Text></>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── TAB 2: CONTACTS ── */}
        {activeTab === 'contacts' && <EmergencyContactsTab logCall={logCall} />}

        {/* ── TAB 3: HISTORY ── */}
        {activeTab === 'history' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWrap}>
                <Ionicons name="time" size={18} color="#8e44ad" />
                <Text style={styles.sectionTitle}>Call History</Text>
              </View>
              {callHistory.length > 0 && (
                <TouchableOpacity onPress={clearCallHistory} style={styles.clearHistBtn}>
                  <Ionicons name="trash-outline" size={13} color="#e74c3c" />
                  <Text style={styles.clearHistText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            {callHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="call-outline" size={52} color="#e0e0e0" />
                <Text style={styles.emptyTitle}>No Call History</Text>
                <Text style={styles.emptyDesc}>Calls made from this app will appear here.</Text>
              </View>
            ) : callHistory.map((entry) => (
              <View key={entry.id} style={styles.historyItem}>
                <View style={styles.historyIconWrap}>
                  <Ionicons name="call" size={18} color="#8e44ad" />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyLabel}>{entry.label}</Text>
                  <Text style={styles.historyNumber}>{entry.number}</Text>
                  <Text style={styles.historyTime}>{formatDate(entry.timestamp)}</Text>
                </View>
                <TouchableOpacity style={styles.historyCallBtn} onPress={() => logCall(entry.number, entry.label)}>
                  <Ionicons name="call" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ── TAB 4: HEALTH TIPS ── */}
        {activeTab === 'tips' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWrap}>
                <Ionicons name="bulb" size={18} color="#f39c12" />
                <Text style={styles.sectionTitle}>Health Recommendations</Text>
              </View>
            </View>
            <Text style={styles.tipsSubtitle}>Personalized based on your medical profile</Text>
            {recommendations.map((rec, idx) => (
              <View key={idx} style={[styles.recCard, { backgroundColor: URGENCY_BG[rec.urgency] || '#f9f9f9', borderLeftColor: URGENCY_COLORS[rec.urgency] || '#ccc' }]}>
                <View style={styles.recHeader}>
                  <View style={[styles.recIconWrap, { backgroundColor: URGENCY_COLORS[rec.urgency] + '22' }]}>
                    <Ionicons name={rec.icon} size={20} color={URGENCY_COLORS[rec.urgency]} />
                  </View>
                  <View style={styles.recTitleWrap}>
                    <Text style={styles.recTitle}>{rec.title}</Text>
                    <View style={[styles.recUrgencyBadge, { backgroundColor: URGENCY_COLORS[rec.urgency] }]}>
                      <Text style={styles.recUrgencyText}>{rec.urgency?.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.recDesc}>{rec.desc}</Text>
              </View>
            ))}
            <View style={styles.safetyCard}>
              <Text style={styles.safetyTitle}>🛡️ General Safety Reminders</Text>
              {[
                'Always call 911 first in a life-threatening emergency.',
                'Keep a first aid kit at home, in your car, and at work.',
                'Inform household members of your medical conditions.',
                'Renew your first aid training every 2 years.',
                'Know the location of the nearest emergency department.',
              ].map((tip, i) => (
                <View key={i} style={styles.safetyRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#27ae60" />
                  <Text style={styles.safetyTip}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Emergency Contacts Tab ────────────────────────────────────────────────────
function EmergencyContactsTab({ logCall }) {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: '', relationship: '', phoneNumber: '' });
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/user/emergency-contacts');
      setContacts(res.data.contacts || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addContact = async () => {
    if (!form.name.trim() || !form.relationship.trim() || !form.phoneNumber.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    try {
      setSaving(true);
      await api.post('/user/emergency-contacts', form);
      await fetchContacts();
      setForm({ name: '', relationship: '', phoneNumber: '' });
      setShowForm(false);
    } catch { Alert.alert('Error', 'Failed to add contact.'); }
    finally { setSaving(false); }
  };

  const deleteContact = (id, name) => {
    Alert.alert('Remove Contact', `Remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await api.delete(`/user/emergency-contacts/${id}`);
        fetchContacts();
      }},
    ]);
  };

  const RELATION_COLORS = {
    mom: '#e74c3c', dad: '#e74c3c', mother: '#e74c3c', father: '#e74c3c',
    spouse: '#8e44ad', wife: '#8e44ad', husband: '#8e44ad',
    friend: '#2980b9', sibling: '#27ae60', brother: '#27ae60', sister: '#27ae60',
  };
  const getInitials    = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const getAvatarColor = (rel)  => RELATION_COLORS[rel?.toLowerCase()] || '#e74c3c';

  if (loading) return <View style={styles.center}><ActivityIndicator size="small" color="#e74c3c" /></View>;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Ionicons name="people" size={18} color="#2980b9" />
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        </View>
        <TouchableOpacity style={styles.addContactBtn} onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? 'close' : 'add'} size={17} color="#fff" />
          <Text style={styles.addContactBtnText}>{showForm ? 'Cancel' : 'Add'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>New Emergency Contact</Text>
          <TextInput style={styles.input} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="Full Name *" placeholderTextColor="#bbb" />
          <TextInput style={styles.input} value={form.relationship} onChangeText={v => setForm({ ...form, relationship: v })} placeholder="Relationship (e.g. Mom, Spouse) *" placeholderTextColor="#bbb" />
          <TextInput style={styles.input} value={form.phoneNumber} onChangeText={v => setForm({ ...form, phoneNumber: v })} placeholder="Phone Number *" keyboardType="phone-pad" placeholderTextColor="#bbb" />
          <TouchableOpacity style={styles.saveBtn} onPress={addContact} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color="#fff" /> : (
              <><Ionicons name="person-add" size={15} color="#fff" /><Text style={styles.saveBtnText}>Add Contact</Text></>
            )}
          </TouchableOpacity>
        </View>
      )}

      {contacts.length === 0 && !showForm ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={52} color="#e0e0e0" />
          <Text style={styles.emptyTitle}>No Contacts Yet</Text>
          <Text style={styles.emptyDesc}>Add emergency contacts so responders can reach your family.</Text>
          <TouchableOpacity style={[styles.saveBtn, { marginTop: 16 }]} onPress={() => setShowForm(true)}>
            <Ionicons name="add" size={15} color="#fff" />
            <Text style={styles.saveBtnText}>Add First Contact</Text>
          </TouchableOpacity>
        </View>
      ) : contacts.map((contact) => (
        <View key={contact._id} style={styles.contactCard}>
          <View style={[styles.contactAvatar, { backgroundColor: getAvatarColor(contact.relationship) }]}>
            <Text style={styles.contactAvatarText}>{getInitials(contact.name)}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <View style={styles.contactRelWrap}>
              <Ionicons name="heart-outline" size={11} color="#bbb" />
              <Text style={styles.contactRel}>{contact.relationship}</Text>
            </View>
            <View style={styles.contactPhoneWrap}>
              <Ionicons name="call-outline" size={11} color="#e74c3c" />
              <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
            </View>
          </View>
          <View style={styles.contactActions}>
            <TouchableOpacity style={styles.callBtn} onPress={() => logCall(contact.phoneNumber, contact.name)}>
              <Ionicons name="call" size={15} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteContact(contact._id, contact.name)}>
              <Ionicons name="trash-outline" size={15} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#f5f6f8' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  loadingText: { marginTop: 10, color: '#666', fontSize: 14 },

  // ══════════════════════════════════
  // HEADER
  // ══════════════════════════════════
  header: {
    backgroundColor: '#e74c3c',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 18,
    elevation: 6,
    shadowColor: '#c0392b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },

  // Top row — brand + sign out (same as UserHomeScreen)
  hdrTop:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  hdrBrand:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hdrLogoWrap: { position: 'relative' },
  hdrLogo: {
    width: 40, height: 40, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  hdrPulseDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#2ecc71',
    borderWidth: 2, borderColor: '#e74c3c',
  },
  hdrTitle: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  hdrSub:   { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', marginTop: 1 },
  hdrSignOutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: '#fff',
  },
  hdrSignOutText: { fontSize: 12, fontWeight: '700', color: '#e74c3c' },

  // Subtle divider between brand and user info
  hdrDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 14 },

  // User info
  userRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar:     { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { fontSize: 20, fontWeight: '900', color: '#fff' },
  userInfo:   { flex: 1 },
  userName:   { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 2 },
  userEmail:  { fontSize: 12, color: 'rgba(255,255,255,0.78)', marginBottom: 6 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  verifiedText:  { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Stats
  statsRow:    { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 18, fontWeight: '900', color: '#fff' },
  statLabel:   { fontSize: 9, color: 'rgba(255,255,255,0.78)', marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, height: 26, backgroundColor: 'rgba(255,255,255,0.25)' },

  // ── Tab Bar ──
  tabBar:       { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', elevation: 2 },
  tab:          { flex: 1, alignItems: 'center', paddingVertical: 11, gap: 3, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:    { borderBottomColor: '#e74c3c' },
  tabLabel:     { fontSize: 10, fontWeight: '600', color: '#bbb' },
  tabLabelActive:{ color: '#e74c3c', fontWeight: '800' },

  scroll:        { flex: 1 },
  scrollContent: { padding: 16 },

  // ── Section ──
  section:          { marginBottom: 16 },
  sectionHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle:     { fontSize: 17, fontWeight: '800', color: '#1a1a2e' },
  editBtn:          { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#f5f5f5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  editBtnText:      { fontSize: 12, fontWeight: '600', color: '#666' },

  // ── Field Cards ──
  fieldCard:  { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: '#aaa', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  fieldValue: { fontSize: 15, color: '#333', lineHeight: 22 },
  notSet:     { color: '#ccc', fontStyle: 'italic' },

  bloodTypeGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bloodTypeBtn:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e0e0e0' },
  bloodTypeBtnActive:    { borderColor: '#e74c3c', backgroundColor: '#fdecea' },
  bloodTypeBtnText:      { fontSize: 13, fontWeight: '600', color: '#888' },
  bloodTypeBtnTextActive:{ color: '#e74c3c', fontWeight: '800' },
  bloodTypeBadge:        { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fdecea', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  bloodTypeBadgeText:    { color: '#e74c3c', fontWeight: '800', fontSize: 16 },

  input:      { borderWidth: 1.5, borderColor: '#e8e8e8', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#333', backgroundColor: '#fafafa', marginBottom: 10 },
  saveBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#e74c3c', padding: 14, borderRadius: 12, marginTop: 4 },
  saveBtnText:{ color: '#fff', fontWeight: '800', fontSize: 15 },

  // ── Contacts ──
  addContactBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#e74c3c', paddingHorizontal: 13, paddingVertical: 6, borderRadius: 20 },
  addContactBtnText:{ color: '#fff', fontSize: 12, fontWeight: '700' },
  formCard:         { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 14, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#2980b9' },
  formTitle:        { fontSize: 15, fontWeight: '800', color: '#1a1a2e', marginBottom: 14 },
  contactCard:      { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  contactAvatar:    { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  contactAvatarText:{ color: '#fff', fontWeight: '900', fontSize: 15 },
  contactInfo:      { flex: 1 },
  contactName:      { fontSize: 15, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  contactRelWrap:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  contactRel:       { fontSize: 12, color: '#999' },
  contactPhoneWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactPhone:     { fontSize: 13, color: '#e74c3c', fontWeight: '700' },
  contactActions:   { gap: 8 },
  callBtn:          { width: 34, height: 34, borderRadius: 17, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center' },
  deleteBtn:        { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fdecea', justifyContent: 'center', alignItems: 'center' },

  // ── History ──
  clearHistBtn:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fdecea', borderRadius: 20 },
  clearHistText:  { color: '#e74c3c', fontSize: 12, fontWeight: '700' },
  historyItem:    { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, alignItems: 'center', elevation: 1 },
  historyIconWrap:{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5eef8', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  historyInfo:    { flex: 1 },
  historyLabel:   { fontSize: 14, fontWeight: '700', color: '#333' },
  historyNumber:  { fontSize: 13, color: '#8e44ad', fontWeight: '600', marginVertical: 2 },
  historyTime:    { fontSize: 11, color: '#aaa' },
  historyCallBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#8e44ad', justifyContent: 'center', alignItems: 'center' },

  // ── Tips ──
  tipsSubtitle:   { fontSize: 13, color: '#888', marginBottom: 16, fontStyle: 'italic' },
  recCard:        { borderRadius: 14, padding: 16, marginBottom: 12, borderLeftWidth: 4 },
  recHeader:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  recIconWrap:    { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  recTitleWrap:   { flex: 1, gap: 4 },
  recTitle:       { fontSize: 14, fontWeight: '800', color: '#1a1a2e' },
  recUrgencyBadge:{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  recUrgencyText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  recDesc:        { fontSize: 13, color: '#555', lineHeight: 20 },
  safetyCard:     { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginTop: 4, elevation: 1 },
  safetyTitle:    { fontSize: 15, fontWeight: '800', color: '#1a1a2e', marginBottom: 14 },
  safetyRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  safetyTip:      { flex: 1, fontSize: 13, color: '#555', lineHeight: 20 },

  // ── Empty states ──
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#ccc', marginTop: 12 },
  emptyDesc:  { fontSize: 13, color: '#aaa', textAlign: 'center', marginTop: 6, lineHeight: 20 },
});