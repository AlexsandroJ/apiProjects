
#docker-compose.yml
version: '3.8'

services:
  k3s:
    image: rancher/k3s:v1.28.2-k3s1
    container_name: k3s-dashboard
    privileged: true
    ports:
      - "6443:6443"           # Acesso à API do Kubernetes
      - "30000-32767:30000-32767"  # Portas para NodePort services (útil para o dashboard)
    volumes:
      - k3s-server:/var/lib/rancher/k3s
      - ./dashboard-setup.sh:/scripts/dashboard-setup.sh
    environment:
      - K3S_KUBECONFIG_MODE=644
    entrypoint:
      - /bin/sh
      - -c
      - |
        # Inicia o k3s em background
        /usr/local/bin/k3s server &
        
        # Aguarda o serviço iniciar
        sleep 10
        
        # Executa o script de instalação do dashboard
        chmod +x /scripts/dashboard-setup.sh && /scripts/dashboard-setup.sh
        
        # Mantém o container ativo
        tail -f /dev/null

volumes:
  k3s-server:



# dashboard-setup.sh

#!/bin/bash

# Instala o Kubernetes Dashboard
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml 

# Cria um ServiceAccount para o Dashboard
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
EOF

# Cria um ClusterRoleBinding para permissões
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
EOF

# Cria um NodePort service para acessar fora do container
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: kubernetes-dashboard-nodeport
  namespace: kubernetes-dashboard
spec:
  type: NodePort
  selector:
    k8s-app: kubernetes-dashboard
  ports:
    - protocol: TCP
      port: 443
      targetPort: 8443
      nodePort: 30000
EOF

echo "✅ Kubernetes Dashboard instalado!"
echo "🔗 Acesse: https://<IP_DO_HOST>:30000"
echo "🔑 Token de acesso:"
kubectl -n kubernetes-dashboard create token admin-user


# Baixar a versão correta (amd64/x86_64)
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Dar permissão de execução
chmod +x kubectl

# Mover para o PATH
mv kubectl /usr/local/bin/

# Verificar se agora funciona
kubectl version --client



# k3d
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

# Criar cluster sem Traefik
k3d cluster create my-cluster \
  --api-port 6443 \
  --k3s-arg "--disable=traefik@server:0"

# Obter kubeconfig
k3d kubeconfig get my-cluster > kubeconfig.yaml

kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml 


kubectl create serviceaccount meu-sa -n default

# role-binding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: sa-role-binding
  namespace: default
subjects:
- kind: ServiceAccount
  name: meu-sa
  namespace: default
roleRef:
  kind: ClusterRole
  name: view
  apiGroup: rbac.authorization.k8s.io

  kubectl apply -f role-binding.yaml




# melhor ate o momento 

# Instale o k3d:
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh  | bash

apk add --no-cache kubectl openrc

k3d cluster create meu-cluster \
  --api-port 6443 \
  -p 80:80@loadbalancer \
  -p 443:443@loadbalancer \
  --registry-create k3d-registry

# Obter kubeconfig
k3d kubeconfig get my-cluster > kubeconfig.yaml


k3d cluster create meuucluster \
  --api-port 8443 \
  --k3s-arg "--kube-api-bypass-authentication"

k3d cluster create meucluster \
  --api-port 6443 \
  -p 80:80@loadbalancer \
  -p 443:443@loadbalancer \
  --args @all="--kube-api-bypass-authentication"



#!/bin/bash

# Define o kubeconfig
export KUBECONFIG=$(pwd)/kubeconfig.yaml

# Inicia o kubectl proxy para acesso seguro via HTTP
kubectl proxy --port=8080 &  
PROXY_PID=$!
sleep 5  # Espera o proxy iniciar

# Verifica conexão com o cluster
echo "🔍 Verificando conexão com o cluster..."
curl -s http://localhost:8080/api/v1/namespaces >/dev/null && echo "✅ Conexão OK" || { echo "❌ Falha na conexão"; kill $PROXY_PID; exit 1; }

# Definição do Pod em formato JSON inline
cat <<EOF > nginx-pod-10.json
{
  "apiVersion": "v1",
  "kind": "Pod",
  "metadata": {
    "name": "nginx-pod-10"
  },
  "spec": {
    "containers": [
      {
        "name": "nginx",
        "image": "nginx"
      }
    ]
  }
}
EOF

# Cria o Pod via HTTP
echo "📦 Criando Pod via HTTP..."
curl -s -X POST http://localhost:644/api/v1/namespaces/default/pods \
  -H "Content-Type: application/json" \
  --data-binary @nginx-pod-10.json

# Verifica se o Pod foi criado
echo -e "\n👀 Verificando se o Pod foi criado..."
kubectl get pod nginx-pod

# Limpeza
kill $PROXY_PID
rm nginx-pod.json


client-key-data: LS0tLS1CRUdJTiBFQyBQUklWQVRFIEtFWS0tLS0tCk1IY0NBUUVFSVBnS0hxK0tiWG1xamhmdmFqRjcyOHNFbDhMN2tqa0JwZlJubkk4L1lZTDlvQW9HQ0NxR1NNNDkKQXdFSG9VUURRZ0FFaG9tZWNBTHpXOHhEaHdvU2FlRm42TVlTcThiUjlYZ3Z3SWZTTFBERW4rNzRHcHBvcDlacQpoaTlQMjcyUVZLQVBDK1B6MmNIUGZGMnJhWFU1RWFwRWtBPT0KLS0tLS1FTkQgRUMgUFJJVkFURSBLRVktLS0tLQo=


# Instale o K3S (Configuração do Master Node)
curl -sfL https://get.k3s.io | K3S_KUBECONFIG_MODE="644" sh -s -

# Após a instalação, pegue o Token do Node Master
cat /etc/rancher/k3s/server/node-token


# token do k3s do WSL
K10c7ef99bb7b4c33bd644d1b1953f7af85791bcc7a004335017f498377b0cdcd34::server:00cdcc29d81d9b24656c1f1ed2dcd014

kubectl proxy &


curl -k https://192.168.1.172:6443/api/v1/namespaces \
  --header "Authorization: Bearer K10c7ef99bb7b4c33bd644d1b1953f7af85791bcc7a004335017f498377b0cdcd34::server:00cdcc29d81d9b24656c1f1ed2dcd014"

  # rota de pods http://localhost:8001/api/v1/namespaces/default/pods/meu-cu

  # rotda de depoloymets http://localhost:8001/apis/apps/v1/namespaces/default/deployments/nginx-http://localhost:8001/apis/apps/v1/namespaces/default/deployments

  kubectl get deployments
kubectl get services
kubectl get pods