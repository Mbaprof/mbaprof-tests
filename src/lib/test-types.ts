// The kinds of test a student can filter by. Stored on Test.testType and set
// by the admin in the test editor. Add a new entry here to add a new type -
// the filters, badges and editor pick it up automatically.
export const TEST_TYPES = [
  { value: "FULL_LENGTH", label: "Full-length mock test", short: "Full-length mock" },
  { value: "SECTIONAL", label: "Sectional test", short: "Sectional" },
  { value: "DIAGNOSTIC", label: "Diagnostic test", short: "Diagnostic" },
] as const;

export type TestTypeValue = (typeof TEST_TYPES)[number]["value"];

export const TEST_TYPE_VALUES = TEST_TYPES.map((t) => t.value) as [
  TestTypeValue,
  ...TestTypeValue[],
];

export function isTestType(value: string | null | undefined): value is TestTypeValue {
  return TEST_TYPES.some((t) => t.value === value);
}

export function testTypeLabel(value: string) {
  return TEST_TYPES.find((t) => t.value === value)?.label ?? "Test";
}

export function testTypeShort(value: string) {
  return TEST_TYPES.find((t) => t.value === value)?.short ?? "Test";
}
