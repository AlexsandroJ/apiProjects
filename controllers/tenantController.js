// controllers/tenantController.js
const k8s = require('@kubernetes/client-node');
const { coreV1Api, appsV1Api } = require('../k3s/k8sClient');
const NAMESPACE = 'meu-namespace';

function getDeploymentName(tenantId) {
    return `tenant-${tenantId}-deployment`;
}

exports.startTenantPod = async (req, res) => {
    const { tenantId, imageName } = req.body;

    if (!tenantId || !imageName) {
        return res.status(400).json({ error: 'tenantId e imageName são obrigatórios' });
    }

    const deploymentName = getDeploymentName(tenantId);

    const container = new k8s.V1Container();
    container.name = deploymentName;
    container.image = imageName;
    container.imagePullPolicy = 'IfNotPresent';

    const templateSpec = new k8s.V1PodSpec();
    templateSpec.containers = [container];

    const template = new k8s.V1PodTemplateSpec();
    template.spec = templateSpec;

    const deploymentSpec = new k8s.V1DeploymentSpec();
    deploymentSpec.selector = { matchLabels: { app: deploymentName } };
    deploymentSpec.template = template;
    deploymentSpec.replicas = 1;

    const metadata = new k8s.V1ObjectMeta();
    metadata.name = deploymentName;
    metadata.labels = { app: deploymentName };

    const deployment = new k8s.V1Deployment();
    deployment.apiVersion = 'apps/v1';
    deployment.kind = 'Deployment';
    deployment.metadata = metadata;
    deployment.spec = deploymentSpec;

    try {
        console.log(typeof(NAMESPACE))
        await appsV1Api.createNamespacedDeployment(NAMESPACE, deployment);
        return res.status(201).json({ message: 'Deployment criado', deploymentName });
    } catch (error) {
        console.error('Erro ao criar deployment:', error.response?.body || error.message);
        return res.status(500).json({ error: 'Falha ao criar deployment' });
    }
};

exports.scaleTenantPod = async (req, res) => {
    const { tenantId, replicas } = req.body;

    if (!tenantId || !replicas || replicas < 1) {
        return res.status(400).json({ error: 'tenantId e replicas >= 1 são obrigatórios' });
    }

    const deploymentName = getDeploymentName(tenantId);

    try {
        const resp = await appsV1Api.readNamespacedDeployment(deploymentName, NAMESPACE);
        const deployment = resp.body;

        deployment.spec.replicas = replicas;

        await appsV1Api.replaceNamespacedDeployment(deploymentName, NAMESPACE, deployment);

        return res.json({ message: `${replicas} réplicas criadas`, deploymentName });
    } catch (error) {
        console.error('Erro ao escalar deployment:', error.response?.body || error.message);
        return res.status(500).json({ error: 'Falha ao escalar deployment' });
    }
};

exports.removeTenantPod = async (req, res) => {
    const { tenantId } = req.body;

    if (!tenantId) {
        return res.status(400).json({ error: 'tenantId é obrigatório' });
    }

    const deploymentName = getDeploymentName(tenantId);

    try {
        await appsV1Api.deleteNamespacedDeployment(deploymentName, NAMESPACE, {});
        return res.json({ message: 'Deployment removido', deploymentName });
    } catch (error) {
        console.error('Erro ao remover deployment:', error.response?.body || error.message);
        return res.status(500).json({ error: 'Falha ao remover deployment' });
    }
};

exports.getTenantPods = async (req, res) => {
    const { tenantId } = req.params;

    if (!tenantId) {
        return res.status(400).json({ error: 'tenantId é obrigatório' });
    }

    const labelSelector = `app=tenant-${tenantId}-deployment`;

    try {
        const response = await coreV1Api.listNamespacedPod(NAMESPACE, undefined, undefined, labelSelector);
        const pods = response.body.items.map(pod => ({
            name: pod.metadata?.name,
            status: pod.status.phase,
            ip: pod.status.podIP,
        }));

        return res.json({ pods });
    } catch (error) {
        console.error('Erro ao buscar pods:', error.response?.body || error.message);
        return res.status(500).json({ error: 'Falha ao buscar pods' });
    }
};

exports.testK8sConnection = async (req, res) => {

    try {
        console.log(NAMESPACE)
        const podsResponse = await coreV1Api.listNamespacedPod(NAMESPACE);

        const podCount = podsResponse.body.items.length;
        const podNames = podsResponse.body.items.map(pod => pod.metadata?.name);

        //console.log(`✅ Conectado ao cluster Kubernetes.`);
        //console.log(`Namespace: ${namespace}`);
        //console.log(`Encontrados ${podCount} pods no namespace "${namespace}"`);

        return res.json({
            connected: true,
            namespace,
            podCount,
            podNames,
        });
    } catch (error) {
        /*
        console.error('❌ Erro ao conectar ao cluster:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.body || 'Sem resposta do servidor',
        });
        */
        return res.status(500).json({
            connected: false,
            error: 'Falha ao conectar ao cluster Kubernetes',
            details: error.response?.body?.message || error.message,
        });
    }
};

exports.listNamespaces = async (req, res) => {
    try {
        const response = await coreV1Api.listNamespace();
        const namespaces = response.body.items.map(ns => ns.metadata.name);
        return res.json({ namespaces });
    } catch (error) {
        //console.error('Erro ao listar namespaces:', error.message);
        return res.status(500).json({ error: 'Falha ao listar namespaces' });
    }
};