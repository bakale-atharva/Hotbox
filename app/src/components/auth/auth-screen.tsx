import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Shared scaffold for sign-in and sign-up: brand mark, title, form. */
export function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 24,
          gap: 28,
          width: '100%',
          maxWidth: 440,
          alignSelf: 'center',
        }}>
        <View style={{ alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              borderCurve: 'continuous',
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 24px rgba(228, 87, 46, 0.35)',
            }}>
            <Text accessible={false} style={{ fontSize: 38 }}>
              🍕
            </Text>
          </View>
          <Text style={{ color: theme.text, fontSize: 30, fontWeight: '800' }}>
            Hot<Text style={{ color: theme.primary }}>box</Text>
          </Text>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700' }}>{title}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 15, textAlign: 'center' }}>{subtitle}</Text>
          </View>
        </View>
        <View style={{ gap: 14 }}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
