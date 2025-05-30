const { KubeConfig, CoreV1Api } = require('@kubernetes/client-node');
const kc = new KubeConfig();
kc.loadFromClusterAndUser({
  name: 'admin-sa',
  server: process.env.CLUSTER_API_SERVER,  // substitua pelo IP ou domínio do seu k3s
  caData: Buffer.from(process.env.CLUSTER_CA_DATA).toString('base64'),
  token: process.env.CLUSTER_TOKEN,
});

const coreV1Api = kc.makeApiClient(CoreV1Api);

// Exemplo: listar pods
coreV1Api.listPodForAllNamespaces()
  .then(res => {
    console.log('PODs:', res.body.items.map(p => p.metadata.name));
  })
  .catch(err => {
    console.error('Erro:', err);
  });