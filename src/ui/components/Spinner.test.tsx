import { render } from '@testing-library/react-native';

import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with its testID and accessible label', async () => {
    const { getByTestId, getByLabelText } = await render(
      <Spinner testID="loading-indicator" accessibilityLabel="Loading users" />,
    );
    expect(getByTestId('loading-indicator')).toBeOnTheScreen();
    expect(getByLabelText('Loading users')).toBeOnTheScreen();
  });

  it('marks itself busy for screen readers', async () => {
    const { getByTestId } = await render(<Spinner testID="spin" />);
    expect(getByTestId('spin')).toBeBusy();
  });
});
