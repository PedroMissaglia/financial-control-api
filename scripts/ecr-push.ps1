param(
  [string]$Region = "sa-east-1",
  [string]$Repo = "financial-control-api"
)

$ErrorActionPreference = "Stop"

Write-Host "Conta AWS..."
$account = aws sts get-caller-identity --query Account --output text
if (-not $account) {
  throw "AWS CLI nao autenticado. Rode: aws configure"
}

$registry = "$account.dkr.ecr.$Region.amazonaws.com"
$image = "${registry}/${Repo}:latest"

Write-Host "Repositorio ECR $Repo em $Region..."
aws ecr describe-repositories --repository-names $Repo --region $Region 2>$null
if ($LASTEXITCODE -ne 0) {
  aws ecr create-repository --repository-name $Repo --region $Region | Out-Null
  Write-Host "Repositorio criado."
}

Write-Host "Login no ECR..."
aws ecr get-login-password --region $Region |
  docker login --username AWS --password-stdin $registry

Write-Host "Build da imagem (linux/amd64)..."
docker build --platform linux/amd64 -t $Repo .

Write-Host "Tag e push..."
docker tag "${Repo}:latest" $image
docker push $image

Write-Host ""
Write-Host "Pronto. Cole esta URI no App Runner:"
Write-Host $image
