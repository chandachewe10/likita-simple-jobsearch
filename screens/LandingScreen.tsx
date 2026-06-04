import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LikitaLogo from '../components/LikitaLogo';
import theme from '../lib/theme';

const { width } = Dimensions.get('window');
const H_PAD = Platform.OS === 'web' ? 48 : theme.spacing.md;

const C = {
  heroBg: '#0B1220',
  heroCard: '#151D2E',
  accent: '#F59E0B',
  accentDark: '#D97706',
  accentSoft: 'rgba(245, 158, 11, 0.15)',
  heroText: '#F8FAFC',
  heroMuted: '#94A3B8',
  lightBg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  worker: '#0EA5E9',
  employer: '#8B5CF6',
  success: '#10B981',
};

const TRADES = [
  { icon: 'water-outline' as const, label: 'Plumbing' },
  { icon: 'flash-outline' as const, label: 'Electrical' },
  { icon: 'hammer-outline' as const, label: 'Carpentry' },
  { icon: 'color-palette-outline' as const, label: 'Painting' },
  { icon: 'construct-outline' as const, label: 'Building' },
  { icon: 'flame-outline' as const, label: 'Welding' },
];

const STEPS = [
  { num: '01', title: 'Create your profile', body: 'Add skills, location, and contact details in minutes.' },
  { num: '02', title: 'Match & apply', body: 'Workers find jobs. Employers review applicants with AI help.' },
  { num: '03', title: 'Hire & get paid', body: 'Accept, complete work, and pay via mobile money.' },
];

function FadeIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

