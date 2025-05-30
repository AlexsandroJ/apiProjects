const axios = require('axios');
const https = require('https');
require('dotenv').config();

const TOKEN = process.env.CLUSTER_TOKEN;

// Cria um agente HTTPS que ignora certificados SSL
const agent = new https.Agent({
  rejectUnauthorized: false // Isso ignora certificados inválidos/autoassinados
});

const api = axios.create({
  baseURL: process.env.CLUSTER_API_URI_SERVER,
  httpsAgent: agent, // Aplica o agente ao axios
});

async function tesConection() {
  try {
    const res = await api.get(`/version`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });
    console.log(res.data);

  } catch (err) {
    console.error('Erro na requisição:', err.response?.data || err.message);
  }
}

async function getPods() {
  try {
    const res = await api.get(`api/v1/namespaces/default/pods`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });

    res.data.items.forEach(element => {
      console.log(element.metadata.name);
    });
  } catch (err) {
    console.error('Erro na requisição:', err.response?.data || err.message);
  }
}

async function getDeployments() {
  try {
    const res = await api.get(`apis/apps/v1/namespaces/default/deployments`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });

    res.data.items.forEach(element => {
      console.log(element.metadata.name);
    });
  } catch (err) {
    console.error('Erro na requisição:', err.response?.data || err.message);
  }
}

async function createDeployment(name) {
  const deployment = {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: `${name}-deployment`,
      namespace: "default"
    },
    spec: {
      replicas: 2,
      selector: {
        matchLabels: {
          app: name
        }
      },
      template: {
        metadata: {
          labels: {
            app: name
          }
        },
        spec: {
          containers: [
            {
              name: "meu-container",
              image: "nginx:latest",
              ports: [{ containerPort: 80 }]
            }
          ]
        }
      }
    }
  };

  try {
    const res = await api.post(`/apis/apps/v1/namespaces/default/deployments`, deployment, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    console.log("Deployment criado:", res.data.metadata);
  } catch (err) {
    console.error('Erro ao criar deployment:', err.response?.data || err.message);
  }
}

async function deldeployments(name) {
  try {
    const res = await api.delete(`apis/apps/v1/namespaces/default/deployments/${name}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });

    //res.data.items.forEach(element => {
    console.log(res.data.metadata);
    //});
  } catch (err) {
    console.error('Erro na requisição:', err.response?.data || err.message);
  }
}
async function getServices() {
  try {
    const res = await api.get(`api/v1/namespaces/default/services`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });

    res.data.items.forEach(element => {
      console.log(element.metadata.name);
    });
  } catch (err) {
    console.error('Erro na requisição:', err.response?.data || err.message);
  }
}

async function delservices(name) {
  try {
    const res = await api.delete(`apis/apps/v1/namespaces/default/services/${name}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });

    //res.data.items.forEach(element => {
    console.log(res.data.metadata);
    //});
  } catch (err) {
    console.error('Erro na requisição:', err.response?.data || err.message);
  }
}

getServices();
//getPods()
//deldeployments('nginx-deployment')
//createDeployment('so-vai');
//getPods()