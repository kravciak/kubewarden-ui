import { Page, expect } from '@playwright/test'
import type { FrameLocator } from '@playwright/test'
import { BasePage } from '../rancher/basepage'
import { step } from '../rancher/rancher-test';

export class PolicyReporterPage extends BasePage {
    readonly frame: FrameLocator;

    constructor(page: Page) {
      super(page)
      this.frame = page.frameLocator('[data-testid="kw-pr-iframe"]')
    }

    getCard(name: 'pass' | 'warn' | 'fail' | 'error') {
      return this.frame.locator('div.v-card-item').filter({ has: this.page.getByText(name, {exact: true}) }).locator('xpath=./following-sibling::div')
    }

    getChip(name: string|RegExp, chip: 'pass' | 'warn' | 'fail' | 'error') {
      return this.frame.locator('a.v-list-item').filter({ has: this.page.getByText(name, {exact: true}) }).locator(`.v-chip.bg-status-${chip}`)
    }

    async goto(): Promise<void> {
      // await this.nav.explorer('Kubewarden', 'Policy Reporter')
      await this.nav.goto('dashboard/c/local/kubewarden/policy-reporter')
    }

    @step
    async selectTab(name: 'Dashboard' | 'Other' | 'Policy Dashboard' | 'Kubewarden') {
      const menu = this.frame.locator('header').locator('i.mdi-menu')
      const tabItem = this.frame.locator('nav').getByRole('link', { name, exact: true })

      // Wait until iframe loads and open menu
      await expect(menu).toBeVisible()
      if (!await tabItem.isVisible()) await menu.click()

      // Click and wait for menu animation to not match previous page
      await tabItem.click()
      await this.page.waitForTimeout(500)
    }

    async runJob() {
      await this.nav.explorer('Workloads', 'CronJobs')
      await this.ui.tableRow('audit-scanner').action('Run Now')
      await this.ui.tableRow(/audit-scanner-[0-9]+/).waitFor({ state: 'Completed', timeout: 30_000 })
    }
}
