import { test, expect } from '@playwright/test';

test('Real-time sync between two users', async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  // ⚠️ Ensure this matches your running frontend port (3000 or 5173)
  const appUrl = 'http://localhost:3000'; 

  await pageA.goto(appUrl);
  await pageB.goto(appUrl);

  // --- GENERATE UNIQUE NAME ---
  // This prevents the "Strict Mode Violation" if you run the test multiple times
  const uniqueTaskName = `Sync Test ${Date.now()}`;

  // --- 1. User A creates a task ---
  await pageA.getByPlaceholder('Task title...').fill(uniqueTaskName);
  await pageA.getByRole('button', { name: 'Add' }).click();

  // Check if User A sees it (Wait for it to appear)
  // We use .first() just in case, but the unique name should be enough
  await expect(pageA.getByText(uniqueTaskName).first()).toBeVisible();

  // --- 2. Verify User B sees it instantly (Real-time Sync Verified ✅) ---
  await expect(pageB.getByText(uniqueTaskName).first()).toBeVisible();

  // --- 3. User A moves task to "Done" ---
  const task = pageA.getByText(uniqueTaskName).first();
  const doneColumn = pageA.getByTestId('column-Done');

  // Get the locations of the elements
  const taskBox = await task.boundingBox();
  const doneBox = await doneColumn.boundingBox();

  if (taskBox && doneBox) {
    // Perform a "Human-like" drag manually
    await pageA.mouse.move(taskBox.x + taskBox.width / 2, taskBox.y + taskBox.height / 2);
    await pageA.mouse.down();
    await pageA.mouse.move(doneBox.x + doneBox.width / 2, doneBox.y + doneBox.height / 2, { steps: 20 });
    await pageA.mouse.up();
  }

  // Allow a split second for the socket event to fire
  await pageA.waitForTimeout(1000);

  // --- 4. Verify User B sees task in "Done" column ---
  const taskInDoneB = pageB.getByTestId('column-Done').getByText(uniqueTaskName).first();
  await expect(taskInDoneB).toBeVisible();
});