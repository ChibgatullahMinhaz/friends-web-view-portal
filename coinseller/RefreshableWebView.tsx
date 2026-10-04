import React, {useCallback, useRef, useState} from 'react';
import {Platform, RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {WebView, type WebViewProps} from 'react-native-webview';

export default function RefreshableWebView({
  onScroll,
  onLoadEnd,
  ...props
}: WebViewProps) {
  const webViewRef = useRef<WebView<WebViewProps>>(null);
  const refreshInProgress = useRef(false);
  const atTop = useRef(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    if (refreshInProgress.current || !atTop.current || !webViewRef.current) {
      return;
    }

    refreshInProgress.current = true;
    setRefreshing(true);
    webViewRef.current.reload();
  }, []);

  const handleScroll: NonNullable<WebViewProps['onScroll']> = useCallback(
    event => {
      const nextAtTop = event.nativeEvent.contentOffset.y <= 0;
      if (atTop.current !== nextAtTop) {
        atTop.current = nextAtTop;
        setIsAtTop(nextAtTop);
      }
      onScroll?.(event);
    },
    [onScroll],
  );

  const handleLoadEnd: NonNullable<WebViewProps['onLoadEnd']> = useCallback(
    event => {
      refreshInProgress.current = false;
      setRefreshing(false);
      onLoadEnd?.(event);
    },
    [onLoadEnd],
  );

  const webView = (
    <WebView
      {...props}
      ref={webViewRef}
      pullToRefreshEnabled={Platform.OS === 'ios'}
      onScroll={Platform.OS === 'android' ? handleScroll : onScroll}
      onLoadEnd={handleLoadEnd}
    />
  );

  if (Platform.OS !== 'android') {
    return webView;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.container}
      scrollEnabled={isAtTop}
      overScrollMode="never"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          enabled={refreshing || isAtTop}
          onRefresh={handleRefresh}
        />
      }>
      {webView}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
