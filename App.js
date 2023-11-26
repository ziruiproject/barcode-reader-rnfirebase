import React from 'react'
import { Text, StyleSheet, View, TextInput, Button } from 'react-native';
import { FIREBASE, FIREBASE_AUTH } from './firebase'

const App = () => {
  const auth = FIREBASE_AUTH
  return (
    <View>
      <TextInput>
        halo
      </TextInput>
    </View>
  )
}
export default App