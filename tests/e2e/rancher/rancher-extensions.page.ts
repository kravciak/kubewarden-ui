import { expect, Locator, Page } from '@playwright/test'
import { BasePage } from './basepage'

export class RancherExtensionsPage extends BasePage {
  readonly tabs: Locator

  constructor(page: Page) {
    super(page)
    this.tabs = page.getByTestId('extension-tabs')
  }

  async goto(): Promise<void> {
    // await this.nav.mainNav('Extensions')
    await this.page.goto('dashboard/c/local/uiplugins')
  }

  async selectTab(name: 'Installed' | 'Available' | 'Updates' | 'All') {
    await this.tabs.getByRole('tab', { name, exact: true }).click()
  }

  async dotMenu(name: 'Manage Repositories' | 'Add Rancher Repositories' | 'Manage Extension Catalogs' | 'Developer Load') {
    await this.page.getByTestId('extensions-page-menu').click()
    await this.page.getByText(name).click()
  }

  // Handle extension repositories dialog
  async selectRepos(options?: { rancher?: boolean, partners?: boolean }) {
    const rancherRepo = this.ui.checkbox('Official Rancher Extension')
    const partnersRepo = this.ui.checkbox('Partners Extension')

    if (options?.rancher !== undefined) await rancherRepo.setChecked(options.rancher)
    if (options?.partners !== undefined) await partnersRepo.setChecked(options.partners)
  }

  // Extensions need to be enabled before 2.9
  async enable(options?: { rancher?: boolean, partners?: boolean }) {
    await expect(this.page.getByRole('heading', { name: 'Extension support is not enabled' })).toBeVisible()

    await this.ui.button('Enable').click()
    await expect(this.page.getByRole('heading', { name: 'Enable Extension Support?' })).toBeVisible()

    // Select requested repositories
    await this.selectRepos(options)
    await this.ui.button('OK').click()

    // Wait for extensions to be visible
    await this.ui.retry(async() => {
      await expect(this.tabs).toBeVisible({ timeout: 60_000 })
    }, 'Extensions enabled but not visible')
  }

  // Repositories need to be added since 2.9
  async addRancherRepos(options?: { rancher?: boolean, partners?: boolean }) {
    await this.dotMenu('Add Rancher Repositories')
    await expect(this.page.getByRole('heading', { name: 'Add Extensions repositories' })).toBeVisible()

    // Select requested repositories
    await this.selectRepos(options)
    await this.ui.button('Add').click()
  }

  /**
     * Get extension (plugin) locator from list of extensions
     * @param name Case insensitive exact match of plugin name
     * @returns plugin Locator
     */
  getExtension(name: string) {
    // Filter plugins by name
    return this.page.locator('.plugin')
      .filter({ has: this.page.locator('.plugin-name').getByText(name, { exact: true }) })

    // Can't filter by repository in case of duplicit plugins - there is race condition in rancher, does not work as expected yet
    // plugin = plugin.filter({ has: this.page.locator(`xpath=//img[contains(@src, "clusterrepos/${repository}")]`) })
  }

  /**
     * Install rancher extension
     * @param name Exact name of the extension
     * @param version exact version to be installed. Defaults to pre-selected one (latest)
     */
  async install(name: string, options?: { version?: string }) {
    await this.selectTab('Available')

    const plugin = this.getExtension(name)
    await plugin.getByRole('button', { name: 'Install' }).click()

    const dialog = this.page.locator('.plugin-install-dialog')
    if (options?.version) {
      await this.ui.selectOption('Version', options.version)
    }
    await dialog.getByRole('button', { name: 'Install' }).click()
    await this.ui.retry(async() => {
      await expect(plugin.getByRole('button', { name: 'Uninstall' })).toBeEnabled({ timeout: 60_000 })
    }, 'Extension stuck in "Installing..."')
  }

  /**
     * Developer load extension
     * @param url can be generated by yarn serve-pkgs command
     */
  async developerLoad(url: string) {
    // Open developer load dialog
    await this.dotMenu('Developer Load')
    await expect(this.page.getByRole('heading', { name: 'Developer Load Extension' })).toBeVisible()

    // Load extension
    await this.ui.input('Extension URL').fill(url)
    const moduleName = await this.ui.input('Extension module name').inputValue()
    await this.ui.checkbox('Persist extension').check()
    await this.ui.button('Load').click()

    // Check successful load message
    await expect(this.page.locator('div.growl-message').getByText(`Loaded extension ${moduleName}`, { exact: true })).toBeVisible()
  }
}
