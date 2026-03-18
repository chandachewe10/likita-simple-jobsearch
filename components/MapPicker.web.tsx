import React from 'react';
import { View, Text } from 'react-native';

export default function MapPicker({ tempLocation, setTempLocation }: any) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Interactive Maps are not fully supported on Web.</Text>
      <Text style={{ marginTop: 8 }}>Please use the mobile app (iOS/Android) to pick a GPS location natively.</Text>
    </View>
  );
}
