import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';

export default function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const openSettings = () => {
    Linking.openSettings();
  };

  const handleOk = () => {
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });
  };

  if (isConnected === false) {
    return (
      <SafeAreaView style={styles.offlineContainer}>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.centerContent}>
          <View style={styles.iconOuterCircle}>
            <View style={styles.iconInnerCircle}>
              <Text style={styles.wifiIcon}>📶</Text>
            </View>
          </View>

          <Text style={styles.title}>You're offline!</Text>
          <Text style={styles.subtitle}>
            Turn on mobile data or connect to a Wi-Fi. Or just take a break and go for a walk!
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.settingsButton} onPress={openSettings}>
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.okButton} onPress={handleOk}>
            <Text style={styles.okText}>Ok</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <WebView
          source={{ uri: 'https://friends-live-1.web.app' }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  offlineContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconOuterCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconInnerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFA89B', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  wifiIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  settingsButton: {
    backgroundColor: '#F2F2F2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  okButton: {
    backgroundColor: '#1E232D',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  okText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});