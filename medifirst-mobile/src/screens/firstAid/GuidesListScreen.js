import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { getAllGuides } from '../../api/firstAidApi';

const SEVERITY_COLORS = {
  critical: '#e74c3c', high: '#e67e22', medium: '#f39c12', low: '#27ae60',
};

const LOCAL_GUIDES = [
  {
    _id: 'local_cpr',
    title: 'CPR (Cardiopulmonary Resuscitation)',
    description: 'CPR is a lifesaving technique useful in emergencies where someone\'s breathing or heartbeat has stopped.',
    category: 'cpr', severity: 'critical', isOfflineAvailable: true,
    steps: [
      { stepNumber: 1, title: 'Check the Scene', description: 'Make sure the scene is safe for you and the victim. Look for hazards before approaching.', image: require('../../../assets/guides/cpr/step1cpr.jpg') },
      { stepNumber: 2, title: 'Check Responsiveness', description: 'Tap the person\'s shoulder firmly and shout "Are you okay?" If no response, call 911 immediately.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/CPR_-_adult_01.jpg/320px-CPR_-_adult_01.jpg' },
      { stepNumber: 3, title: 'Call for Help', description: 'Call 911 or ask someone nearby to call. If an AED is available, send someone to get it.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/999_call.jpg/320px-999_call.jpg' },
      { stepNumber: 4, title: 'Open the Airway', description: 'Tilt the head back and lift the chin to open the airway. Look, listen, and feel for breathing for no more than 10 seconds.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/CPR_adult_tilt_head.jpg/320px-CPR_adult_tilt_head.jpg' },
      { stepNumber: 5, title: 'Give Rescue Breaths', description: 'Pinch the nose shut, make a seal over the mouth, and give 2 breaths each lasting 1 second. Watch for chest rise.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/CPR_adult_rescue_breath.jpg/320px-CPR_adult_rescue_breath.jpg' },
      { stepNumber: 6, title: 'Perform Chest Compressions', description: 'Push hard and fast in the center of the chest. Give 30 compressions at 100–120 per minute, at least 2 inches deep.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/CPR_adult_01.jpg/320px-CPR_adult_01.jpg' },
      { stepNumber: 7, title: 'Continue CPR Cycle', description: 'Repeat 30 compressions and 2 breaths. Continue until help arrives, the person recovers, or you are too exhausted.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/CPR_-_adult_01.jpg/320px-CPR_-_adult_01.jpg' },
    ],
    warnings: ['Do not stop CPR unless emergency services take over', 'Compressions may break ribs — this is normal and acceptable', 'Do not give rescue breaths if untrained — hands-only CPR is acceptable'],
    whenToCallEmergency: ['Person is unresponsive', 'Person is not breathing normally', 'Person has no pulse'],
  },
  {
    _id: 'local_choking',
    title: 'Choking — Heimlich Maneuver',
    description: 'Choking occurs when a foreign object blocks the throat or windpipe. Quick action is critical.',
    category: 'choking', severity: 'critical', isOfflineAvailable: true,
    steps: [
      { stepNumber: 1, title: 'Identify Choking Signs', description: 'Look for inability to speak, difficulty breathing, weak cough, bluish skin, or hands clutching throat.', image: require('../../../assets/guides/choking/step1choking.jpg') },
      { stepNumber: 2, title: 'Cough it out', description: 'Encourage them to cough and remove any obvious obstruction from their mouth.', image: require('../../../assets/guides/choking/step2choking.jpg') },
      { stepNumber: 3, title: 'Hit it out', description: 'If coughing fails, give five sharp back blows between their shoulder blades with the heel of your hand.', image: require('../../../assets/guides/choking/3.jpg') },
      { stepNumber: 4, title: 'Give Back Blows', description: 'Place one fist between belly button and chest. Grasp with other hand and pull sharply inwards and upwards up to five times.', image: require('../../../assets/guides/choking/step4choking.jpg') },
      { stepNumber: 5, title: 'Give Abdominal Thrusts', description: 'If blockage is not cleared, call 911 immediately. Repeat five back blows and five abdominal thrusts until help arrives.', image: require('../../../assets/guides/choking/step5choking.jpg') },
    ],
    warnings: ['Never do blind finger sweeps in the mouth', 'For pregnant women or obese individuals, use chest thrusts instead', 'Do not slap a choking person on the back while upright — bend them forward first'],
    whenToCallEmergency: ['Person cannot breathe, speak, or cough', 'Person loses consciousness', 'Object cannot be dislodged after several attempts'],
  },
  {
    _id: 'local_burns',
    title: 'Burns — First Aid Treatment',
    description: 'Burns are injuries caused by heat, chemicals, electricity, or radiation. Proper treatment prevents infection.',
    category: 'burns', severity: 'high', isOfflineAvailable: true,
    steps: [
      { stepNumber: 1, title: 'Ensure Safety', description: 'Remove the person from the source of the burn. For chemical burns, remove contaminated clothing carefully.', image: require('../../../assets/guides/burns/burns1.jpg') },
      { stepNumber: 2, title: 'Cool the Burn', description: 'Apply a cool, moist towel over the burned area. Do not use ice or cold water — this can cause hypothermia.', image: require('../../../assets/guides/burns/burns2.jpg') },
      { stepNumber: 3, title: 'Remove Chemical Irritants', description: 'If caused by chemicals, run the area under cool water. Do not attempt home remedies on a chemical burn.', image: require('../../../assets/guides/burns/burns3.jpg') },
      { stepNumber: 4, title: 'Elevate the Burn', description: 'Elevate the burned area above heart level if possible. Cover with clean, non-fluffy material like plastic wrap.', image: require('../../../assets/guides/burns/burns4.jpg') },
      { stepNumber: 5, title: 'Watch for Shock', description: 'Watch for weak pulse, low blood pressure, clammy skin, disorientation. Get medical attention immediately.', image: require('../../../assets/guides/burns/burns5.jpg') },
    ],
    warnings: ['Never use butter, toothpaste, or ice on burns', 'Do not remove clothing stuck to the burn', 'Do not use fluffy cotton material to cover burns'],
    whenToCallEmergency: ['Burn is larger than 3 inches', 'Burn involves face, hands, feet, or genitals', 'Burn is deep, white, or charred (3rd degree)', 'Chemical or electrical burn'],
  },
  {
    _id: 'local_bleeding',
    title: 'Severe Bleeding — Wound Care',
    description: 'Uncontrolled bleeding can be life-threatening. Acting quickly to control blood loss is essential.',
    category: 'bleeding', severity: 'critical', isOfflineAvailable: true,
    steps: [
      { stepNumber: 1, title: 'Rinse the Cut with Water', description: 'Running water will both clean the wound and help stop the bleeding. Run cool water over the cut to constrict blood vessels.', image: require('../../../assets/guides/bleeding/bleeding1.jpg') },
      { stepNumber: 2, title: 'Apply Pressure', description: 'After cleaning, apply pressure with a clean cloth or gauze. Hold for several minutes without removing.', image: require('../../../assets/guides/bleeding/bleeding2.jpg') },
      { stepNumber: 3, title: 'Try a Styptic Pencil', description: 'Rub the pencil over the skin. The mineral astringents will stop bleeding. It may sting briefly.', image: require('../../../assets/guides/bleeding/bleeding3.jpg') },
      { stepNumber: 4, title: 'Add Petroleum Jelly', description: 'Apply a small smear of petroleum jelly to minor cuts to block blood flow and allow clotting.', image: require('../../../assets/guides/bleeding/bleeding4.jpg') },
      { stepNumber: 5, title: 'Apply Antiperspirant', description: 'Aluminum chloride in deodorant works as an astringent to stop blood flow. Apply directly to the cut.', image: require('../../../assets/guides/bleeding/bleeding5.jpg') },
      { stepNumber: 6, title: 'Dab on Listerine', description: 'Listerine can disinfect your cut and help stop blood flow. Pour directly or use a cotton ball.', image: require('../../../assets/guides/bleeding/bleeding6.jpg') },
      { stepNumber: 7, title: 'Use an Alum Block', description: 'Alum blocks are a traditional remedy for stopping bleeding. Rub the block over the cut to help it clot.', image: require('../../../assets/guides/bleeding/bleeding7.jpg') },
      { stepNumber: 8, title: 'Apply White Vinegar', description: 'The astringent properties of vinegar disinfect and clot small cuts. Dab with a cotton ball.', image: require('../../../assets/guides/bleeding/bleeding8.jpg') },
      { stepNumber: 9, title: 'Try Witch Hazel', description: 'Witch hazel acts as a natural astringent great for clotting small cuts. Pour a little or dab it on.', image: require('../../../assets/guides/bleeding/bleeding9.jpg') },
      { stepNumber: 10, title: 'Use Cornstarch', description: 'Sprinkle cornstarch onto the cut. Lightly press the powder to expedite clotting, then rinse off.', image: require('../../../assets/guides/bleeding/bleeding10.jpg') },
      { stepNumber: 11, title: 'Last Resort: Spiderweb', description: 'Spiderwebs have been used historically to stop bleeding. Gently place over the cut and apply pressure.', image: require('../../../assets/guides/bleeding/bleeding11.jpg') },
    ],
    warnings: ['Do not remove objects embedded in wounds', 'Do not remove a tourniquet once applied', 'Watch for signs of shock: pale skin, rapid breathing, confusion'],
    whenToCallEmergency: ['Bleeding does not stop after 10 minutes of pressure', 'Blood is spurting from the wound', 'Person shows signs of shock', 'Wound is deep or has embedded object'],
  },
  {
    _id: 'local_fractures',
    title: 'Fractures — Bone Injury Care',
    description: 'A fracture is a broken bone. Proper immobilization prevents further injury until medical help arrives.',
    category: 'fractures', severity: 'high', isOfflineAvailable: true,
    steps: [
      { stepNumber: 1, title: 'Recognize the symptoms of a fracture in your foot.', description: 'Look for signs like severe pain, swelling, deformity, inability to bear weight, or visible bone.', image: require('../../../assets/guides/fractures/fracture1.jpg') },
      { stepNumber: 2, title: 'Foot fracture symptoms', description: 'Other symptoms include bruising, numbness, and inability to move the toes.', image: require('../../../assets/guides/fractures/fracture2.jpg') },
      { stepNumber: 3, title: 'Take some acetaminophen', description: 'Take over-the-counter pain medication like acetaminophen to manage pain.', image: require('../../../assets/guides/fractures/fracture3.jpg') },
      { stepNumber: 4, title: 'Go see your personal physician', description: 'See a doctor for proper diagnosis and treatment.', image: require('../../../assets/guides/fractures/fracture4.jpg') },
      { stepNumber: 5, title: 'Method 2', description: 'Keep the person calm and still until help arrives.', image: require('../../../assets/guides/fractures/fracture5.jpg') },
      { stepNumber: 6, title: 'Assess the fracture', description: 'Determine if the fracture is open (bone visible through skin) or closed (skin intact).', image: require('../../../assets/guides/fractures/fracture6.jpg') },
      { stepNumber: 7, title: 'Stop any bleeding and immobilize the fracture', description: 'Apply direct pressure to stop bleeding and immobilize the area with a splint or sling.', image: require('../../../assets/guides/fractures/fracture7.jpg') },
    ],
    warnings: ['Never try to straighten a broken bone', 'Do not move a person with suspected spinal injury', 'Open fractures are medical emergencies'],
    whenToCallEmergency: ['Suspected spinal, neck, or head injury', 'Bone is visible through skin', 'Limb is numb, cold, or bluish below fracture', 'Person is unconscious'],
  },
  {
    _id: 'local_seizure',
    title: 'Seizure — Emergency Response',
    description: 'A seizure is a sudden electrical disturbance in the brain. Knowing how to respond safely can prevent injury.',
    category: 'seizure', severity: 'high', isOfflineAvailable: true,
    steps: [
      { stepNumber: 1, title: 'Protecting the Person from Harm', description: 'Protect the person from injury during the seizure. Remove nearby hard or sharp objects.', image: require('../../../assets/guides/seizures/seizure1.jpg') },
      { stepNumber: 2, title: 'Reduce the risk of injury by checking the area', description: 'Clear the area of any hard or sharp objects that could cause injury.', image: require('../../../assets/guides/seizures/seizure2.jpg') },
      { stepNumber: 3, title: 'Place something soft under the person\'s head.', description: 'Place a folded towel, jacket, or pillow under the person\'s head to protect it.', image: require('../../../assets/guides/seizures/seizure3.jpg') },
      { stepNumber: 4, title: 'Stay clear of the person', description: 'Do not touch the person during the seizure. Stay nearby to monitor and assist if needed.', image: require('../../../assets/guides/seizures/seizure4.jpg') },
      { stepNumber: 5, title: 'Time the Seizure', description: 'Note when the seizure starts and ends. More than 5 minutes is a medical emergency.', image: require('../../../assets/guides/seizures/seizure5.jpg') },
      { stepNumber: 6, title: 'Method 2 Calling Emergency Services', description: 'If the seizure lasts more than 5 minutes, call 911 immediately.', image: require('../../../assets/guides/seizures/seizure6.jpg') },
      { stepNumber: 7, title: 'Call emergency services if the seizure lasts more than 5 minutes.', description: 'If the seizure lasts more than 5 minutes, call 911 immediately.', image: require('../../../assets/guides/seizures/seizure7.jpg') },
    ],
    warnings: ['Never put anything in the mouth of a person having a seizure', 'Do not give water or food until fully conscious', 'Never leave the person alone during or right after a seizure'],
    whenToCallEmergency: ['Seizure lasts more than 5 minutes', 'Person does not regain consciousness', 'Person is injured during the seizure', 'It is a first seizure', 'Person is pregnant or diabetic'],
  },
  {
    _id: 'local_stroke',
    title: 'Stroke — Emergency Care',
    description: 'A stroke occurs when blood flow to part of the brain is interrupted or reduced, preventing brain tissue from getting oxygen and nutrients. Immediate medical attention is crucial.',
    category: 'stroke', severity: 'critical', isOfflineAvailable: true,
    steps: [
      { stepNumber: 1, title: 'Understand the difference between a stroke and a mini-stroke', description: 'Mini-strokes, also called transient ischemic attacks, occur when your brain gets less blood than normal. They can last from a few minutes up to a day.', image: require('../../../assets/guides/stroke/stroke.jpg') },
      { stepNumber: 2, title: 'Look for two or more symptoms of a stroke', description: 'Common stroke symptoms include sudden numbness, weakness, confusion, difficulty speaking or understanding, vision problems, trouble walking, and severe headache.', image: require('../../../assets/guides/stroke/stroke01.jpg') },
      { stepNumber: 3, title: 'Do the F.A.S.T test.', description: 'Face drooping, A: Arm weakness, S: Speech difficulty, T: Time to call 911.', image: require('../../../assets/guides/stroke/stroke02.jpg') },
      { stepNumber: 4, title: 'Method 2 Medical Attention for the Stroke Victim', description: 'Once emergency services are called, the person should be taken to the hospital for immediate medical attention.', image: require('../../../assets/guides/stroke/stroke1.jpg') },
      { stepNumber: 5, title: 'Allow the doctor to do tests and a check up', description: 'The doctor will perform necessary tests and examinations to determine the type and severity of the stroke.', image: require('../../../assets/guides/stroke/stroke2.jpg') },
      { stepNumber: 6, title: 'Discuss treatment options with the doctor', description: 'The doctor will discuss treatment options such as medications or surgical procedures based on the patient\'s condition.', image: require('../../../assets/guides/stroke/stroke3.jpg') },
    ],
    warnings: ['Do not give aspirin or blood thinners unless directed by a doctor', 'Do not give food or drink to an unconscious or confused person', 'Do not delay seeking medical attention'],
    whenToCallEmergency: ['Person shows signs of stroke (F.A.S.T symptoms)', 'Person is unconscious or unresponsive', 'Person has severe headache with no known cause', 'Person has sudden vision changes or difficulty speaking'],
  },
  {
    _id: 'local_poison',
    title: 'Poisoning — Emergency Care',
    description: 'Poisoning is a medical emergency requiring immediate attention. Follow these steps to provide initial care.',
    category: 'poison', severity: 'critical', isOfflineAvailable: true,
    steps: [
      { stepNumber: 1, title: 'Getting Immediate Help', description: 'If you suspect poisoning, call 911 or Poison Control (1-800-222-1222) immediately.', image: require('../../../assets/guides/poison/poison1.jpg') },
      { stepNumber: 2, title: 'Get immediate help if you think someone poisoned themself intentionally', description: 'If you suspect intentional poisoning, call 911 immediately and do not leave the person alone.', image: require('../../../assets/guides/poison/poison2.jpg') },
      { stepNumber: 3, title: 'Contact Poison Control if there are no symptoms', description: 'If the person is conscious and alert, contact Poison Control for guidance even if there are no symptoms.', image: require('../../../assets/guides/poison/poison3.jpg') },
      { stepNumber: 4, title: 'Provide as much information as you can to the medical professionals.', description: 'Tell them what substance was ingested, inhaled, or absorbed, and when it happened.', image: require('../../../assets/guides/poison/poison4.jpg') },
      { stepNumber: 5, title: 'Accompany the person while they get medical care if you can', description: 'Stay with the person until they receive medical care and provide any necessary information to medical staff.', image: require('../../../assets/guides/poison/poison5.jpg') },
    ],
    warnings: ['Never induce vomiting unless told to by Poison Control', 'Do not give anything to eat or drink', 'Do not leave the person alone'],
    whenToCallEmergency: ['Person is unconscious or unresponsive', 'Person is having seizures', 'Severe difficulty breathing', 'Unknown substance was ingested'],
  },
];

