import { render } from '@testing-library/react-native';

import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders and is hidden from screen readers', async () => {
    const { getByTestId } = await render(
      <Skeleton testID="sk" width={40} height={12} />,
    );

    // Hidden from a11y, so the query must opt in to find it — that it's only
    // findable this way is the assertion: individual blocks are decorative and
    // the enclosing skeleton owns the single "Loading" label.
    const node = getByTestId('sk', { includeHiddenElements: true });
    expect(node.props.accessibilityElementsHidden).toBe(true);
    expect(node.props.importantForAccessibility).toBe('no-hide-descendants');
  });
});
