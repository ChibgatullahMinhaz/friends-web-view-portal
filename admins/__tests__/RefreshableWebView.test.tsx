import React from 'react';
import {Platform, RefreshControl, ScrollView} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {WebView, type WebViewProps} from 'react-native-webview';
import RefreshableWebView from '../RefreshableWebView';

const mockReload = jest.fn();

jest.mock('react-native-webview', () => {
  const ReactModule: typeof React = require('react');
  return {
    WebView: ReactModule.forwardRef((props, ref) => {
      ReactModule.useImperativeHandle(ref, () => ({reload: mockReload}));
      return ReactModule.createElement('MockWebView', props);
    }),
  };
});

const source = {uri: 'https://example.com/page'};
let renderer: ReactTestRenderer.ReactTestRenderer;

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'android');
  mockReload.mockClear();
});

afterEach(() => {
  act(() => renderer.unmount());
  jest.restoreAllMocks();
});

function render(props: React.ComponentProps<typeof RefreshableWebView> = {}) {
  act(() => {
    renderer = ReactTestRenderer.create(
      <RefreshableWebView source={source} {...props} />,
    );
  });
}

function webView() {
  return renderer.root.findByType(WebView);
}

function refreshControl() {
  return renderer.root.findByType(RefreshControl);
}

test('refreshes the current WebView once without changing its source', () => {
  render();
  expect(refreshControl().props.enabled).toBe(true);
  act(() => webView().props.onLoadEnd({nativeEvent: {}}));
  expect(refreshControl().props.enabled).toBe(true);
  const instance = webView();
  const refresh = refreshControl().props.onRefresh;

  act(() => {
    refresh();
    refresh();
  });

  expect(mockReload).toHaveBeenCalledTimes(1);
  expect(refreshControl().props.refreshing).toBe(true);
  expect(refreshControl().props.enabled).toBe(true);
  expect(webView()).toBe(instance);
  expect(webView().props.source).toBe(source);
  expect(renderer.root.findByType(ScrollView).props.scrollEnabled).toBe(true);

  act(() => webView().props.onLoadEnd({nativeEvent: {}}));
  expect(refreshControl().props.refreshing).toBe(false);
  expect(refreshControl().props.enabled).toBe(true);
});

test('only enables refresh at the top and preserves scroll callbacks', () => {
  const onScroll = jest.fn();
  render({onScroll});
  act(() => webView().props.onLoadEnd({nativeEvent: {}}));
  const scrollEvent = {nativeEvent: {contentOffset: {x: 0, y: 100}}};

  act(() => webView().props.onScroll(scrollEvent));
  expect(onScroll).toHaveBeenCalledWith(scrollEvent);
  expect(refreshControl().props.enabled).toBe(false);
  expect(renderer.root.findByType(ScrollView).props.scrollEnabled).toBe(false);
  act(() => refreshControl().props.onRefresh());
  expect(mockReload).not.toHaveBeenCalled();

  act(() =>
    webView().props.onScroll({nativeEvent: {contentOffset: {x: 0, y: 0}}}),
  );
  expect(refreshControl().props.enabled).toBe(true);
  expect(renderer.root.findByType(ScrollView).props.scrollEnabled).toBe(true);
});

test('external reload keeps its ref and callbacks without duplicate reloads', () => {
  const webViewRef = React.createRef<WebView<WebViewProps>>();
  const onLoadStart = jest.fn();
  const onLoadEnd = jest.fn();
  render({webViewRef, onLoadStart, onLoadEnd});
  act(() => webView().props.onLoadEnd({nativeEvent: {}}));
  onLoadEnd.mockClear();

  act(() => webViewRef.current?.reload());
  const startEvent = {nativeEvent: {url: source.uri}};
  act(() => webView().props.onLoadStart(startEvent));
  expect(mockReload).toHaveBeenCalledTimes(1);
  expect(onLoadStart).toHaveBeenCalledWith(startEvent);
  expect(refreshControl().props.refreshing).toBe(false);

  const errorEndEvent = {nativeEvent: {description: 'Network error'}};
  act(() => webView().props.onLoadEnd(errorEndEvent));
  expect(onLoadEnd).toHaveBeenCalledWith(errorEndEvent);
  expect(refreshControl().props.enabled).toBe(true);
});

test('allows pulling before load completion so a stalled page can be reloaded', () => {
  render();
  act(() => webView().props.onLoadStart({nativeEvent: {}}));
  expect(refreshControl().props.enabled).toBe(true);
  act(() => refreshControl().props.onRefresh());
  expect(mockReload).toHaveBeenCalledTimes(1);
  expect(refreshControl().props.refreshing).toBe(true);
});

test('clears the pull spinner when a reload ends with an error', () => {
  render();
  act(() => webView().props.onLoadEnd({nativeEvent: {}}));
  act(() => refreshControl().props.onRefresh());
  act(() =>
    webView().props.onLoadEnd({nativeEvent: {description: 'Network error'}}),
  );
  expect(refreshControl().props.refreshing).toBe(false);
});

test('uses native iOS refresh without an outer scroll view', () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  const onScroll = jest.fn();
  render({onScroll});
  expect(webView().props.pullToRefreshEnabled).toBe(true);
  expect(webView().props.onScroll).toBe(onScroll);
  expect(renderer.root.findAllByType(ScrollView)).toHaveLength(0);
  expect(renderer.root.findAllByType(RefreshControl)).toHaveLength(0);
});
