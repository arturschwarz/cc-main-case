import { fireEvent, render } from '@testing-library/react-native';

import { Button } from './Button';

// NOTE: In React Native Testing Library v14, `render` and `fireEvent` are
// asynchronous and must be awaited.
describe('Button', () => {
  it('renders its label', async () => {
    const { getByText } = await render(<Button label="Save" onPress={jest.fn()} />);
    expect(getByText('Save')).toBeOnTheScreen();
  });

  it('exposes the button accessibility role', async () => {
    const { getByTestId, getByRole } = await render(
      <Button label="Save" onPress={jest.fn()} testID="save" />,
    );
    expect(getByTestId('save')).toBeEnabled();
    expect(getByRole('button', { name: 'Save' })).toBeOnTheScreen();
  });

  it('fires onPress when pressed', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<Button label="Tap" onPress={onPress} />);
    await fireEvent.press(getByRole('button', { name: 'Tap' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire onPress when disabled', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <Button label="Nope" onPress={onPress} disabled testID="btn" />,
    );
    await fireEvent.press(getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does NOT fire onPress when loading and marks itself busy', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <Button label="Loading" onPress={onPress} loading testID="btn" />,
    );
    await fireEvent.press(getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
    expect(getByTestId('btn')).toBeBusy();
  });

  it('reflects the disabled prop in accessibilityState', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <Button label="Off" onPress={onPress} disabled testID="btn" />,
    );
    expect(getByTestId('btn')).toBeDisabled();
  });
});
