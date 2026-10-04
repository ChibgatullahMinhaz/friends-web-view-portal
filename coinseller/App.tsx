import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Linking, 
  StatusBar,
  ScrollView,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { styles } from './src/styles/style';
import RefreshableWebView from './RefreshableWebView';

export default function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const openSettings = () => {
    Linking.openSettings();
  };

  const checkConnectionStatus = () => {
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      setRefreshing(false);
    });
  }, []);

  if (isConnected === false) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        
        <ScrollView 
          contentContainerStyle={styles.offlineContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
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
            <TouchableOpacity style={styles.okButton} onPress={checkConnectionStatus}>
              <Text style={styles.okText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <RefreshableWebView
          source={{ uri: 'https://friends-live-coinseller.web.app' }}
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
