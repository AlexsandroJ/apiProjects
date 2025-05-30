
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


apk add --no-cache kubectl openrc



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



# Instale o K3S (Configuração do Master Node)
curl -sfL https://get.k3s.io | sh -s -

systemctl status k3s

# Onde encontrar tokens válidos?
# a) Token do bootstrap (geralmente usado por outros nodes):
#   Localizado em: /var/lib/rancher/k3s/server/node-token
#   Este é o token usado para adicionar novos nós ao cluster, não serve para autenticar na API como usuário final .
# b) Tokens de ServiceAccount:
#   Tokens associados a um ServiceAccount são armazenados como Secrets.

# Após a instalação, pegue o Token do Node Master
cat /etc/rancher/k3s/server/node-token

sudo cat /var/lib/rancher/k3s/server/node-token

#   Passo 1: Criar o ServiceAccount
#Crie um arquivo chamado sa-admin.yaml com o seguinte conteúdo:
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-sa
  namespace: default

kubectl apply -f sa-admin.yaml

#   Passo 2: Criar uma ClusterRoleBinding para dar permissões totais
#Agora vamos vincular esse ServiceAccount ao cluster-admin (role built-in com todas as permissões):

# Crie o arquivo crb-admin.yaml:

apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-sa-crb
subjects:
- kind: ServiceAccount
  name: admin-sa
  namespace: default
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io

kubectl apply -f crb-admin.yaml

kubectl get serviceaccount

kubectl exec test-pod -- cat /var/run/secrets/kubernetes.io/serviceaccount/token



# Para listar os secrets:
kubectl get secrets -A

# E para obter o token específico:
kubectl describe secret  k3s-serving -n kube-system

# token do k3s do WSL
K10c7ef99bb7b4c33bd644d1b1953f7af85791bcc7a004335017f498377b0cdcd34::server:00cdcc29d81d9b24656c1f1ed2dcd014

# token AWS
# k3s local
K1056da6363f3b0f03d54fcf3c99a1cafc7b4009bb14c515b7e1619e82a23ff2f28::server:e06914e570f3c0ae60090a43cd286ffe

# token da Acconunt
eyJhbGciOiJSUzI1NiIsImtpZCI6InE5MnJ3aFh1UDhpT3FyTWhzMTNrNWpZa2VvbDFwS0JyY1JXbURzNTBGY28ifQ.eyJhdWQiOlsiaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwiLCJrM3MiXSwiZXhwIjoxNzgwMTUxMDI4LCJpYXQiOjE3NDg2MTUwMjgsImlzcyI6Imh0dHBzOi8va3ViZXJuZXRlcy5kZWZhdWx0LnN2Yy5jbHVzdGVyLmxvY2FsIiwianRpIjoiMmUzMjVlN2QtMWVkOC00ZDJkLWE5YjEtOGI5NWUzYmY4NTgzIiwia3ViZXJuZXRlcy5pbyI6eyJuYW1lc3BhY2UiOiJkZWZhdWx0Iiwibm9kZSI6eyJuYW1lIjoiaXAtMTcyLTMxLTg4LTE5IiwidWlkIjoiNTI4MzU0Y2MtYzA5OC00YTdjLTkzOGUtZTlkNTEzMWMzOTQ2In0sInBvZCI6eyJuYW1lIjoidGVzdC1wb2QiLCJ1aWQiOiIyZGIxZDNjMC1jMzQ5LTQ0MGMtOWJiOC1kNjgyYWY4ZThkYzcifSwic2VydmljZWFjY291bnQiOnsibmFtZSI6ImFkbWluLXNhIiwidWlkIjoiZDRlNzVmY2QtZmIxMi00NmJkLTk5NzAtM2Q4ZTE0MmI0MjAyIn0sIndhcm5hZnRlciI6MTc0ODYxODYzNX0sIm5iZiI6MTc0ODYxNTAyOCwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmRlZmF1bHQ6YWRtaW4tc2EifQ.Qxe6X5jvhaqNjpJGHqn7Idu-aUCMR8pJsZzxAeg5PSeo6FNgCvi7EvWSY3aWevBsuESVRbHzMpz7TeEzvBdsvPdxK2zi4-5JaG1vvNRMHO6manRhC0g_EjcikIIL2D5-bU8NDf1umI7Z88ZEBC9fXU-s8rGCSuYSQnMX2rRt8kfyw6f_8xxc0RyETPxXHbf1ryLdHkSqxj2qRjtNo1Dty-t1-tqPKYAS-t2g1P44fUPnP77wgWWaot0mTE9Tt4S7sBKZXTpI955OaQVnjylCeiKBclu57UQ-umNN3Cwp1YZAKGNFRCOZmn6-V_IyQDqmmO_xeaLGUhf73TDwA-POxA

# certificado
kubectl exec test-pod -- cat /var/run/secrets/kubernetes.io/serviceaccount/ca.crt

