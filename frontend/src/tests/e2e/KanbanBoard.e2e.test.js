import { test, expect } from '@playwright/test';

test('Real-time sync between two users', async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  const appUrl = 'http://localhost:3000'; 

  await pageA.goto(appUrl);
  await pageB.goto(appUrl);


  const uniqueTaskName = `Sync Test ${Date.now()}`;


  await pageA.getByPlaceholder('Task title...').fill(uniqueTaskName);
  await pageA.getByRole('button', { name: 'Add' }).click();


  await expect(pageA.getByText(uniqueTaskName).first()).toBeVisible();

  await expect(pageB.getByText(uniqueTaskName).first()).toBeVisible();

  const task = pageA.getByText(uniqueTaskName).first();
  const doneColumn = pageA.getByTestId('column-Done');


  const taskBox = await task.boundingBox();
  const doneBox = await doneColumn.boundingBox();

  if (taskBox && doneBox) {

    await pageA.mouse.move(taskBox.x + taskBox.width / 2, taskBox.y + taskBox.height / 2);
    await pageA.mouse.down();
    await pageA.mouse.move(doneBox.x + doneBox.width / 2, doneBox.y + doneBox.height / 2, { steps: 20 });
    await pageA.mouse.up();
  }

  await pageA.waitForTimeout(1000);

  // --- 4. Verify User B sees task in "Done" column ---
  const taskInDoneB = pageB.getByTestId('column-Done').getByText(uniqueTaskName).first();
  await expect(taskInDoneB).toBeVisible();
});
