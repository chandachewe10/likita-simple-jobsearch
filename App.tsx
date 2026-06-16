import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DataProvider, useData } from './hooks/useData';
import { isProfileComplete } from './lib/profile';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import EmployeeHome from './screens/EmployeeHome';
import EmployerHome from './screens/EmployerHome';
import PostJob from './screens/PostJob';
import ApplicantsScreen from './screens/ApplicantsScreen';
import FindWorkersScreen from './screens/FindWorkersScreen';
import ApplyJobScreen from './screens/ApplyJobScreen';
import ProfileScreen from './screens/ProfileScreen';
import theme from './lib/theme';
import { linking } from './lib/linking';
import { useWebLayout } from './lib/setupWebLayout';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const stackScreenOptions = {
  headerShown: false,
  contentStyle: { flex: 1, backgroundColor: theme.colors.background },
};

function EmployeeStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="EmployeeHome" component={EmployeeHome} />
      <Stack.Screen name="ApplyJob" component={ApplyJobScreen} />
    </Stack.Navigator>
  );
}

function EmployerStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="EmployerHome" component={EmployerHome} />
      <Stack.Screen name="FindWorkers" component={FindWorkersScreen} />
      <Stack.Screen name="PostJob" component={PostJob} />
      <Stack.Screen name="Applicants" component={ApplicantsScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

const tabScreenOptions = ({ route }: { route: { name: string } }) => ({
  headerShown: false,
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.muted,
  tabBarLabelStyle: {
    fontSize: theme.type.tab,
    fontWeight: '600' as const,
    marginBottom: Platform.OS === 'ios' ? 0 : 4,
  },
  sceneContainerStyle: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabBarStyle: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.surfaceVariant,
    borderTopWidth: 1,
    paddingTop: 6,
    elevation: 0,
  },
  tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
    let iconName: keyof typeof Ionicons.glyphMap = 'briefcase-outline';
    if (route.name === 'Jobs') {
      iconName = focused ? 'briefcase' : 'briefcase-outline';
    } else if (route.name === 'Profile') {
      iconName = focused ? 'person' : 'person-outline';
    }
    return <Ionicons name={iconName} size={size + 4} color={color} />;
  },
});

function RootNavigation() {
  const { currentUser, loading } = useData();

  if (loading) return null;

  if (!currentUser) {
    return <AuthStack />;
  }

  if (currentUser.role === 'employee') {
    const initialTab = isProfileComplete(currentUser) ? 'Jobs' : 'Profile';
    return (
      <Tab.Navigator
        key={`employee-${currentUser.id}-${initialTab}`}
        initialRouteName={initialTab}
        screenOptions={tabScreenOptions}
      >
        <Tab.Screen name="Jobs" component={EmployeeStack} options={{ title: 'Jobs' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Tab.Navigator>
    );
  }

  const initialTab = isProfileComplete(currentUser) ? 'Jobs' : 'Profile';
  return (
    <Tab.Navigator
      key={`employer-${currentUser.id}-${initialTab}`}
      initialRouteName={initialTab}
      screenOptions={tabScreenOptions}
    >
      <Tab.Screen name="Jobs" component={EmployerStack} options={{ title: 'My Jobs' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  useWebLayout();

  return (
    <SafeAreaProvider style={styles.safeRoot}>
      <View style={styles.frame}>
        <DataProvider>
          <View style={styles.navHost}>
            <NavigationContainer linking={linking}>
              <RootNavigation />
            </NavigationContainer>
          </View>
        </DataProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.background,
    ...Platform.select({
      web: { minHeight: '100vh' as unknown as number },
      default: {},
    }),
  },
  frame: {
    flex: 1,
    width: '100%',
  },
  navHost: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
});
