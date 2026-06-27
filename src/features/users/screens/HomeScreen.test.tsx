import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { delay, http, HttpResponse } from 'msw';

import type { RootStackParamList } from '@/app/navigation';
import { env } from '@/lib/env';
import {
  fireEvent,
  renderWithProviders,
  screen,
  waitFor,
} from '@/test/render';
import { server } from '@/test/server';
import { largeUsersFixture, usersFixture } from '@/test/fixtures/users';

import { PAGE_SIZE } from '../api/constants';

import { HomeScreen } from './HomeScreen';
import { UserDetailScreen } from './UserDetailScreen';

const base = env.apiBaseUrl;
const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} />
    </Stack.Navigator>
  );
}

function listResponse(users = usersFixture) {
  return HttpResponse.json({
    users,
    total: users.length,
    skip: 0,
    limit: 30,
  });
}

describe('HomeScreen', () => {
  it('shows a loading indicator first, then the user list', async () => {
    // Delay so the initial loading state is observable before data arrives.
    server.use(
      http.get(`${base}/users`, async () => {
        await delay(30);
        return listResponse();
      }),
    );

    await renderWithProviders(<App />);

    expect(screen.getByTestId('loading-indicator')).toBeOnTheScreen();
    expect(await screen.findByText('Emily Johnson')).toBeOnTheScreen();
  });

  it('shows an error state with a working retry', async () => {
    server.use(
      http.get(`${base}/users`, () => HttpResponse.json(null, { status: 500 })),
    );

    await renderWithProviders(<App />);

    const retry = await screen.findByTestId('retry-button');
    expect(retry).toBeOnTheScreen();

    // Recover: the next request succeeds.
    server.use(http.get(`${base}/users`, () => listResponse()));
    await fireEvent.press(retry);

    expect(await screen.findByText('Emily Johnson')).toBeOnTheScreen();
  });

  it('shows the empty state when there are no users', async () => {
    server.use(
      http.get(`${base}/users`, () =>
        HttpResponse.json({ users: [], total: 0, skip: 0, limit: 30 }),
      ),
    );

    await renderWithProviders(<App />);

    expect(await screen.findByTestId('empty-state')).toBeOnTheScreen();
  });

  it('filters by search term, then resets when cleared', async () => {
    // Real timers: the 350ms debounce resolves comfortably within findBy*'s
    // default polling window. Fake timers race RNTL v14's async fireEvent here
    // (the debounced setState never lands), so we drive this with real time.
    await renderWithProviders(<App />);
    expect(await screen.findByText('Emily Johnson')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByTestId('search-input'), 'Michael');

    // Server-side search returns only the matching user; the others drop out.
    expect(await screen.findByText('Michael Williams')).toBeOnTheScreen();
    await waitFor(() =>
      expect(screen.queryByText('Emily Johnson')).toBeNull(),
    );

    await fireEvent.press(screen.getByTestId('search-clear'));
    expect(await screen.findByText('Emily Johnson')).toBeOnTheScreen();
  });

  it('reorders the list when the sort direction is toggled', async () => {
    // Default handlers sort by last name. Fixture last names: Brown (id 3),
    // Johnson (id 1), Williams (id 2).
    await renderWithProviders(<App />);

    // Default A–Z: Brown, Johnson, Williams.
    await screen.findByText('Sophia Brown');
    const ascending = screen.getAllByTestId(/^user-row-/);
    expect(ascending.map((row) => row.props.testID)).toEqual([
      'user-row-3',
      'user-row-1',
      'user-row-2',
    ]);

    await fireEvent.press(screen.getByTestId('sort-toggle'));

    // Flips to Z–A: Williams, Johnson, Brown.
    await waitFor(() => {
      const descending = screen.getAllByTestId(/^user-row-/);
      expect(descending.map((row) => row.props.testID)).toEqual([
        'user-row-2',
        'user-row-1',
        'user-row-3',
      ]);
    });
  });

  it('requests asc on first load, then toggles to desc from cache without a new request', async () => {
    const orders: (string | null)[] = [];
    // The server only ever sees asc here (desc is derived client-side); serve it
    // last-name sorted so the client-side reverse equals a true Z–A order.
    const ascSorted = [...usersFixture].sort((a, b) =>
      a.lastName.localeCompare(b.lastName),
    );
    server.use(
      http.get(`${base}/users`, ({ request }) => {
        orders.push(new URL(request.url).searchParams.get('order'));
        return listResponse(ascSorted);
      }),
    );

    await renderWithProviders(<App />);
    expect(await screen.findByText('Emily Johnson')).toBeOnTheScreen();

    // First load carries the default ascending last-name sort, and the 3-user
    // fixture fits one page, so the cache is complete.
    expect(orders).toEqual(['asc']);

    await fireEvent.press(screen.getByTestId('sort-toggle'));

    // Z–A is derived by reversing the complete cache — the list reorders with no
    // additional request (see ADR 0003).
    await waitFor(() => {
      const rows = screen.getAllByTestId(/^user-row-/);
      expect(rows.map((row) => row.props.testID)).toEqual([
        'user-row-2',
        'user-row-1',
        'user-row-3',
      ]);
    });
    expect(orders).toEqual(['asc']);
  });

  it('renders sticky section headers grouped by last-name initial', async () => {
    // Fixture last names: Brown, Johnson, Williams → headers B, J, W (A–Z).
    await renderWithProviders(<App />);

    await screen.findByText('Sophia Brown');
    const headers = screen.getAllByTestId(/^section-header-/);
    expect(headers.map((h) => h.props.testID)).toEqual([
      'section-header-B',
      'section-header-J',
      'section-header-W',
    ]);
  });

  it('reorders section headers when the sort direction is toggled', async () => {
    await renderWithProviders(<App />);

    await screen.findByText('Sophia Brown');
    await fireEvent.press(screen.getByTestId('sort-toggle'));

    // Z–A flips the sections too: Williams, Johnson, Brown.
    await waitFor(() => {
      const headers = screen.getAllByTestId(/^section-header-/);
      expect(headers.map((h) => h.props.testID)).toEqual([
        'section-header-W',
        'section-header-J',
        'section-header-B',
      ]);
    });
  });

  it('requests the next page when the list end is reached', async () => {
    const skips: number[] = [];
    server.use(
      http.get(`${base}/users`, ({ request }) => {
        const url = new URL(request.url);
        const limit = Number(url.searchParams.get('limit') ?? String(PAGE_SIZE));
        const skip = Number(url.searchParams.get('skip') ?? '0');
        skips.push(skip);
        return HttpResponse.json({
          users: largeUsersFixture.slice(skip, skip + limit),
          total: largeUsersFixture.length,
          skip,
          limit,
        });
      }),
    );

    await renderWithProviders(<App />);

    // First page fetched (skip 0).
    expect(await screen.findByText('First1 Last1')).toBeOnTheScreen();
    expect(skips).toEqual([0]);

    // Reaching the end fetches the second page (skip === PAGE_SIZE).
    const list = await screen.findByTestId('users-list');
    fireEvent(list, 'onEndReached');

    await waitFor(() => expect(skips).toContain(PAGE_SIZE));
  });
});
