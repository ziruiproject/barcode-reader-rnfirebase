import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function ReaderScanner() {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getBarCodeScannerPermissions();
    }, []);

    const handleBarCodeScanned = async ({ type, data }) => {
        setScanned(true);
        const userUID = FIREBASE_AUTH.currentUser.uid;

        alert(`Bar code with type ${type} and data ${data} has been scanned by ${userUID}!`);

        // Reference to the user's collection of scannedHistories
        const userScannedHistoriesRef = collection(FIRESTORE_DB, `users/${userUID}/scannedHistories`);

        // Add a new document with the scanned data
        await addDoc(userScannedHistoriesRef, {
            type,
            data,
            timestamp: serverTimestamp(),
        });


    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
            {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
});
