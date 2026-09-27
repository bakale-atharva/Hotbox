import { SegmentedControl } from '@expo/ui/community/segmented-control';

import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/utils/haptics';
import { SIZES, type PizzaSize } from '@/utils/order-status';

/**
 * Native segmented control: SwiftUI on iOS, Jetpack Compose on Android,
 * and a web implementation from @expo/ui on web.
 */
export function SizePicker({
  value,
  onChange,
  enabled = true,
}: {
  value: PizzaSize;
  onChange: (size: PizzaSize) => void;
  enabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <SegmentedControl
      values={SIZES.map((s) => s.label)}
      selectedIndex={SIZES.findIndex((s) => s.key === value)}
      enabled={enabled}
      tintColor={theme.primary}
      onChange={(e) => {
        const next = SIZES[e.nativeEvent.selectedSegmentIndex];
        if (next) {
          haptics.select();
          onChange(next.key);
        }
      }}
      style={{ height: 36 }}
    />
  );
}
