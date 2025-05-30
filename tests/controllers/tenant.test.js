// tests/integration/deployment.test.js
const request = require('supertest');
const { app } = require('../../app');
const axios = require('axios');

const NAMESPACE = "default";
const DEPLOYMENT_NAME = 'nginx-deployment';
const SERVICE_NAME = 'nginx-service';
const NGINX_EXTERNAL_URL = "http://184.73.149.94:30080";
const APP = "nginx";
const NODEPORT = 30080;
const PORT = 80;

const deployment = {
  apiVersion: "apps/v1",
  kind: "Deployment",
  metadata: {
    name: DEPLOYMENT_NAME,
    namespace: NAMESPACE
  },
  spec: {
    replicas: 2,
    selector: {
      matchLabels: {
        app: APP
      }
    },
    template: {
      metadata: {
        labels: {
          app: APP
        }
      },
      spec: {
        containers: [
          {
            name: "nginx-container",
            image: "nginx:latest",
            ports: [{ containerPort: PORT }]
          }
        ]
      }
    }
  }
};
/*
const deployment = {
  apiVersion: "apps/v1",
  kind: "Deployment",
  metadata: {
    name: `${DEPLOYMENT_NAME}-Deployment`,
    namespace: NAMESPACE
  },
  spec: {
    replicas: 2,
    selector: {
      matchLabels: {
        app: APP
      }
    },
    template: {
      metadata: {
        labels: {
          app: APP
        }
      },
      spec: {
        containers: [
          {
            name: "meu-container-test-jest",
            image: "nginx:latest",
            ports: [{ containerPort: PORT }]
          }
        ]
      }
    }
  }
}*/
const service = {
  apiVersion: 'v1',
  kind: 'Service',
  metadata: {
    name: SERVICE_NAME
  },
  spec: {
    selector: {
      app: APP
    },
    ports: [
      {
        protocol: 'TCP',
        port: PORT,
        targetPort: PORT,
        nodePort: NODEPORT
      }
    ],
    type: 'NodePort'
  }
};

describe('Testes de Integração - Deployments', () => {
  
  test('GET /test-Conection - Deve retornar informações da versão do cluster', async () => {
    const res = await request(app).get('/api/test-Conection');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('major');
    expect(res.body).toHaveProperty('minor');
  });

  test('GET /list-Pods - Deve listar pods existentes', async () => {
    const res = await request(app).get('/api/list-Pods');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /list-Deployments - Deve listar deployments existentes', async () => {
    const res = await request(app).get('/api/list-Deployments');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  
  test('POST /creat-Deployments - Deve criar um novo deployment', async () => {
    const res = await request(app).post(`/api/creat-Deployments`).send(deployment);
    expect(res.status).toBe(201);
    expect(res.body.metadata.name).toBe(`nginx-deployment`);
  });
  
  test('GET /list-Deployments - Deve incluir o novo deployment criado', async () => {
    const res = await request(app).get('/api/list-Deployments');
    const found = res.body.some(dep => dep.metadata.name === `nginx-deployment`);
    expect(found).toBe(true);
  });

  /*
  test('POST /update-Deployments/:name - Deve atualizar o deployment', async () => {
    const updatedDeployment = {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: {
        name: `${DEPLOYMENT_NAME}-deployment`,
        namespace: "default"
      },
      spec: {
        replicas: 3,
        selector: {
          matchLabels: {
            app: DEPLOYMENT_NAME
          }
        },
        template: {
          metadata: {
            labels: {
              app: DEPLOYMENT_NAME
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

    const res = await request(app)
      .post(`/update-Deployments/${DEPLOYMENT_NAME}`)
      .send(updatedDeployment);

    expect(res.status).toBe(200);
    expect(res.body.spec.replicas).toBe(3);
  });
  */
  /*
  */
  test('POST /expose-Service - Deve expor o Service', async () => {
    const res = await request(app).post(`/api/expose-Services`).send(service);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('tenantController: Serviço exposto com sucesso!');
  });
  
  test('GET /list-Services - Deve listar serviços', async () => {
    const res = await request(app).get('/api/list-Services');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const found = res.body.some(svc => svc.metadata.name === `nginx-service`);
    expect(found).toBe(true);
  });

  test('GET http://184.73.149.94:30080 - Deve responder com status 200 OK', async () => {
    const response = await axios.get(NGINX_EXTERNAL_URL, { timeout: 4000 });
    expect(response.status).toBe(200);
    expect(response.headers['server']).toMatch(/nginx/); // opcional: verificar cabeçalho
    expect(response.data).toContain('Welcome to nginx!'); // opcional: verificar conteúdo da página

  });

  test('DELETE /del-Deployments/:name - Deve excluir o deployment', async () => {
    const res = await request(app).delete(`/api/del-Deployments/${DEPLOYMENT_NAME}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('tenantController: Deployment excluído com sucesso');
  });

  test('GET /list-Deployments - Deve garantir que o deployment foi excluído', async () => {
    const res = await request(app).get(`/api/list-Deployments`);
    const found = res.body.some(dep => dep.metadata.name === `${DEPLOYMENT_NAME}`);
    expect(found).toBe(false);
  });

  test('DELETE /del-Services/:name - Deve excluir o Services', async () => {
    const res = await request(app).delete(`/api/del-Services/nginx-service`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('tenantController: Services excluído com sucesso');
  });
  
});