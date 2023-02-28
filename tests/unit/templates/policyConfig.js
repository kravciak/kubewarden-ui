export default {
  apiVersion: 'policies.kubewarden.io/v1',
  kind:       'ClusterAdmissionPolicy',
  metadata:   {
    annotations: {
      'meta.helm.sh/release-name':      'rancher-kubewarden-defaults',
      'meta.helm.sh/release-namespace': 'cattle-kubewarden-system',
    },
    finalizers: ['kubewarden'],
    generation: 1,
    labels:     {
      'app.kubernetes.io/component':  'policy',
      'app.kubernetes.io/instance':   'rancher-kubewarden-defaults',
      'app.kubernetes.io/managed-by': 'Helm',
      'app.kubernetes.io/name':       'kubewarden-defaults',
      'app.kubernetes.io/part-of':    'kubewarden',
      'app.kubernetes.io/version':    '1.5.4',
      'helm.sh/chart':                'kubewarden-defaults-1.5.4',
    },
    name: 'do-not-run-as-root',
  },
  spec: {
    mode:              'monitor',
    module:            'ghcr.io/kubewarden/policies/user-group-psp:v0.4.2',
    mutating:          true,
    namespaceSelector: {
      matchExpressions: [
        {
          key:      'kubernetes.io/metadata.name',
          operator: 'NotIn',
          values:   [
            'calico-system',
            'cattle-alerting',
            'cattle-fleet-local-system',
            'cattle-fleet-system',
            'cattle-global-data',
            'cattle-global-nt',
            'cattle-impersonation-system',
            'cattle-istio',
            'cattle-logging',
            'cattle-monitoring-system',
            'cattle-neuvector-system',
            'cattle-pipeline',
            'cattle-prometheus',
            'cattle-system',
            'cert-manager',
            'ingress-nginx',
            'kube-node-lease',
            'kube-public',
            'kube-system',
            'longhorn-system',
            'rancher-operator-system',
            'security-scan',
            'tigera-operator',
          ],
        },
      ],
    },
    policyServer: 'default',
    rules:        [
      {
        apiGroups:   [''],
        apiVersions: ['v1'],
        operations:  ['CREATE'],
        resources:   ['pods'],
      },
      {
        apiGroups:   [''],
        apiVersions: ['v1'],
        operations:  ['CREATE', 'UPDATE'],
        resources:   ['replicationcontrollers'],
      },
      {
        apiGroups:   ['apps'],
        apiVersions: ['v1'],
        operations:  ['CREATE', 'UPDATE'],
        resources:   ['deployments', 'replicasets', 'statefulsets', 'daemonsets'],
      },
      {
        apiGroups:   ['batch'],
        apiVersions: ['v1'],
        operations:  ['CREATE', 'UPDATE'],
        resources:   ['jobs', 'cronjobs'],
      },
    ],
    settings: {
      run_as_group:        { rule: 'RunAsAny' },
      run_as_user:         { rule: 'MustRunAsNonRoot' },
      supplemental_groups: { rule: 'RunAsAny' },
    },
    timeoutSeconds: 10,
  },
};
