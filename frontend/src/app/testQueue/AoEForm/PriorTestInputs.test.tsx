import renderer from 'react-test-renderer';
import MockDate from 'mockdate';

import PriorTestInputs from './PriorTestInputs';

describe('PriorTestInputs', () => {
  beforeEach(() => {
    MockDate.set('2021-02-06');
  });
  it('snapshot', () => {
    const component = renderer.create(
      <PriorTestInputs
        testTypeConfig={[]}
        isFirstTest={false}
        setIsFirstTest={jest.fn()}
        priorTestDate={''}
        setPriorTestDate={jest.fn()}
        priorTestResult={''}
        setPriorTestResult={jest.fn()}
        priorTestType={''}
        setPriorTestType={jest.fn()}
        lastTest={undefined}
      />
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});
