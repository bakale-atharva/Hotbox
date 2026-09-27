import { api } from '@backend/convex/_generated/api';
import type { Id } from '@backend/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Text, useWindowDimensions, View } from 'react-native';

import { useCart } from '@/components/cart/cart-provider';
import { CategoryChips } from '@/components/menu/category-chips';
import { PizzaCard } from '@/components/menu/pizza-card';
import { RouteErrorBoundary } from '@/components/route-error';
import { Button } from '@/components/ui/button';
import { StateView } from '@/components/ui/state-view';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';

export { RouteErrorBoundary as ErrorBoundary };

export default function MenuScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { count } = useCart();
  const menu = useQuery(api.pizzas.listMenu);
  const categories = useQuery(api.categories.list);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Id<'categories'> | null>(null);

  const columns = width >= 1100 ? 4 : width >= 760 ? 3 : 2;
  const query = search.trim().toLowerCase();
  const pizzas = (menu ?? [])
    .filter((p) => category === null || p.categoryId === category)
    .filter(
      (p) =>
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.ingredients.some((i) => i.name.toLowerCase().includes(query)),
    )
    // Keep sold-out pizzas visible, but after the ones you can order.
    .sort((a, b) => Number(a.soldOut) - Number(b.soldOut));

  const isLoading = menu === undefined || categories === undefined;
  const isFiltered = query !== '' || category !== null;

  return (
    <>
      <FlatList
        key={columns}
        data={isLoading ? [] : pizzas}
        numColumns={columns}
        keyExtractor={(p) => p._id}
        renderItem={({ item }) => (
          <View style={{ flex: 1 / columns, padding: 6 }}>
            <PizzaCard pizza={item} />
          </View>
        )}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={{
          paddingHorizontal: 10,
          // Room for the floating cart bar on Android/web.
          paddingBottom: count > 0 ? 120 : 32,
          width: '100%',
          maxWidth: 1200,
          alignSelf: 'center',
        }}
        ListHeaderComponent={
          <View style={{ gap: 16, paddingTop: 8, paddingBottom: 12, marginHorizontal: -10 }}>
            {process.env.EXPO_OS === 'web' && (
              <View style={{ paddingHorizontal: 16 }}>
                <TextField
                  label="Search the menu"
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Pepperoni, mushrooms, veggie…"
                  autoCapitalize="none"
                  accessibilityRole="search"
                />
              </View>
            )}
            <View style={{ paddingHorizontal: 16, gap: 2 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 15 }}>
                Hot pizza, delivered. Cash on delivery.
              </Text>
            </View>
            {categories && categories.length > 0 && (
              <CategoryChips categories={categories} selected={category} onSelect={setCategory} />
            )}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <StateView loading />
          ) : isFiltered ? (
            <StateView
              icon={{ sf: 'magnifyingglass', md: 'search_off' }}
              title="No pizzas found"
              message={query ? `Nothing matches “${search.trim()}”.` : 'Nothing in this category yet.'}
              action={
                <Button
                  label="Show all pizzas"
                  variant="secondary"
                  size="md"
                  onPress={() => {
                    setSearch('');
                    setCategory(null);
                  }}
                />
              }
            />
          ) : (
            <StateView
              icon={{ sf: 'fork.knife', md: 'restaurant_menu' }}
              title="The menu is being prepared"
              message="Check back soon for fresh pizzas."
            />
          )
        }
      />

      {/* Native header search (iOS & Android); web gets the inline field above. */}
      {process.env.EXPO_OS !== 'web' && (
        <Stack.SearchBar
          placeholder="Search pizzas or toppings"
          autoCapitalize="none"
          onChangeText={(e) => setSearch(e.nativeEvent.text)}
          onCancelButtonPress={() => setSearch('')}
        />
      )}

      {process.env.EXPO_OS === 'ios' && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon="bag"
            accessibilityLabel="Open cart"
            onPress={() => router.push('/cart')}>
            {count > 0 && <Stack.Toolbar.Badge>{String(count)}</Stack.Toolbar.Badge>}
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      )}
    </>
  );
}
