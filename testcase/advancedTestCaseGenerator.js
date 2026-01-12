export function generateTestCases(signals) {
  const cases = [];

  const emailField = signals.fields.find(f => f.type === 'email');
  const passwordField = signals.fields.find(f => f.type === 'password');
  const submitAction = signals.actions.find(a => {
    const lower = a.toLowerCase();
    return lower.includes('submit') || lower.includes('log');
  });

  if (emailField && passwordField && submitAction) {
    cases.push({
      test_case: 'Login with valid credentials',
      steps: [
        `Enter valid email in ${emailField.label || emailField.id || 'email field'}`,
        `Enter valid password in ${passwordField.label || passwordField.id || 'password field'}`,
        `Click "${submitAction}"`
      ],
      expected: 'User successfully logs in'
    });

    cases.push({
      test_case: 'Login with invalid email format',
      steps: [
        `Enter invalid email in ${emailField.label || emailField.id || 'email field'}`,
        `Enter valid password in ${passwordField.label || passwordField.id || 'password field'}`,
        `Click "${submitAction}"`
      ],
      expected: 'Error message shown for invalid email'
    });
  }

  // Required field check
  signals.fields
    .filter(f => f.required)
    .forEach(f => {
      cases.push({
        test_case: `Submit form with ${f.label || f.id || 'required field'} empty`,
        steps: [
          `Leave ${f.label || f.id || 'required field'} empty`,
          submitAction ? `Click "${submitAction}"` : 'Submit the form'
        ],
        expected: 'Validation error shown for required field'
      });
    });

  return cases;
}