export default function LandingScreen() {
  const nav = useNavigation<any>();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.heroBg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero block */}
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={[styles.inner, styles.heroInner]}>
              <View style={styles.navRow}>
                <LikitaLogo size="md" variant="onDark" />
                <TouchableOpacity
                  style={styles.navSignIn}
                  onPress={() => nav.navigate('Login')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.navSignInText}>Sign in</Text>
                </TouchableOpacity>
              </View>

              <FadeIn delay={80}>
                <View style={styles.pill}>
                  <View style={styles.pillDot} />
                  <Text style={styles.pillText}>Built for Zambia's skilled trades</Text>
                </View>
              </FadeIn>

              <FadeIn delay={160}>
                <Text style={styles.headline}>
                  Hire trusted hands.{'\n'}
                  <Text style={styles.headlineAccent}>Find real work.</Text>
                </Text>
                <Text style={styles.subhead}>
                  Likita connects plumbers, electricians, builders, and more with employers who need them — fast, nearby, and verified.
                </Text>
              </FadeIn>

              <FadeIn delay={240}>
                <TouchableOpacity
                  style={styles.ctaMain}
                  onPress={() => nav.navigate('SignUp')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.ctaMainText}>Create free account</Text>
                  <Ionicons name="arrow-forward" size={20} color={C.heroBg} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ctaGhost}
                  onPress={() => nav.navigate('Login')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ctaGhostText}>I already have an account</Text>
                </TouchableOpacity>
              </FadeIn>

              <FadeIn delay={320}>
                <View style={styles.heroStats}>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatValue}>2.4k+</Text>
                    <Text style={styles.heroStatLabel}>Workers</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatValue}>380+</Text>
                    <Text style={styles.heroStatLabel}>Employers</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatValue}>10</Text>
                    <Text style={styles.heroStatLabel}>Provinces</Text>
                  </View>
                </View>
              </FadeIn>
            </View>
          </SafeAreaView>

          <View style={styles.heroCurve} />
        </View>

        {/* Light content */}
        <View style={styles.lightSection}>
          <View style={styles.inner}>
            <FadeIn delay={100}>
              <Text style={styles.sectionEyebrow}>CHOOSE YOUR PATH</Text>
              <Text style={styles.sectionTitle}>How will you use Likita?</Text>
            </FadeIn>

            <FadeIn delay={180}>
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => nav.navigate('SignUp')}
                activeOpacity={0.92}
              >
                <View style={[styles.roleIconWrap, { backgroundColor: 'rgba(14, 165, 233, 0.12)' }]}>
                  <Ionicons name="person" size={28} color={C.worker} />
                </View>
                <View style={styles.roleTextBlock}>
                  <Text style={styles.roleTitle}>I'm looking for work</Text>
                  <Text style={styles.roleBody}>
                    Browse jobs by trade, apply with your profile, and grow your reputation.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={C.muted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleCard, styles.roleCardLast]}
                onPress={() => nav.navigate('SignUp')}
                activeOpacity={0.92}
              >
                <View style={[styles.roleIconWrap, { backgroundColor: 'rgba(139, 92, 246, 0.12)' }]}>
                  <Ionicons name="business" size={28} color={C.employer} />
                </View>
                <View style={styles.roleTextBlock}>
                  <Text style={styles.roleTitle}>I'm hiring</Text>
                  <Text style={styles.roleBody}>
                    Post jobs, filter skilled workers nearby, accept applicants, and pay on completion.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={C.muted} />
              </TouchableOpacity>
            </FadeIn>

            <FadeIn delay={260}>
              <Text style={[styles.sectionEyebrow, { marginTop: 36 }]}>TRADES ON LIKITA</Text>
              <View style={styles.tradesGrid}>
                {TRADES.map((t) => (
                  <View key={t.label} style={styles.tradeTile}>
                    <Ionicons name={t.icon} size={22} color={C.accentDark} />
                    <Text style={styles.tradeLabel}>{t.label}</Text>
                  </View>
                ))}
              </View>
            </FadeIn>

            <FadeIn delay={340}>
              <Text style={[styles.sectionEyebrow, { marginTop: 36 }]}>HOW IT WORKS</Text>
              {STEPS.map((step, i) => (
                <View key={step.num} style={[styles.stepRow, i === STEPS.length - 1 && { marginBottom: 0 }]}>
                  <Text style={styles.stepNum}>{step.num}</Text>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepBody}>{step.body}</Text>
                  </View>
                </View>
              ))}
            </FadeIn>

            <FadeIn delay={420}>
              <View style={styles.featuresCard}>
                <View style={styles.featureItem}>
                  <Ionicons name="location-outline" size={22} color={C.success} />
                  <Text style={styles.featureText}>Find workers ranked by distance & rating</Text>
                </View>
                <View style={styles.featureDivider} />
                <View style={styles.featureItem}>
                  <Ionicons name="sparkles-outline" size={22} color={C.accentDark} />
                  <Text style={styles.featureText}>AI recommendations on every applicant</Text>
                </View>
                <View style={styles.featureDivider} />
                <View style={styles.featureItem}>
                  <Ionicons name="phone-portrait-outline" size={22} color={C.worker} />
                  <Text style={styles.featureText}>SMS alerts & mobile money payments</Text>
                </View>
              </View>
            </FadeIn>

            <FadeIn delay={500}>
              <View style={styles.bottomCta}>
                <Text style={styles.bottomCtaTitle}>Ready to get started?</Text>
                <Text style={styles.bottomCtaSub}>Join Likita today — free for workers and employers.</Text>
                <TouchableOpacity
                  style={styles.bottomCtaBtn}
                  onPress={() => nav.navigate('SignUp')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.bottomCtaBtnText}>Sign up now</Text>
                </TouchableOpacity>
              </View>
            </FadeIn>

            <Text style={styles.copyright}>© Likita · Zambia's trade work platform</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.lightBg,
    ...Platform.select({
      web: { minHeight: '100vh' as unknown as number },
      default: {},
    }),
  },
  scroll: { flex: 1, width: '100%' },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
  },
  inner: {
    width: '100%',
    alignSelf: 'stretch',
    paddingHorizontal: H_PAD,
  },

  hero: {
    width: '100%',
    backgroundColor: C.heroBg,
    position: 'relative',
    overflow: 'hidden',
  },
  heroSafe: { width: '100%' },
  heroInner: {
    paddingBottom: 48,
  },
  heroCurve: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: C.lightBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 28,
  },
  navSignIn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  navSignInText: {
    color: C.heroText,
    fontWeight: '600',
    fontSize: 14,
  },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: C.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accent,
    marginRight: 8,
  },
  pillText: {
    color: C.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  headline: {
    fontSize: width > 400 ? 38 : 34,
    fontWeight: '800',
    color: C.heroText,
    lineHeight: width > 400 ? 44 : 40,
    letterSpacing: -1.2,
    marginBottom: 14,
  },
  headlineAccent: {
    color: C.accent,
  },
  subhead: {
    fontSize: 16,
    color: C.heroMuted,
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: Platform.OS === 'web' ? 640 : undefined,
  },

  ctaMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: C.accent,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  ctaMainText: {
    color: C.heroBg,
    fontWeight: '800',
    fontSize: 17,
  },
  ctaGhost: {
    paddingVertical: 14,
    alignItems: 'flex-start',
    marginBottom: 28,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  ctaGhostText: {
    color: C.heroMuted,
    fontWeight: '600',
    fontSize: 15,
  },

  heroStats: {
    flexDirection: 'row',
    backgroundColor: C.heroCard,
    borderRadius: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: C.heroText,
    letterSpacing: -0.5,
  },
  heroStatLabel: {
    fontSize: 11,
    color: C.heroMuted,
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },

  lightSection: {
    width: '100%',
    backgroundColor: C.lightBg,
    paddingTop: 8,
    paddingBottom: 40,
  },

  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: C.accentDark,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 20,
  },

  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  roleCardLast: { marginBottom: 0 },
  roleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  roleTextBlock: { flex: 1, marginRight: 8 },
  roleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  roleBody: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 19,
  },

  tradesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  tradeTile: {
    width: Platform.OS === 'web' ? '31%' : (width - H_PAD * 2 - 20) / 3,
    minWidth: 100,
    flexGrow: 1,
    backgroundColor: C.card,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  tradeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.text,
    textAlign: 'center',
  },

  stepRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '800',
    color: C.accent,
    width: 36,
    marginTop: 2,
  },
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  stepBody: {
    fontSize: 14,
    color: C.muted,
    lineHeight: 20,
  },

  featuresCard: {
    marginTop: 36,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  featureDivider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    lineHeight: 20,
  },

  bottomCta: {
    marginTop: 36,
    backgroundColor: C.heroBg,
    borderRadius: 20,
    padding: 28,
    alignItems: 'flex-start',
  },
  bottomCtaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.heroText,
    marginBottom: 8,
    textAlign: 'left',
  },
  bottomCtaSub: {
    fontSize: 14,
    color: C.heroMuted,
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 20,
    maxWidth: 520,
  },
  bottomCtaBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  bottomCtaBtnText: {
    color: C.heroBg,
    fontWeight: '800',
    fontSize: 16,
  },

  copyright: {
    textAlign: 'left',
    color: C.muted,
    fontSize: 12,
    marginTop: 28,
    marginBottom: 8,
  },
});
