import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LikitaLogo from './LikitaLogo';
import theme from '../lib/theme';

type Props = {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  backLabel?: string;
  rightAction?: React.ReactNode;
};

export default function AppHeader({
  title,
  subtitle,
  showLogo = false,
  showBack,
  onBack,
  backLabel = 'Back',
  rightAction,
}: Props) {
  const navigation = useNavigation<any>();
  const canGoBack = navigation.canGoBack?.() ?? false;
  const displayBack = showBack ?? canGoBack;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {displayBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={backLabel}
          >
            <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
            <Text style={styles.backText}>{backLabel}</Text>
          </TouchableOpacity>
        ) : showLogo ? (
          <LikitaLogo size="md" />
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        {title ? (
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.titleSpacer} />
        )}

        <View style={styles.right}>{rightAction ?? <View style={styles.backPlaceholder} />}</View>
      </View>
      {showLogo && displayBack && (
        <View style={styles.logoBelow}>
          <LikitaLogo size="sm" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    minHeight: 56,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 72,
    paddingVertical: 4,
    paddingRight: 8,
  },
  backText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 15,
    marginLeft: -2,
  },
  backPlaceholder: {
    minWidth: 72,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  titleSpacer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  right: {
    minWidth: 72,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  logoBelow: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceVariant,
  },
});
