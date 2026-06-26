import { fireEvent, render, screen } from '@testing-library/react-native';

import { UserListItem } from './UserListItem';

describe('UserListItem', () => {
  const props = {
    id: 7,
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
  };

  it('renders the full name and secondary email', async () => {
    await render(<UserListItem {...props} onPress={jest.fn()} />);
    expect(screen.getByText('Ada Lovelace')).toBeOnTheScreen();
    expect(screen.getByText('ada@example.com')).toBeOnTheScreen();
  });

  it('exposes a composed accessibility label and stable testID', async () => {
    await render(<UserListItem {...props} onPress={jest.fn()} />);
    expect(screen.getByTestId('user-row-7')).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Ada Lovelace, ada@example.com'),
    ).toBeOnTheScreen();
  });

  it('calls onPress with the user id', async () => {
    const onPress = jest.fn();
    await render(<UserListItem {...props} onPress={onPress} />);
    await fireEvent.press(screen.getByTestId('user-row-7'));
    expect(onPress).toHaveBeenCalledWith(7);
  });
});
