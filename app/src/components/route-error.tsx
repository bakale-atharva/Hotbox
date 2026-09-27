import type { ErrorBoundaryProps } from 'expo-router';
import { ScrollView } from 'react-native';

import { Button } from '@/components/ui/button';
import { StateView } from '@/components/ui/state-view';
import { useTheme } from '@/hooks/use-theme';
import { errorMessage } from '@/utils/errors';

/** Route-level error UI: export as `ErrorBoundary` from a route file. */
export function RouteErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const theme = useTheme();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ flexGrow: 1 }}>
      <StateView
        icon={{ sf: 'exclamationmark.triangle.fill', md: 'error' }}
        title="Something went wrong"
        message={errorMessage(error)}
        action={<Button label="Try again" onPress={retry} size="md" style={{ marginTop: 8 }} />}
      />
    </ScrollView>
  );
}
