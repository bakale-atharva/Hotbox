import { api } from '@backend/convex/_generated/api';
import { useClerk, useUser } from '@clerk/expo';
import { useQuery } from 'convex/react';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { RouteErrorBoundary } from '@/components/route-error';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/utils/format';
import { ACTIVE_STATUSES } from '@/utils/order-status';

export { RouteErrorBoundary as ErrorBoundary };

export default function AccountScreen() {
  const theme = useTheme();
  const { user } = useUser();
  const { signOut } = useClerk();
  const orders = useQuery(api.orders.listMine);
  const [signingOut, setSigningOut] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const name = user?.fullName || email.split('@')[0] || 'Pizza lover';
  const delivered = orders?.filter((o) => o.status === 'delivered') ?? [];
  const active = orders?.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
  const spent = delivered.reduce((sum, o) => sum + o.total, 0);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 16, gap: 16, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 16,
          borderRadius: Radius.lg,
          borderCurve: 'continuous',
          backgroundColor: theme.card,
        }}>
        {user?.hasImage ? (
          <Image source={{ uri: user.imageUrl }} style={{ width: 56, height: 56, borderRadius: 28 }} />
        ) : (
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ color: theme.primaryForeground, fontSize: 22, fontWeight: '800' }}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <Text numberOfLines={1} style={{ color: theme.text, fontSize: 18, fontWeight: '800' }}>
            {name}
          </Text>
          {email ? (
            <Text selectable numberOfLines={1} style={{ color: theme.textSecondary, fontSize: 14 }}>
              {email}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Stat label="Orders" value={orders ? String(orders.length) : '–'} />
        <Stat label="In progress" value={active === undefined ? '–' : String(active)} />
        <Stat label="Spent" value={orders ? formatPrice(spent) : '–'} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
          padding: 16,
          borderRadius: Radius.lg,
          backgroundColor: theme.secondary,
        }}>
        <Icon sf="banknote" md="payments" size={22} color={theme.secondaryForeground} />
        <Text style={{ flex: 1, color: theme.secondaryForeground, fontSize: 14, lineHeight: 20 }}>
          Hotbox is cash on delivery. Pay the driver when your pizza arrives.
        </Text>
      </View>

      <Button
        label="Sign out"
        variant="destructive"
        icon={{ sf: 'rectangle.portrait.and.arrow.right', md: 'logout' }}
        loading={signingOut}
        onPress={async () => {
          setSigningOut(true);
          try {
            await signOut();
          } finally {
            setSigningOut(false);
          }
        }}
      />
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        gap: 4,
        padding: 14,
        borderRadius: Radius.lg,
        borderCurve: 'continuous',
        backgroundColor: theme.card,
      }}>
      <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>{label}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{ color: theme.text, fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
    </View>
  );
}
