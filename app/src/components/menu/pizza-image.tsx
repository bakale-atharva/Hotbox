import { Image } from 'expo-image';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Pizza photo, or a warm branded placeholder until the admin uploads one. */
export function PizzaImage({
  uri,
  style,
  emojiSize = 56,
}: {
  uri: string | null | undefined;
  style?: StyleProp<ViewStyle>;
  emojiSize?: number;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          overflow: 'hidden',
          backgroundColor: theme.secondary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
          transition={250}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text accessible={false} style={{ fontSize: emojiSize }}>
          🍕
        </Text>
      )}
    </View>
  );
}
