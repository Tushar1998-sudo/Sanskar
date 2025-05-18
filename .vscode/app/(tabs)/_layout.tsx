import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Image } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: '#000000', // Black Tab Bar
          height: 55,
        },
        tabBarLabelStyle: {
          marginTop: 2, // Adds 2px gap between icon and text
        },
      }}
    >
      {/* 🏠 Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/namaste.png')}
              style={{
                width: 24,
                height: 24,
                borderRadius: 14, // Makes it round
                backgroundColor: 'white', // Optional background
              }}
            />
          ),
        }}
      />

      {/* 📄 PDFs Tab */}
      <Tabs.Screen
        name="pdfs"
        options={{
          title: 'PDFs',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/pdflogo.png')}
              style={{
                width: 24,
                height: 24,
                borderRadius: 14,
                backgroundColor: 'white',
              }}
            />
          ),
        }}
      />

      {/* 🎥 YouTube Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'YouTube',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/youtubeLogo.png')}
              style={{
                width: 24,
                height: 24,
                borderRadius: 14, // Makes it round
                backgroundColor: 'white',
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
