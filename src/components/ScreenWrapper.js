import React from 'react';
import { View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';

const ScreenWrapper = ({ children, style, scrollable = true }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {scrollable ? (
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={[styles.content, style]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={true}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, style]}>
            {children}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  content: {
    flexGrow: 1,
    width: '100%',
    alignSelf: 'center',
    maxWidth: theme.layout.maxContentWidth,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm + theme.spacing.xs / 2,
    alignItems: 'center',
  },
});

export default ScreenWrapper;