const k8s = require('@kubernetes/client-node');

// Instância do cliente
const kc = new k8s.KubeConfig();

// Configuração manual com token
kc.loadFromString({
  clusters: [
    {
      name: 'default',
      cluster: {
        server: 'http://localhost:6443', // Substitua pelo IP do seu cluster
        skipTLSVerify: true, // Use apenas em ambientes de teste
      },
    },
  ],
  users: [
    {
      name: 'me',
      user: {
        token: 'K10c7ef99bb7b4c33bd644d1b1953f7af85791bcc7a004335017f498377b0cdcd34::server:00cdcc29d81d9b24656c1f1ed2dcd014', // Seu token aqui
      },
    },
  ],
  contexts: [
    {
      name: 'default',
      context: {
        cluster: 'default',
        user: 'me',
        namespace: 'default',
      },
    },
  ],
  'current-context': 'my-context',
});

// Cria cliente para CoreV1Api (Pods, Services etc.)
const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);

// Lista os Pods no namespace 'default'
coreV1Api.listNamespacedPod('default')
  .then((res) => {
    console.log('_Pods encontrados:');
    res.body.items.forEach((pod) => {
      console.log(`- ${pod.metadata.name} | Status: ${pod.status.phase}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao listar Pods:', err.response?.body || err);
  });