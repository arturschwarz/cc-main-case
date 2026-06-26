import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '@/features/users/screens/HomeScreen';
import { UserDetailScreen } from '@/features/users/screens/UserDetailScreen';
import { colors } from '@/ui/theme';

import type { RootStackParamList } from './navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Single native-stack navigator: Home -> UserDetail. Native stack uses the
 * platform navigators for better perf/feel than a JS stack.
 */
export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.text.primary,
        headerStyle: { backgroundColor: colors.surface },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Users' }}
      />
      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{ title: 'Details' }}
      />
    </Stack.Navigator>
  );
}
