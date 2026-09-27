import type { Doc, Id } from '@backend/convex/_generated/dataModel';
import { Pressable, ScrollView, Text } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/utils/haptics';

export function CategoryChips({
  categories,
  selected,
  onSelect,
}: {
  categories: Doc<'categories'>[];
  selected: Id<'categories'> | null;
  onSelect: (id: Id<'categories'> | null) => void;
}) {
  const theme = useTheme();
  const chips = [{ _id: null, name: 'All' }, ...categories];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
      {chips.map((chip) => {
        const active = chip._id === selected;
        return (
          <Pressable
            key={chip._id ?? 'all'}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              haptics.select();
              onSelect(chip._id);
            }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: Radius.pill,
              backgroundColor: active ? theme.primary : theme.card,
              borderWidth: 1,
              borderColor: active ? theme.primary : theme.border,
            }}>
            <Text
              style={{
                color: active ? theme.primaryForeground : theme.text,
                fontWeight: '600',
                fontSize: 14,
              }}>
              {chip.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
