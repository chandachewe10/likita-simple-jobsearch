import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider, useData } from './hooks/useData';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import EmployeeHome from './screens/EmployeeHome';
import EmployerHome from './screens/EmployerHome';
import PostJob from './screens/PostJob';
import ApplicantsScreen from './screens/ApplicantsScreen';
import ProfileScreen from './screens/ProfileScreen';
import theme from './lib/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function EmployeeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmployeeHome" component={EmployeeHome} />
    </Stack.Navigator>
  );
}

function EmployerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmployerHome" component={EmployerHome} />
      <Stack.Screen name="PostJob" component={PostJob} />
      <Stack.Screen name="Applicants" component={ApplicantsScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function RootNavigation() {
  const { currentUser, loading } = useData();
  if (loading) return null; // or a splash

  if (!currentUser) {
    return <AuthStack />;
  }

  if (currentUser.role === 'employee') {
    return (
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Jobs" component={EmployeeStack} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Jobs" component={EmployerStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <DataProvider>
        <NavigationContainer>
          <RootNavigation />
        </NavigationContainer>
      </DataProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });