import type { APIResponse, FullConfig } from '@playwright/test'
import { expect, request } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  let resp: APIResponse
  const { baseURL, storageState } = config.projects[0].use

  const requestContext = await request.newContext({ baseURL, ignoreHTTPSErrors: true })
  await requestContext.post('/v3-public/localProviders/local?action=login', {
    data: {
      username    : 'admin',
      password    : 'sa',
      responseType: 'cookie',
    },
  })

  // Save signed-in state to 'storageState.json'.
  await requestContext.storageState({ path: storageState as string })

  // Get clusterId from displayName
  const clusterName = process.env.CLUSTER
  if (clusterName) {
    resp = await requestContext.get('/v1/management.cattle.io.clusters')
    expect(resp.ok()).toBeTruthy()

    const reqJson = await resp.json()
    const cluster = reqJson.data.find((c: any) => c.spec?.displayName === clusterName)
    expect(cluster).toBeDefined()

    process.env.CLUSTER_ID = cluster.metadata.name
  }

  // Get Rancher version
  resp = await requestContext.get('/rancherversion')
  expect(resp.ok()).toBeTruthy()
  const data = await resp.json()
  process.env.RANCHER_VERSION = data.Version
  process.env.RANCHER_PRIME = data.RancherPrime

  await requestContext.dispose()

  // Github vars are not passed to workflows that are triggered by a pull request from a fork
  process.env.OTEL_OPERATOR ||= '0.92.0'
}

export default globalSetup
