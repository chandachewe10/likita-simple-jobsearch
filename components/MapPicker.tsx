import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function MapPicker({ tempLocation, setTempLocation }: any) {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: tempLocation.latitude,
        longitude: tempLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      onPress={(e) => setTempLocation(e.nativeEvent.coordinate)}
    >
      <Marker coordinate={tempLocation} />
    </MapView>
  );
}
