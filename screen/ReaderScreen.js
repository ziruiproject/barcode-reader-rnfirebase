import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Modal, FlatList } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebase';
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

export default function ReaderScanner() {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [scannedHistory, setScannedHistory] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        getBarCodeScannerPermissions();

        const unsubscribe = fetchScannedHistory();

        // Clean up the listener when the component unmounts
        return () => unsubscribe();

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

    const fetchScannedHistory = () => {
        const userUID = FIREBASE_AUTH.currentUser.uid;
        const userScannedHistoriesRef = collection(FIRESTORE_DB, `users/${userUID}/scannedHistories`);
        const q = query(userScannedHistoriesRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const histories = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                timestamp: doc.data().timestamp,
                ...doc.data(),
            }));

            setScannedHistory(histories);
        });

        // Return the unsubscribe function to stop listening when the component unmounts
        return unsubscribe;
    };

    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
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
            <View style={styles.buttonContainer}>
                <Button title="Show Scanned History" onPress={openModal} />
            </View>
            {/* Button to show scanned history */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <FlatList
                            data={scannedHistory}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View>
                                    <Text>Type: {item.type}</Text>
                                    <Text>Data: {item.data}</Text>
                                    <Text>Timestamp: {item.timestamp.toDate().toString()}</Text>
                                </View>
                            )}
                        />
                        <Button title="Close" onPress={closeModal} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff', // White background
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 16,
    },
    list: {
        marginTop: 20,
    },
    item: {
        backgroundColor: '#f0f0f0', // Light gray background for each item
        padding: 10,
        marginVertical: 8,
        borderRadius: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        elevation: 5,
    },
    buttonContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'white', // Adjust the background color as needed
        zIndex: 1,
    },
});
