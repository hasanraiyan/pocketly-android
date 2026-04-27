import { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import * as SecureStore from 'expo-secure-store';

import Button from '../components/common/Button';

const pages = [
  {
    title: 'Welcome to Pocketly',
    subtitle: 'A calmer way to stay on top of your money',
    description:
      'Track spending, organize budgets, and keep your daily finances clear without the usual clutter.',
    icon: 'wallet-outline',
    accent: '#1f644e',
    panel: '#dceee6',
    eyebrow: 'Smart finance, simplified',
  },
  {
    title: 'See what matters fast',
    subtitle: 'Useful tools, clean signals, less friction',
    description:
      'Get a quick read on spending, accounts, and budgets with a setup that is easy to scan and easy to trust.',
    icon: 'chart-donut',
    accent: '#2d7a62',
    panel: '#e5f4ec',
    features: [
      { icon: 'chart-box-outline', text: 'Spot spending patterns with clear visual summaries' },
      { icon: 'bank-outline', text: 'Manage multiple accounts in one tidy flow' },
      { icon: 'clipboard-text-outline', text: 'Log transactions quickly without extra taps' },
      { icon: 'target-variant', text: 'Set goals and watch budget progress build up' },
    ],
  },
  {
    title: 'Ready when you are',
    subtitle: 'Connect your Pocketly server and start using the app',
    description:
      'Finish setup in a moment, then jump straight into your dashboard and transaction history.',
    icon: 'cloud-check-outline',
    accent: '#175341',
    panel: '#d8ebe3',
    showButton: true,
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  const compactLayout = height < 760;

  const handleComplete = async () => {
    await SecureStore.setItemAsync('onboarding_completed', 'true');
    onComplete();
  };

  const activePage = pages[currentIndex];

  const renderPage = (page, index) => {
    const isLastPage = index === pages.length - 1;

    return (
      <SafeAreaView key={page.title} style={styles.page} edges={['top', 'bottom']}>
        <View
          style={[
            styles.pageContent,
            compactLayout ? styles.pageContentCompact : styles.pageContentRegular,
          ]}
        >
          <View style={styles.topRow}>
            <View style={[styles.progressPill, { backgroundColor: page.panel }]}>
              <Text style={[styles.progressText, { color: page.accent }]}>
                {`0${index + 1} / 0${pages.length}`}
              </Text>
            </View>

            {!isLastPage && (
              <TouchableOpacity onPress={handleComplete} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.heroCard, compactLayout && styles.heroCardCompact]}>
            <View style={[styles.logoFrame, { backgroundColor: page.panel }]}>
              <Image
                source={require('../../assets/pocketly.png')}
                style={[styles.logoImage, compactLayout && styles.logoImageCompact]}
                resizeMode="contain"
              />
              <View style={[styles.logoBadge, { backgroundColor: '#ffffff' }]}>
                <MaterialCommunityIcons
                  name={page.icon}
                  size={compactLayout ? 18 : 20}
                  color={page.accent}
                />
              </View>
            </View>

            <Text style={[styles.eyebrow, { color: page.accent }]}>
              {page.eyebrow || 'Pocketly onboarding'}
            </Text>
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.subtitle}>{page.subtitle}</Text>

            {page.description ? <Text style={styles.description}>{page.description}</Text> : null}
          </View>

          {page.features ? (
            <View style={styles.featuresCard}>
              {page.features.map((feature) => (
                <View key={feature.text} style={styles.featureRow}>
                  <View style={[styles.featureIconWrap, { backgroundColor: page.panel }]}>
                    <MaterialCommunityIcons
                      name={feature.icon}
                      size={18}
                      color={page.accent}
                    />
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.infoStrip}>
              <View style={styles.infoBlock}>
                <Text style={styles.infoValue}>Budgets</Text>
                <Text style={styles.infoLabel}>Plan with clarity</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoBlock}>
                <Text style={styles.infoValue}>Insights</Text>
                <Text style={styles.infoLabel}>Catch trends early</Text>
              </View>
            </View>
          )}

          {page.showButton ? (
            <View style={styles.ctaSection}>
              <Button title="Connect and continue" onPress={handleComplete} style={styles.button} />
              <Text style={styles.footerText}>
                You can change your server details later from settings.
              </Text>
            </View>
          ) : (
            <View style={styles.swipeHint}>
              <Text style={styles.swipeHintText}>Swipe to continue</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#6a7f77" />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.backgroundBand, { backgroundColor: activePage.panel }]} />
      <Swiper
        style={styles.wrapper}
        showsButtons={false}
        loop={false}
        onIndexChanged={setCurrentIndex}
        dotStyle={styles.dot}
        activeDotStyle={[styles.activeDot, { backgroundColor: activePage.accent }]}
      >
        {pages.map(renderPage)}
      </Swiper>
      <View
        pointerEvents="none"
        style={[
          styles.bottomFade,
          {
            width: Math.min(width - 48, 360),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7faf8',
  },
  wrapper: {},
  backgroundBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  page: {
    flex: 1,
  },
  pageContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  pageContentCompact: {
    paddingTop: 8,
  },
  pageContentRegular: {
    paddingTop: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  skipButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  skipText: {
    color: '#45665b',
    fontSize: 15,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginTop: 18,
    gap: 14,
    boxShadow: '0 16px 36px rgba(22, 53, 43, 0.10)',
  },
  heroCardCompact: {
    paddingVertical: 22,
  },
  logoFrame: {
    width: 112,
    height: 112,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoImage: {
    width: 76,
    height: 76,
  },
  logoImageCompact: {
    width: 68,
    height: 68,
  },
  logoBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 18px rgba(22, 53, 43, 0.12)',
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: '#12352c',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    color: '#3e5c52',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5f756c',
  },
  featuresCard: {
    flexShrink: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 18,
    gap: 14,
    marginTop: 18,
    boxShadow: '0 12px 28px rgba(15, 39, 32, 0.08)',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  featureText: {
    flex: 1,
    color: '#214237',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  infoStrip: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginTop: 18,
    alignItems: 'center',
    boxShadow: '0 12px 28px rgba(15, 39, 32, 0.08)',
  },
  infoBlock: {
    flex: 1,
    gap: 4,
  },
  infoDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#e2ece7',
    marginHorizontal: 16,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#16382f',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7f77',
  },
  ctaSection: {
    gap: 14,
    marginTop: 'auto',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
  },
  footerText: {
    textAlign: 'center',
    color: '#688078',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 'auto',
    paddingTop: 16,
    minHeight: 48,
  },
  swipeHintText: {
    color: '#6a7f77',
    fontSize: 14,
    fontWeight: '600',
  },
  dot: {
    backgroundColor: 'rgba(35, 73, 60, 0.18)',
    width: 8,
    height: 8,
    borderRadius: 999,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 999,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  bottomFade: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 10,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 28,
    zIndex: -1,
  },
});
