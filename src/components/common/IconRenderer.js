import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

/**
 * Common ground for icons between Web (Lucide) and Android (Ionicons/MCI).
 * Maps Lucide-style icon names to the best available mobile equivalents.
 */

export const getIconDetails = (name) => {
  if (!name) return { library: Ionicons, name: 'ellipse-outline' };
  
  const cleanName = name.toLowerCase().replace(/[-_]/g, ' ');

  // 1. Custom / Financial Entities
  if (cleanName.includes('rupay')) return { library: MaterialCommunityIcons, name: 'credit-card-chip' };
  if (cleanName.includes('ippb') || cleanName.includes('pnb') || cleanName.includes('bank') || cleanName.includes('landmark')) {
    return { library: FontAwesome5, name: 'university' };
  }
  if (cleanName.includes('purse')) return { library: Ionicons, name: 'wallet' };

  // 2. Common Lucide -> Ionicons Mapping
  if (cleanName.includes('shopping') || cleanName.includes('cart') || cleanName.includes('bag')) return { library: Ionicons, name: 'cart' };
  if (cleanName.includes('food') || cleanName.includes('pizza') || cleanName.includes('utensils') || cleanName.includes('restaurant') || cleanName.includes('dining') || cleanName.includes('coffee') || cleanName.includes('cafe')) return { library: Ionicons, name: 'fast-food' };
  if (cleanName.includes('car') || cleanName.includes('bus') || cleanName.includes('train') || cleanName.includes('transport') || cleanName.includes('fuel') || cleanName.includes('gas') || cleanName.includes('travel')) return { library: Ionicons, name: 'car' };
  if (cleanName.includes('home') || cleanName.includes('house') || cleanName.includes('rent')) return { library: Ionicons, name: 'home' };
  if (cleanName.includes('bill') || cleanName.includes('utility') || cleanName.includes('water') || cleanName.includes('electricity') || cleanName.includes('receipt')) return { library: Ionicons, name: 'receipt' };
  if (cleanName.includes('health') || cleanName.includes('heart') || cleanName.includes('medical') || cleanName.includes('fitness') || cleanName.includes('gym')) return { library: Ionicons, name: 'heart' };
  if (cleanName.includes('gift') || cleanName.includes('present') || cleanName.includes('birthday')) return { library: Ionicons, name: 'gift' };
  if (cleanName.includes('salary') || cleanName.includes('income')) return { library: Ionicons, name: 'wallet' };
  if (cleanName.includes('cash') || cleanName.includes('money')) return { library: Ionicons, name: 'cash' };
  if (cleanName.includes('laptop')) return { library: Ionicons, name: 'laptop' };
  if (cleanName.includes('freelance') || cleanName.includes('free lance') || cleanName.includes('work') || cleanName.includes('office') || cleanName.includes('business') || cleanName.includes('briefcase')) return { library: Ionicons, name: 'briefcase' };
  if (cleanName.includes('award') || cleanName.includes('trophy') || cleanName.includes('prize')) return { library: Ionicons, name: 'trophy' };
  if (cleanName.includes('entertainment') || cleanName.includes('play') || cleanName.includes('game') || cleanName.includes('movie') || cleanName.includes('music') || cleanName.includes('hobby') || cleanName.includes('film')) return { library: Ionicons, name: 'film' };
  if (cleanName.includes('social') || cleanName.includes('people') || cleanName.includes('friends') || cleanName.includes('group') || cleanName.includes('users')) return { library: Ionicons, name: 'people' };
  if (cleanName.includes('education') || cleanName.includes('book') || cleanName.includes('school') || cleanName.includes('learning')) return { library: Ionicons, name: 'book' };
  if (cleanName.includes('wallet') || cleanName.includes('savings')) return { library: Ionicons, name: 'wallet' };
  if (cleanName.includes('tax') || cleanName.includes('government')) return { library: Ionicons, name: 'receipt' };
  if (cleanName.includes('trending up')) return { library: Ionicons, name: 'trending-up' };
  if (cleanName.includes('trending down')) return { library: Ionicons, name: 'trending-down' };
  if (cleanName.includes('swap') || cleanName.includes('arrow left right')) return { library: Ionicons, name: 'swap-horizontal' };
  if (cleanName.includes('target')) return { library: Ionicons, name: 'disc' };
  if (cleanName.includes('tag') || cleanName.includes('pricetag')) return { library: Ionicons, name: 'pricetag' };
  if (cleanName.includes('pencil') || cleanName.includes('edit')) return { library: Ionicons, name: 'pencil' };
  if (cleanName.includes('trash') || cleanName.includes('delete')) return { library: Ionicons, name: 'trash' };
  if (cleanName.includes('settings') || cleanName.includes('gear')) return { library: Ionicons, name: 'settings' };
  if (cleanName.includes('chart') || cleanName.includes('bar')) return { library: Ionicons, name: 'bar-chart' };

  // Fallback
  return { library: Ionicons, name: 'ellipse-outline' };
};

export default function IconRenderer({ name, size = 20, color = '#1e3a34', style }) {
  const { library: IconLib, name: iconName } = getIconDetails(name);
  
  return (
    <View style={[styles.container, style]}>
      <IconLib name={iconName} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
