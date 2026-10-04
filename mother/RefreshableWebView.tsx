import React, {useCallback, useRef, useState} from 'react';
import {Platform, RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {WebView, type WebViewProps} from 'react-native-webview';

type Props = WebViewProps & {
  webViewRef?: React.RefObject<WebView<WebViewProps> | null>;
};

export default function RefreshableWebView({
  webViewRef,
  onScroll,
  onLoadStart,
  onLoadEnd,
  ...props
}: Props) {
  const internalRef = useRef<WebView<WebViewProps>>(null);
  const ref = webViewRef ?? internalRef;
  const refreshInProgress = useRef(false);
  const atTop = useRef(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    if (refreshInProgress.current || !atTop.current || !ref.current) {
      return;
    }

    refreshInProgress.current = true;
    setRefreshing(true);
    ref.current.reload();
  }, [ref]);

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

  const handleLoadStart: NonNullable<WebViewProps['onLoadStart']> = useCallback(
    event => {
      onLoadStart?.(event);
    },
    [onLoadStart],
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
      pullToRefreshEnabled={Platform.OS === 'ios'}
      {...props}
      ref={ref}
      onScroll={Platform.OS === 'android' ? handleScroll : onScroll}
      onLoadStart={handleLoadStart}
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
