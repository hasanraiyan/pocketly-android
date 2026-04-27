import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Swiper from 'react-native-swiper';
import * as SecureStore from 'expo-secure-store';
import Button from '../components/common/Button';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleComplete = async () => {
    await SecureStore.setItemAsync('onboarding_completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const pages = [
    {
      title: 'Welcome to Pocketly',
      subtitle: 'Your personal finance companion',
      description: 'Track expenses, manage budgets, and gain insights into your spending habits.',
      icon: '👋',
    },
    {
      title: 'Powerful Features',
      subtitle: 'Everything you need to manage money',
      features: [
        '📊 Analyze spending patterns with charts',
        '💳 Manage multiple accounts seamlessly',
        '📝 Record transactions with ease',
        '🎯 Set budgets and track progress',
        '🤖 Chat with AI for financial advice',
      ],
    },
    {
      title: "Let's Get Started",
      subtitle: 'Connect your Pocketly server',
      description: 'Connect your Pocketly server to begin managing your finances.',
      showButton: true,
    },
  ];

  const renderPage = (page, index) => (
    <View key={index} style={styles.page}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/pocketly.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.icon}>{page.icon}</Text>
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.subtitle}>{page.subtitle}</Text>

        {page.description && (
          <Text style={styles.description}>{page.description}</Text>
        )}

        {page.features && (
          <View style={styles.features}>
            {page.features.map((feature, idx) => (
              <Text key={idx} style={styles.feature}>
                {feature}
              </Text>
            ))}
          </View>
        )}

        {page.showButton && (
          <Button
            title="Get Started"
            onPress={handleComplete}
            style={styles.button}
          />
        )}
      </View>

      {index < pages.length - 1 && (
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Swiper
        style={styles.wrapper}
        showsButtons={false}
        loop={false}
        onIndexChanged={setCurrentIndex}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
      >
        {pages.map(renderPage)}
      </Swiper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f5f2',
  },
  wrapper: {},
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    marginBottom: 48,
  },
  logo: {
    width: 120,
    height: 120,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 40,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f644e',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#7c8e88',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#7c8e88',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  feature: {
    fontSize: 16,
    color: '#1e3a34',
    lineHeight: 28,
    marginBottom: 12,
  },
  button: {
    marginTop: 32,
    width: '80%',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 32,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#7c8e88',
    fontWeight: '600',
  },
  dot: {
    backgroundColor: '#e5e3d8',
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 4,
  },
  activeDot: {
    backgroundColor: '#1f644e',
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 4,
  },
});