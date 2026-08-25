import { expect } from '@playwright/test'
import { RancherAppsPage } from '../rancher/rancher-apps.page'
import { BasePage } from '../rancher/basepage'
import { step } from '../rancher/rancher-test'
import { RancherStoragePage } from '../rancher/rancher-storage.page'
import { RancherUI } from '../components/rancher-ui'

// Generated Pull secret has the same name as auth
export const secretName = 'appco-auth-runenforcer'

export class RunEnforcerPage extends BasePage {
  async goto(): Promise<void> {
    await this.nav.runEnforcer()
  }

  @step
  async install(options?: { version?: string }) {
    const appsPage = new RancherAppsPage(this.page)

    // Requirements Dialog
    const welcomeStep = this.page.getByText('Configure global repository authentication, add required OCI repositories, and install SUSE Security Runtime Enforcer dependencies.')
    const configAuthStep = this.page.getByRole('heading', { name: /^Global Repository Authentication/ })
    const addReposStep = this.page.getByRole('heading', { name: 'Add Required Repositories', exact: true })
    const installCSIDriver = this.page.getByRole('heading', { name: 'Install Cert-Manager CSI Driver', exact: true })
    const installRunEnfStep = this.page.getByRole('heading', { name: 'Install SUSE Security Runtime Enforcer', exact: true })

    await this.goto()
    const sec = new RancherStoragePage(this.page).createAppcoAuth(secretName)

    // Welcome screen is skipped if kubewarden is already installed
    await this.page.waitForTimeout(2000) // Ignore briefly visible welcome step
    await expect(welcomeStep.or(configAuthStep)).toBeVisible()
    if (await welcomeStep.isVisible()) {
      await this.ui.button('Start Installation').click()
    }

    // AppCo Registry Auth
    await expect(configAuthStep).toBeVisible()
    await this.ui.selectOption('Authentication', new RegExp(`^${sec.name}`))
    await this.ui.button('Continue').click()

    // Add repositories
    await expect(addReposStep).toBeVisible()
    await this.ui.button('Action').click()

    // Install Cert-Manager CSI Driver
    await expect(installCSIDriver).toBeVisible()
    await this.ui.button('Install Cert-Manager CSI Driver').click()
    await appsPage.installChart(
      { title: 'cert-manager-csi-driver', check: 'cert-manager-csi-driver' },
      { navigate : false,
        yamlPatch: (RancherUI.isVersion('<2.14'))
          ? (y) => { y.global.imagePullSecrets[0] = sec.name }
          : undefined
      })

    // Install Runtime Enforcer
    await this.goto()
    await expect(installRunEnfStep).toBeVisible()
    await this.ui.button('Install Runtime Enforcer').click()
    await appsPage.installChart(
      { title: 'suse-security-runtime-enforcer', check: 'suse-security-runtime-enforcer', version: options?.version },
      { navigate : false,
        yamlPatch: (y) => {
          // Chart secret UI is not available in Rancher < 2.14
          if (RancherUI.isVersion('<2.14')) y.global.imagePullSecrets[0] = sec.name
        }
      })
  }
}
