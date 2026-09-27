import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/utils/haptics';

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  compact,
  label = 'Quantity',
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
  label?: string;
}) {
  const theme = useTheme();

  const step = (delta: 1 | -1) => {
    const next = Math.min(Math.max(value + delta, min), max);
    if (next !== value) {
      haptics.select();
      onChange(next);
    }
  };

  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: compact ? 8 : 14,
        padding: compact ? 0 : 4,
        borderRadius: Radius.pill,
      }}>
      <StepButton
        delta={-1}
        // At the minimum of a removable line, "minus" becomes "remove".
        removes={min === 0 && value === 1}
        disabled={value <= min}
        compact={compact}
        label={label}
        onPress={() => step(-1)}
      />
      <Text
        style={{
          minWidth: compact ? 18 : 24,
          textAlign: 'center',
          color: theme.text,
          fontSize: compact ? 15 : 18,
          fontWeight: '700',
          fontVariant: ['tabular-nums'],
        }}>
        {value}
      </Text>
      <StepButton
        delta={1}
        disabled={value >= max}
        compact={compact}
        label={label}
        onPress={() => step(1)}
      />
    </View>
  );
}

function StepButton({
  delta,
  removes,
  disabled,
  compact,
  label,
  onPress,
}: {
  delta: 1 | -1;
  removes?: boolean;
  disabled: boolean;
  compact?: boolean;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const size = compact ? 32 : 40;
  const action = removes ? 'Remove' : delta < 0 ? 'Decrease' : 'Increase';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${action} ${label.toLowerCase()}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.secondary,
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
      })}>
      <Icon
        sf={removes ? 'trash' : delta < 0 ? 'minus' : 'plus'}
        md={removes ? 'delete' : delta < 0 ? 'remove' : 'add'}
        size={compact ? 14 : 18}
        color={theme.secondaryForeground}
        weight="bold"
      />
    </Pressable>
  );
}
