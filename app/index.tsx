import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
//import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#333' }}>gm!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
});
