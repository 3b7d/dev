const { chromium } = require("C:\\Users\\mvrx7\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\.pnpm\\playwright-core@1.59.1\\node_modules\\playwright-core");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const results = [];

  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });

    await page.goto("http://127.0.0.1:4175/index.html", { waitUntil: "networkidle" });
    const info = await page.evaluate(() => {
      const visibleCards = [...document.querySelectorAll(".glass-card")].filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0;
      }).length;

      return {
        title: document.title,
        dir: document.documentElement.dir,
        activeView: document.querySelector(".view.active")?.id,
        navCount: document.querySelectorAll(".nav-item").length,
        heroText: document.querySelector(".hero h1")?.textContent?.trim(),
        bodyWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
        visibleCards,
        heroRadius: getComputedStyle(document.querySelector(".hero")).borderRadius,
      };
    });

    results.push({
      viewport: viewport.name,
      ...info,
      horizontalOverflow: info.bodyWidth > info.viewportWidth + 2,
    });

    if (viewport.name === "desktop") {
      await page.locator('[data-view="tasks"]').click();
      await page.locator('[data-view="reports"]').click();
      const activeAfterNavigation = await page.locator(".view.active").getAttribute("id");
      results.push({
        viewport: "desktop-navigation",
        activeAfterNavigation,
        reportsVisible: await page.locator("#reports.view.active").count(),
      });
    }
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
