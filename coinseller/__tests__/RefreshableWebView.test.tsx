import React from 'react';
import {Platform, RefreshControl, ScrollView} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {WebView} from 'react-native-webview';
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
    renderer = ReactTestRenderer.create(<RefreshableWebView {...props} />);
  });
}

function webView() {
  return renderer.root.findByType(WebView);
}

function refreshControl() {
  return renderer.root.findByType(RefreshControl);
}

test('reloads the WebView on pull and clears refreshing when loading ends', () => {
  render();
  act(() => refreshControl().props.onRefresh());
  expect(mockReload).toHaveBeenCalledTimes(1);
  expect(refreshControl().props.refreshing).toBe(true);

  act(() => webView().props.onLoadEnd({nativeEvent: {}}));
  expect(refreshControl().props.refreshing).toBe(false);
});

test('only allows pull-to-refresh when the WebView is at the top', () => {
  const onScroll = jest.fn();
  render({onScroll});
  const scrollEvent = {nativeEvent: {contentOffset: {x: 0, y: 100}}};

  act(() => webView().props.onScroll(scrollEvent));
  expect(onScroll).toHaveBeenCalledWith(scrollEvent);
  expect(refreshControl().props.enabled).toBe(false);
  expect(renderer.root.findByType(ScrollView).props.scrollEnabled).toBe(false);

  act(() =>
    webView().props.onScroll({nativeEvent: {contentOffset: {x: 0, y: 0}}}),
  );
  expect(refreshControl().props.enabled).toBe(true);
  expect(renderer.root.findByType(ScrollView).props.scrollEnabled).toBe(true);
});

test('uses the native pull-to-refresh control on iOS', () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  render();

  expect(webView().props.pullToRefreshEnabled).toBe(true);
  expect(renderer.root.findAllByType(ScrollView)).toHaveLength(0);
  expect(renderer.root.findAllByType(RefreshControl)).toHaveLength(0);
});
