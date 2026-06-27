import { Text } from 'react-native';

import { fireEvent, renderWithProviders, screen } from '@/test/render';

import { QueryStateView } from './QueryStateView';

describe('QueryStateView', () => {
  it('renders the loading state with an accessible spinner', async () => {
    await renderWithProviders(
      <QueryStateView status="loading" loadingLabel="Loading users">
        <Text>content</Text>
      </QueryStateView>,
    );

    expect(screen.getByTestId('loading-indicator')).toBeOnTheScreen();
    expect(screen.getByLabelText('Loading users')).toBeOnTheScreen();
    expect(screen.queryByText('content')).toBeNull();
  });

  it('renders the error state and fires onRetry', async () => {
    const onRetry = jest.fn();
    await renderWithProviders(
      <QueryStateView
        status="error"
        onRetry={onRetry}
        errorMessage="Boom."
      >
        <Text>content</Text>
      </QueryStateView>,
    );

    expect(screen.getByText('Boom.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('retry-button'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('omits the retry button when no onRetry is given', async () => {
    await renderWithProviders(<QueryStateView status="error" errorMessage="Boom." />);

    expect(screen.queryByTestId('retry-button')).toBeNull();
  });

  it('renders the empty state with its message', async () => {
    await renderWithProviders(
      <QueryStateView status="empty" emptyMessage="No users." />,
    );

    expect(screen.getByTestId('empty-state')).toBeOnTheScreen();
    expect(screen.getByText('No users.')).toBeOnTheScreen();
  });

  it('renders children in the ready state', async () => {
    await renderWithProviders(
      <QueryStateView status="ready">
        <Text>content</Text>
      </QueryStateView>,
    );

    expect(screen.getByText('content')).toBeOnTheScreen();
    expect(screen.queryByTestId('loading-indicator')).toBeNull();
  });

  it('applies containerTestID to the loading and error containers', async () => {
    const { rerender } = await renderWithProviders(
      <QueryStateView status="loading" containerTestID="user-detail" />,
    );
    expect(screen.getByTestId('user-detail')).toBeOnTheScreen();

    rerender(
      <QueryStateView status="error" containerTestID="user-detail" onRetry={jest.fn()} />,
    );
    expect(screen.getByTestId('user-detail')).toBeOnTheScreen();
  });
});