export default function GuidesListScreen({ navigation, route }) {
  // ── Auth state to detect guest ──────────────────────────────
  const { user }  = useSelector((state) => state.auth);
  const isGuest   = !user?.firstName;

  const [guides, setGuides]         = useState([]);
  const [loading, setLoading]       = useState(true);
  // noInternet is true only when the API threw a network error
  const [noInternet, setNoInternet] = useState(false);

  const category = route.params?.category;

  useEffect(() => { fetchGuides(); }, [category]);

  const fetchGuides = async () => {
    setLoading(true);
    setNoInternet(false);
    try {
      const data = await getAllGuides(category ? { category } : {});
      if (data?.guides?.length > 0) {
        const list = category
          ? data.guides.filter(g => g.category?.toLowerCase() === category.toLowerCase())
          : data.guides;
        setGuides(list);
      } else {
        // Server responded but no guides — load local silently, NOT a network error
        loadLocalGuides();
      }
    } catch (_) {
      // Actual network/connection error
      setNoInternet(true);
      loadLocalGuides();
    }
    finally { setLoading(false); }
  };

  const loadLocalGuides = () => {
    const list = category
      ? LOCAL_GUIDES.filter(g => g.category?.toLowerCase() === category.toLowerCase())
      : LOCAL_GUIDES;
    setGuides(list);
  };

  // Banner only appears when: genuinely offline AND the user is a guest
  const showOfflineBanner = noInternet && isGuest;

  const renderGuide = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('GuideDetail', {
        guideId: item._id,
        title: item.title,
        localGuide: item,
      })}
      activeOpacity={0.8}
    >
      <View style={[styles.severityBar, { backgroundColor: SEVERITY_COLORS[item.severity] || '#999' }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={[styles.badge, { backgroundColor: SEVERITY_COLORS[item.severity] || '#999' }]}>
            <Text style={styles.badgeText}>{item.severity?.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{item.category?.toUpperCase()}</Text>
          </View>
          <View style={styles.stepsTag}>
            <Ionicons name="list" size={11} color="#2980b9" />
            <Text style={styles.stepsText}>{item.steps?.length || 0} Steps</Text>
          </View>
          {item.isOfflineAvailable && (
            <View style={styles.offlineTag}>
              <Ionicons name="checkmark-circle" size={12} color="#27ae60" />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#e74c3c" />
      <Text style={styles.loadingText}>Loading guides...</Text>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* ── Offline banner: only when no internet AND guest ── */}
      {showOfflineBanner && (
        <View style={styles.offlineBanner}>
          <Ionicons name="wifi-outline" size={16} color="#856404" />
          <Text style={styles.offlineBannerText}>
            No internet — showing offline guides. Sign in for full access.
          </Text>
        </View>
      )}

      <FlatList
        data={guides}
        keyExtractor={(item) => item._id}
        renderItem={renderGuide}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="book-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No guides available.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff3cd', paddingHorizontal: 16, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: '#ffc107',
  },
  offlineBannerText: { fontSize: 12, color: '#856404', flex: 1, lineHeight: 17 },

  list: { padding: 12 },

  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, elevation: 2, overflow: 'hidden', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  severityBar: { width: 6, alignSelf: 'stretch' },
  cardContent: { flex: 1, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  cardDesc: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 8 },

  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  categoryTag: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  categoryText: { fontSize: 10, color: '#666', fontWeight: '700' },
  stepsTag: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#e8f4fb', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  stepsText: { fontSize: 10, color: '#2980b9', fontWeight: '700' },
  offlineTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  offlineText: { fontSize: 11, color: '#27ae60', fontWeight: '600' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 10, color: '#666', fontSize: 16 },
  emptyText: { marginTop: 10, color: '#999', fontSize: 15, textAlign: 'center' },
});