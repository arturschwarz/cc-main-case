import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/app/navigation';
import { renderWithProviders, createTestQueryClient, screen } from '@/test/render';
import { usersFixture } from '@/test/fixtures/users';

import { PAGE_SIZE } from '../api/constants';
import { userKeys } from '../api/queryKeys';
import { UserDetailScreen } from './UserDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function DetailApp() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        initialParams={{ userId: 1 }}
      />
    </Stack.Navigator>
  );
}

describe('UserDetailScreen', () => {
  it('renders instantly from cached list data, then the full detail', async () => {
    // Seed the list cache so placeholderData can render the header immediately.
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
      userKeys.list({ limit: PAGE_SIZE, sort: { sortBy: 'lastName', order: 'asc' } }),
      {
        pages: [{ users: usersFixture, total: usersFixture.length, skip: 0, limit: PAGE_SIZE }],
        pageParams: [0],
      },
    );

    await renderWithProviders(<DetailApp />, { queryClient });

    // Placeholder: the full name is on screen without waiting for the fetch.
    expect(screen.getAllByText('Emily Johnson').length).toBeGreaterThan(0);

    // After the by-id fetch settles, the richer Detail fields are shown.
    expect(await screen.findByText('State University')).toBeOnTheScreen();
  });
});