MIIBeDCCAR2gAwIBAgIBADAKBggqhkjOPQQDAjAjMSEwHwYDVQQDDBhrM3Mtc2VydmVyLWNhQDE3NDg2MTQ1NzAwHhcNMjUwNTMwMTQxNjEwWhcNMzUwNTI4MTQxNjEwWjAjMSEwHwYDVQDDBhrM3Mtc2VydmVyLWNhQDE3NDg2MTQ1NzAwWTATBgcqhkjOPQIBBggqkjOPQMBBwNCAARvVbrFZ5uJMP/Jskc4GTxG790XndKFYQRMSLAVTAdY+mkj8dbv54mXrMQ+9/In/aWs7OjH7wD8mVnYF8O3p5po0IwQDAOBgNVHQ8BAf8EBAMCAqQwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUcxWtYMoceUqEXyrdq0+AbauhyPcwCgYIKoZIzj0EAwIDSQAwRgIhAJGnjbChovY/dDDU4CnJ6+Cm1alpg2SSuS/Li4zXBAKyAiEA7gwS67zZHjAk/Rcyrm82zwgkwfGpcfRY0E58Y3VMjoM=



kubectl proxy &

curl -k https://52.70.50.93:6443/api/v1/namespaces \
  --header "Authorization: Bearer D15F11261803E967DF163781E1213B13A8B24C65" \
  

curl -k https://52.70.50.93:6443/api/v1/namespaces/default/pods \
  --header "Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InE5MnJ3aFh1UDhpT3FyTWhzMTNrNWpZa2VvbDFwS0JyY1JXbURzNTBGY28ifQ.eyJhdWQiOlsiaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwiLCJrM3MiXSwiZXhwIjoxNzgwMTUxMDI4LCJpYXQiOjE3NDg2MTUwMjgsImlzcyI6Imh0dHBzOi8va3ViZXJuZXRlcy5kZWZhdWx0LnN2Yy5jbHVzdGVyLmxvY2FsIiwianRpIjoiMmUzMjVlN2QtMWVkOC00ZDJkLWE5YjEtOGI5NWUzYmY4NTgzIiwia3ViZXJuZXRlcy5pbyI6eyJuYW1lc3BhY2UiOiJkZWZhdWx0Iiwibm9kZSI6eyJuYW1lIjoiaXAtMTcyLTMxLTg4LTE5IiwidWlkIjoiNTI4MzU0Y2MtYzA5OC00YTdjLTkzOGUtZTlkNTEzMWMzOTQ2In0sInBvZCI6eyJuYW1lIjoidGVzdC1wb2QiLCJ1aWQiOiIyZGIxZDNjMC1jMzQ5LTQ0MGMtOWJiOC1kNjgyYWY4ZThkYzcifSwic2VydmljZWFjY291bnQiOnsibmFtZSI6ImFkbWluLXNhIiwidWlkIjoiZDRlNzVmY2QtZmIxMi00NmJkLTk5NzAtM2Q4ZTE0MmI0MjAyIn0sIndhcm5hZnRlciI6MTc0ODYxODYzNX0sIm5iZiI6MTc0ODYxNTAyOCwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmRlZmF1bHQ6YWRtaW4tc2EifQ.Qxe6X5jvhaqNjpJGHqn7Idu-aUCMR8pJsZzxAeg5PSeo6FNgCvi7EvWSY3aWevBsuESVRbHzMpz7TeEzvBdsvPdxK2zi4-5JaG1vvNRMHO6manRhC0g_EjcikIIL2D5-bU8NDf1umI7Z88ZEBC9fXU-s8rGCSuYSQnMX2rRt8kfyw6f_8xxc0RyETPxXHbf1ryLdHkSqxj2qRjtNo1Dty-t1-tqPKYAS-t2g1P44fUPnP77wgWWaot0mTE9Tt4S7sBKZXTpI955OaQVnjylCeiKBclu57UQ-umNN3Cwp1YZAKGNFRCOZmn6-V_IyQDqmmO_xeaLGUhf73TDwA-POxA"

  # rota de pods http://localhost:8001/api/v1/namespaces/default/pods/meu-cu

  # rotda de depoloymets http://localhost:8001/apis/apps/v1/namespaces/default/deployments/nginx-http://localhost:8001/apis/apps/v1/namespaces/default/deployments

kubectl get deployments
kubectl get services
kubectl get pods

# teste conexão, retorna versão do kubernets
curl -k https://52.70.50.93:6443/version \
  --insecure

# Teste o token com curl (acessando a API do Kubernetes):
curl -vk https://3.84.197.170:6443/api  \
  --header "Authorization: Bearer K1056da6363f3b0f03d54fcf3c99a1cafc7b4009bb14c515b7e1619e82a23ff2f28::server:e06914e570f3c0ae60090a43cd286ffe" \
  --insecure



  