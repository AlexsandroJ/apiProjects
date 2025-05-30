const axios = require('axios');
const https = require('https');
const { CLUSTER_API_URI_SERVER, CLUSTER_TOKEN, NAMESPACE } = process.env;


// Cria um agente HTTPS que ignora certificados SSL
const agent = new https.Agent({
    rejectUnauthorized: false // Isso ignora certificados inválidos/autoassinados
});

const api = axios.create({
    baseURL: CLUSTER_API_URI_SERVER,
    headers: {
        Authorization: `Bearer ${CLUSTER_TOKEN}`,
        'Content-Type': 'application/json'
    },
    httpsAgent: agent,
});

exports.tesConection = async (req, res) => {
    try {
        const response = await api.get(`/version`);
        res.status(200).json(response.data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.listPods = async (req, res) => {
    try {
        const response = await api.get(`api/v1/namespaces/${NAMESPACE}/pods`);
        res.status(200).json(response.data.items);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.listDeployments = async (req, res) => {
    try {
        const response = await api.get(`/apis/apps/v1/namespaces/${NAMESPACE}/deployments`);
        res.status(200).json(response.data.items);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.getDeployment = async (req, res) => {
    const { name } = req.params;
    try {
        const response = await api.get(`/apis/apps/v1/namespaces/${NAMESPACE}/deployments/${name}`);
        res.status(200).json(response.data);
    } catch (err) {
        return res.status(404).json({ error: 'Deployment não encontrado' });
    }
};

exports.createDeployment = async (req, res) => {
    const deployment = req.body;
    try {
        const response = await api.post(`/apis/apps/v1/namespaces/${NAMESPACE}/deployments`, deployment);
        res.status(201).json(response.data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.exposeService = async (req, res) => {
    const service = req.body;
    try {
        await api.post(`/api/v1/namespaces/${NAMESPACE}/services`, service);
        res.status(201).json({ message: 'tenantController: Serviço exposto com sucesso!' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.listServices = async (req, res) => {
  try {
    const response = await api.get(`/api/v1/namespaces/${NAMESPACE}/services`);
    res.status(200).json(response.data.items || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.deleteServices = async (req, res) => {
    const { name } = req.params;
    try {
        await api.delete(`/api/v1/namespaces/${NAMESPACE}/services/${name}`);
        res.status(200).json({ message: 'tenantController: Services excluído com sucesso' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.updateDeployment = async (req, res) => {
    const { name } = req.params;
    const deployment = req.body;
    try {
        const response = await api.put(`/apis/apps/v1/namespaces/${NAMESPACE}/deployments/${name}`, deployment);
        res.status(200).json(response.data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.deleteDeployment = async (req, res) => {
    const { name } = req.params;
    try {
        await api.delete(`/apis/apps/v1/namespaces/${NAMESPACE}/deployments/${name}`);
        res.status(200).json({ message: 'tenantController: Deployment excluído com sucesso' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

