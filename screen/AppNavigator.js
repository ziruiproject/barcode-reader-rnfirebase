import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth'; // Import Firebase authentication functions
import ReaderScanner from './ReaderScreen';
import LoginScreen from './LoginScreen';
import { FIREBASE_AUTH } from '../firebase';

const Stack = createNativeStackNavigator();

const App = () => {
    const [user, setUser] = useState(null);
    const auth = FIREBASE_AUTH

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            setUser(authUser);
        });

        return () => unsubscribe();
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {user ? (
                    <Stack.Screen name="ReaderScanner" component={ReaderScanner} />
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
