export function generateScopedTestCases(signals) {
  const { fields, actions } = signals;
  const submit = actions[0] || 'Submit';

  const cases = [];

  cases.push({
    test_case: 'Submit form with valid data',
    steps: [...fields.map(f => `Enter valid ${f.label}`), `Click "${submit}"`],
    expected: 'Form submitted successfully'
  });

  fields.forEach(field => {
    cases.push({
      test_case: `Submit form with empty ${field.label}`,
      steps: [
        ...fields.map(f =>
          f.label === field.label ? `Leave ${f.label} empty` : `Enter valid ${f.label}`
        ),
        `Click "${submit}"`
      ],
      expected: `Validation error shown for ${field.label}`
    });
  });

  fields.forEach(field => {
    if (field.type === 'email') {
      cases.push({
        test_case: 'Submit form with invalid email format',
        steps: [
          'Enter invalid email',
          ...fields
            .filter(f => f.type !== 'email')
            .map(f => `Enter valid ${f.label}`),
          `Click "${submit}"`
        ],
        expected: 'Email validation error shown'
      });
    }

    if (field.type === 'number') {
      cases.push({
        test_case: `Submit form with invalid ${field.label}`,
        steps: [
          ...fields.map(f =>
            f.label === field.label ? `Enter invalid ${f.label}` : `Enter valid ${f.label}`
          ),
          `Click "${submit}"`
        ],
        expected: `${field.label} validation error shown`
      });
    }
  });

  return cases;
}
