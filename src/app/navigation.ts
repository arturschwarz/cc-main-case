import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Typed route map for the single native stack: Home -> UserDetail.
 *
 * Detail receives only the stable `userId` (never the full User object) so the
 * detail screen owns its own data fetching and can render from cache or refetch
 * the full record. See architecture.md.
 */
export type RootStackParamList = {
  Home: undefined;
  UserDetail: { userId: number };
};

/** Per-screen prop helper, e.g. `HomeScreenProps = RootStackScreenProps<'Home'>`. */
export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

declare global {
  namespace ReactNavigation {
    // Makes `useNavigation()` strongly typed app-wide without per-call generics.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
