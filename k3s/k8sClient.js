// config/k8sClient.js
const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();

kc.loadFromOptions({
    clusters: [
        {
            name: 'my-cluster',
            server: process.env.CLUSTER_API_SERVER,
            caData: process.env.CLUSTER_CA_DATA ? Buffer.from(process.env.CLUSTER_CA_DATA, 'base64').toString('utf8') : undefined,
            insecureSkipTlsVerify: process.env.SKIP_TLS === 'true',
        },
    ],
    users: [
        {
            name: 'api-user',
            token: process.env.CLUSTER_TOKEN,
        },
    ],
    contexts: [
        {
            name: 'api-context',
            cluster: 'my-cluster',
            user: 'api-user',
        },
    ],
    currentContext: 'api-context',
});

const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);
const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);

module.exports = { coreV1Api, appsV1Api };