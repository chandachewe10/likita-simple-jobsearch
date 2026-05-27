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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LikitaLogo from '../components/LikitaLogo';
import theme from '../lib/theme';

const { width } = Dimensions.get('window');

const TRADES = [
  { icon: '🔧', label: 'Plumbing' },
  { icon: '⚡', label: 'Electrical' },
  { icon: '🏗️', label: 'Construction' },
  { icon: '🪚', label: 'Carpentry' },
  { icon: '🎨', label: 'Painting' },
  { icon: '🔩', label: 'Welding' },
];

const STATS = [
  { value: '2,400+', label: 'Skilled Workers' },
  { value: '380+', label: 'Employers' },
  { value: '10', label: 'Provinces' },
];

function TradeChip({ icon, label, delay }: { icon: string; label: string; delay: number }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.chip, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <Text style={styles.chipIcon}>{icon}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </Animated.View>
  );
}

function StatItem({ value, label, delay }: { value: string; label: string; delay: number }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.statItem, { opacity: fade }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function LandingScreen() {
  const nav = useNavigation<any>();

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(24)).current;
  const badgeFade = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(badgeFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(heroFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(heroSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.spring(btnScale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header bar */}
        <View style={styles.topBar}>
          <LikitaLogo size="lg" style={styles.logoFlex} />
          <TouchableOpacity
            style={styles.signInChip}
            onPress={() => nav.navigate('Login')}
          >
            <Text style={styles.signInChipText}>Sign in</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroSection}>
          <Animated.View style={{ opacity: badgeFade }}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Zambia's Trade Work Platform</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={{ opacity: heroFade, transform: [{ translateY: heroSlide }] }}
          >
            <Text style={styles.heroHeadline}>
              Find skilled tradespeople near you.
            </Text>
            <Text style={styles.heroSub}>
              Connecting Zambian artisans, technicians, and builders with the employers who need them — from Lusaka to Livingstone.
            </Text>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={styles.ctaPrimary}
              onPress={() => nav.navigate('SignUp')}
              activeOpacity={0.88}
            >
              <Text style={styles.ctaPrimaryText}>Get started — it's free</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaSecondary}
              onPress={() => nav.navigate('Login')}
              activeOpacity={0.75}
            >
              <Text style={styles.ctaSecondaryText}>I already have an account</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Divider label */}
        <View style={styles.sectionLabel}>
          <View style={styles.dividerLine} />
          <Text style={styles.sectionLabelText}>Trades we cover</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Trade chips grid */}
        <View style={styles.chipsGrid}>
          {TRADES.map((t, i) => (
            <TradeChip key={t.label} icon={t.icon} label={t.label} delay={200 + i * 70} />
          ))}
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              <StatItem value={s.value} label={s.label} delay={400 + i * 120} />
              {i < STATS.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Value prop cards */}
        <View style={styles.cardsSection}>
          <View style={[styles.card, styles.cardWorker]}>
            <Text style={styles.cardEmoji}>👷</Text>
            <Text style={styles.cardTitle}>For workers</Text>
            <Text style={styles.cardBody}>
              Browse jobs that match your trade, apply in seconds, and get hired by verified employers.
            </Text>
          </View>
          <View style={[styles.card, styles.cardEmployer]}>
            <Text style={styles.cardEmoji}>🏢</Text>
            <Text style={styles.cardTitle}>For employers</Text>
            <Text style={styles.cardBody}>
              Post a job, review applicants, and connect with qualified tradespeople fast.
            </Text>
          </View>
        </View>

        {/* Footer nudge */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Join thousands of tradespeople already on Likita.
          </Text>
          <TouchableOpacity onPress={() => nav.navigate('SignUp')}>
            <Text style={styles.footerLink}>Create your free account →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    paddingBottom: 48,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 16,
  },
  logoFlex: {
    flex: 1,
  },
  signInChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  signInChipText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },

  // Hero
  heroSection: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: 20,
    paddingBottom: 28,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    color: theme.colors.muted,
    fontWeight: '500',
  },
  heroHeadline: {
    fontSize: 40,
    fontWeight: '800',
    color: theme.colors.text,
    lineHeight: 46,
    letterSpacing: -1.5,
    marginBottom: 14,
  },
  heroAccent: {
    color: theme.colors.primary,
  },
  heroSub: {
    fontSize: 15,
    color: theme.colors.muted,
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: width * 0.85,
  },

  // CTAs
  ctaPrimary: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaPrimaryText: {
    color: theme.colors.onPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  ctaSecondary: {
    paddingVertical: 13,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceVariant,
  },
  ctaSecondaryText: {
    color: theme.colors.muted,
    fontWeight: '600',
    fontSize: 15,
  },

  // Section divider label
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginBottom: 16,
    marginTop: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.surfaceVariant,
  },
  sectionLabelText: {
    marginHorizontal: 10,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Chips
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    gap: 8,
    marginBottom: 28,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
    gap: 6,
  },
  chipIcon: { fontSize: 16 },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },

  // Stats
  statsStrip: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingVertical: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.surfaceVariant,
    marginVertical: 4,
  },

  // Cards
  cardsSection: {
    paddingHorizontal: theme.spacing.md,
    gap: 12,
    marginBottom: 28,
  },
  card: {
    borderRadius: theme.radii.md,
    padding: 20,
    borderWidth: 1,
  },
  cardWorker: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceVariant,
  },
  cardEmployer: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceVariant,
  },
  cardEmoji: { fontSize: 28, marginBottom: 10 },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    color: theme.colors.muted,
    lineHeight: 20,
  },

  // Footer
  footer: {
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: theme.colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
});
