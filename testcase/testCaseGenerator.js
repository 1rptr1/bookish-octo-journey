export function generateTestCases(signals) {
  const cases = [];

  if (signals.includes('FORM') && signals.includes('EMAIL')) {
    cases.push({
      test_case: 'Login with valid credentials',
      type: 'Happy Path'
    });

    cases.push({
      test_case: 'Login with invalid email format',
      type: 'Negative'
    });
  }

  if (signals.includes('REQUIRED')) {
    cases.push({
      test_case: 'Submit form with empty required fields',
      type: 'Negative'
    });
  }

  return cases;
}
