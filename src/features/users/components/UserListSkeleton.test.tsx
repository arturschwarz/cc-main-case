import { render } from '@testing-library/react-native';

import { UserListSkeleton } from './UserListSkeleton';

describe('UserListSkeleton', () => {
  it('exposes the loading-indicator testID and a busy "Loading users" label', async () => {
    const { getByTestId, getByLabelText } = await render(<UserListSkeleton />);

    expect(getByTestId('loading-indicator')).toBeOnTheScreen();
    expect(getByTestId('loading-indicator')).toBeBusy();
    expect(getByLabelText('Loading users')).toBeOnTheScreen();
  });
});
