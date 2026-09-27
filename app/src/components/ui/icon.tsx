import { SymbolView, type SFSymbol } from 'expo-symbols';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

/**
 * SF Symbol on iOS, Material Symbol on Android and web.
 * Every icon needs both names: SF Symbols never render outside Apple platforms.
 */
export function Icon({
  sf,
  md,
  size = 20,
  color,
  weight,
  style,
}: {
  sf: SFSymbol;
  md: string;
  size?: number;
  color?: ColorValue;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SymbolView
      // Material names are plain strings; the android/web union is broader than we need.
      name={{ ios: sf, android: md as never, web: md as never }}
      size={size}
      tintColor={color}
      weight={weight}
      resizeMode="scaleAspectFit"
      style={style}
    />
  );
}
