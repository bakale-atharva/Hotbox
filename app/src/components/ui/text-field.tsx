import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function TextField({
  label,
  error,
  hint,
  style,
  ...props
}: TextInputProps & { label: string; error?: string; hint?: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[
          {
            minHeight: 48,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: Radius.md,
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: error ? theme.destructive : theme.input,
            backgroundColor: theme.card,
            color: theme.text,
            fontSize: 16,
          },
          props.multiline && { minHeight: 80, textAlignVertical: 'top' },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text selectable style={{ color: theme.destructive, fontSize: 13 }}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{hint}</Text>
      ) : null}
    </View>
  );
}
