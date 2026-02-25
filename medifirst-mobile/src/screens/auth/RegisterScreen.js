import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { registerUser, clearError } from '../../store/authSlice';

export default function RegisterScreen({ navigation }) {
  const dispatch           = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', phoneNumber: '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.'); return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.'); return;
    }
    if (form.password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return;
    }
    try {
      await dispatch(registerUser({
        firstName: form.firstName, lastName: form.lastName,
        email: form.email.trim(), password: form.password,
        phoneNumber: form.phoneNumber,
      })).unwrap();
    } catch (err) {
      Alert.alert('Registration Failed', err || 'Something went wrong.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ══════════════════════════════════════════
            HEADER
        ══════════════════════════════════════════ */}
        <View style={styles.header}>
          <View style={styles.hdrBubble1} />
          <View style={styles.hdrBubble2} />

          {/* Info row */}
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Ionicons name="person-add" size={26} color="#fff" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Create Account</Text>
              <Text style={styles.userEmail}>Join MediFirst — it's completely free</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={11} color="#fff" />
                <Text style={styles.verifiedText}>Free · Secure · No Ads</Text>
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { num: '100%', label: 'Free'     },
              { num: '24/7', label: 'Access'   },
              { num: '8+',   label: 'Features' },
              { num: '🔒',   label: 'Private'  },
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

        {/* ══════════════════════════════════════
            WHITE FORM CARD
        ══════════════════════════════════════ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Register</Text>
          <Text style={styles.cardSub}>Fill in your details below</Text>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#e74c3c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Name Row */}
          <View style={styles.nameRow}>
            <View style={[styles.inputRow, { flex: 1, marginRight: 8 }]}>
              <Ionicons name="person-outline" size={18} color="#bbb" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="First Name *" placeholderTextColor="#bbb" value={form.firstName} onChangeText={v => set('firstName', v)} autoCorrect={false} />
            </View>
            <View style={[styles.inputRow, { flex: 1 }]}>
              <TextInput style={styles.input} placeholder="Last Name *" placeholderTextColor="#bbb" value={form.lastName} onChangeText={v => set('lastName', v)} autoCorrect={false} />
            </View>
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color="#bbb" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Email address *" placeholderTextColor="#bbb" value={form.email} onChangeText={v => set('email', v)} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="call-outline" size={18} color="#bbb" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Phone Number (optional)" placeholderTextColor="#bbb" value={form.phoneNumber} onChangeText={v => set('phoneNumber', v)} keyboardType="phone-pad" />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#bbb" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Password * (min 6 chars)" placeholderTextColor="#bbb" value={form.password} onChangeText={v => set('password', v)} secureTextEntry={!showPassword} autoCorrect={false} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#bbb" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#bbb" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Confirm Password *" placeholderTextColor="#bbb" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)} secureTextEntry={!showPassword} autoCorrect={false} />
          </View>

          {form.password.length > 0 && (
            <View style={styles.strengthRow}>
              <View style={[styles.strengthBar, { backgroundColor: form.password.length >= 8 ? '#27ae60' : form.password.length >= 6 ? '#f39c12' : '#e74c3c' }]} />
              <Text style={styles.strengthLabel}>
                {form.password.length >= 8 ? '✓ Strong' : form.password.length >= 6 ? '~ Fair' : '✗ Too short'}
              </Text>
            </View>
          )}

          <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.primaryBtnText}>Create Account</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => { dispatch(clearError()); navigation.navigate('Login'); }}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <Text style={styles.linkHighlight}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f5f6f8' },
  scroll: { flexGrow: 1 },

  // ══════ HEADER ══════
  header: {
    backgroundColor: '#e74c3c',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 18,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#c0392b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  hdrBubble1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.07)', top: -40, right: -40 },
  hdrBubble2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -25, left: -10 },

  userRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar:    { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  userInfo:  { flex: 1 },
  userName:  { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 2 },
  userEmail: { fontSize: 12, color: 'rgba(255,255,255,0.78)', marginBottom: 6 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  verifiedText:  { color: '#fff', fontSize: 10, fontWeight: '700' },

  statsRow:    { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 16, fontWeight: '900', color: '#fff' },
  statLabel:   { fontSize: 9, color: 'rgba(255,255,255,0.78)', marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, height: 26, backgroundColor: 'rgba(255,255,255,0.25)' },

  // ══════ FORM CARD ══════
  card: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 26, paddingTop: 30, minHeight: 540 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  cardSub:   { fontSize: 13, color: '#aaa', marginBottom: 20 },

  errorBox:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fdecea', padding: 12, borderRadius: 10, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: '#e74c3c' },
  errorText: { color: '#c0392b', fontSize: 13, flex: 1 },

  nameRow:   { flexDirection: 'row', marginBottom: 0 },
  inputRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, marginBottom: 12, paddingHorizontal: 14, borderWidth: 1.5, borderColor: '#ececec' },
  inputIcon: { marginRight: 10 },
  input:     { flex: 1, paddingVertical: 14, fontSize: 14, color: '#1a1a2e' },
  eyeBtn:    { padding: 6 },

  strengthRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: -4 },
  strengthBar:   { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, color: '#888', fontWeight: '600' },

  primaryBtn: {
    backgroundColor: '#e74c3c', paddingVertical: 16,
    borderRadius: 12, alignItems: 'center',
    marginTop: 6, marginBottom: 18,
    shadowColor: '#e74c3c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  linkRow:       { flexDirection: 'row', justifyContent: 'center', paddingVertical: 4 },
  linkText:      { fontSize: 14, color: '#aaa' },
  linkHighlight: { fontSize: 14, color: '#e74c3c', fontWeight: '700' },
});