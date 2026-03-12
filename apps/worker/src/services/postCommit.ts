export async function runAfterCommit<T>(
  transaction: () => Promise<T | null>,
  effect: (value: T) => Promise<void>,
): Promise<void> {
  const committedValue = await transaction();

  if (committedValue !== null) {
    await effect(committedValue);
  }
}
