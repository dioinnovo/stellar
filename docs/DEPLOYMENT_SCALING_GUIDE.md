# Stellar Intelligence Platform
## Deployment & Scaling Guide

### Enterprise Production Deployment

This guide provides comprehensive deployment and scaling strategies for the Stellar Intelligence Platform across different environments and scale requirements.

---

## 🏗️ Infrastructure Requirements

### Minimum Production Environment

```yaml
# Minimum Resource Requirements
frontend:
  instances: 3
  cpu: 2 vCPU
  memory: 4 GB RAM
  storage: 20 GB SSD

api_services:
  instances: 5
  cpu: 4 vCPU
  memory: 8 GB RAM
  storage: 50 GB SSD

ai_processing:
  instances: 3
  cpu: 8 vCPU (GPU preferred)
  memory: 16 GB RAM
  gpu: NVIDIA T4 or equivalent
  storage: 100 GB NVMe SSD

database:
  primary: 1
  replicas: 2
  cpu: 8 vCPU
  memory: 32 GB RAM
  storage: 500 GB SSD (with backup)

redis_cache:
  instances: 3 (cluster)
  cpu: 2 vCPU
  memory: 8 GB RAM
  storage: 20 GB SSD

vector_database:
  instances: 3
  cpu: 4 vCPU
  memory: 16 GB RAM
  storage: 200 GB SSD
```

### Enterprise Scale Environment

```yaml
# Enterprise Scale Requirements (1000+ concurrent users)
frontend:
  instances: 10
  cpu: 4 vCPU
  memory: 8 GB RAM
  auto_scaling: true
  max_instances: 50

api_services:
  instances: 15
  cpu: 8 vCPU
  memory: 16 GB RAM
  auto_scaling: true
  max_instances: 100

ai_processing:
  instances: 10
  cpu: 16 vCPU
  memory: 64 GB RAM
  gpu: NVIDIA A100 or V100
  auto_scaling: true
  max_instances: 50

database:
  primary: 1
  read_replicas: 5
  cpu: 16 vCPU
  memory: 64 GB RAM
  storage: 2 TB SSD
  backup_retention: 30 days

redis_cache:
  cluster_size: 6
  cpu: 4 vCPU
  memory: 16 GB RAM
  high_availability: true

elasticsearch:
  instances: 6
  cpu: 8 vCPU
  memory: 32 GB RAM
  storage: 1 TB SSD
```

---

## ☁️ Cloud Deployment Architecture

### AWS Production Deployment

```yaml
# AWS Infrastructure as Code (Terraform)
provider "aws" {
  region = "us-east-1"
}

# VPC Configuration
resource "aws_vpc" "stellar_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "stellar-production-vpc"
  }
}

# EKS Cluster
resource "aws_eks_cluster" "stellar_cluster" {
  name     = "stellar-production"
  role_arn = aws_iam_role.cluster_role.arn
  version  = "1.27"

  vpc_config {
    subnet_ids = [
      aws_subnet.private_subnet_1a.id,
      aws_subnet.private_subnet_1b.id,
      aws_subnet.private_subnet_1c.id
    ]
    endpoint_config {
      private_access = true
      public_access  = true
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.cluster_policy,
    aws_iam_role_policy_attachment.service_policy,
  ]
}

# Node Groups
resource "aws_eks_node_group" "api_nodes" {
  cluster_name    = aws_eks_cluster.stellar_cluster.name
  node_group_name = "api-nodes"
  node_role_arn   = aws_iam_role.node_role.arn
  subnet_ids      = [aws_subnet.private_subnet_1a.id, aws_subnet.private_subnet_1b.id]

  instance_types = ["m5.xlarge"]
  capacity_type  = "ON_DEMAND"

  scaling_config {
    desired_size = 5
    max_size     = 20
    min_size     = 3
  }

  tags = {
    Name = "stellar-api-nodes"
  }
}

resource "aws_eks_node_group" "ai_nodes" {
  cluster_name    = aws_eks_cluster.stellar_cluster.name
  node_group_name = "ai-nodes"
  node_role_arn   = aws_iam_role.node_role.arn
  subnet_ids      = [aws_subnet.private_subnet_1a.id, aws_subnet.private_subnet_1b.id]

  instance_types = ["g4dn.xlarge"] # GPU instances
  capacity_type  = "ON_DEMAND"

  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 2
  }

  tags = {
    Name = "stellar-ai-nodes"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "stellar_db" {
  identifier     = "stellar-production-db"
  engine         = "postgres"
  engine_version = "14.9"
  instance_class = "db.r5.2xlarge"
  
  allocated_storage     = 500
  max_allocated_storage = 2000
  storage_type          = "gp3"
  storage_encrypted     = true
  
  db_name  = "stellar_production"
  username = "stellar_admin"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.stellar.name
  
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  performance_insights_enabled = true
  monitoring_interval         = 60
  
  tags = {
    Name = "stellar-production-db"
  }
}

# ElastiCache Redis
resource "aws_elasticache_replication_group" "stellar_redis" {
  replication_group_id       = "stellar-redis"
  description                = "Stellar Redis Cluster"
  
  num_cache_clusters         = 3
  node_type                  = "cache.r6g.xlarge"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  subnet_group_name          = aws_elasticache_subnet_group.stellar.name
  security_group_ids         = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  tags = {
    Name = "stellar-redis-cluster"
  }
}

# S3 Buckets
resource "aws_s3_bucket" "stellar_images" {
  bucket = "stellar-production-images"
  
  tags = {
    Name = "stellar-production-images"
  }
}

resource "aws_s3_bucket" "stellar_reports" {
  bucket = "stellar-production-reports"
  
  tags = {
    Name = "stellar-production-reports"
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "stellar_cdn" {
  origin {
    domain_name = aws_s3_bucket.stellar_images.bucket_regional_domain_name
    origin_id   = "stellar-images-origin"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }
  
  enabled = true
  
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "stellar-images-origin"
    
    forwarded_values {
      query_string = false
      
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

### Kubernetes Deployment Manifests

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: stellar-production
---

# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: stellar-config
  namespace: stellar-production
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  API_VERSION: "v1"
  MAX_UPLOAD_SIZE: "100MB"
  REDIS_CLUSTER_MODE: "true"
---

# secrets.yaml (encrypted)
apiVersion: v1
kind: Secret
metadata:
  name: stellar-secrets
  namespace: stellar-production
type: Opaque
data:
  database-url: <base64-encoded-db-url>
  redis-url: <base64-encoded-redis-url>
  api-key: <base64-encoded-api-key>
  jwt-secret: <base64-encoded-jwt-secret>
---

# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stellar-frontend
  namespace: stellar-production
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
  selector:
    matchLabels:
      app: stellar-frontend
  template:
    metadata:
      labels:
        app: stellar-frontend
    spec:
      containers:
      - name: frontend
        image: stellar/frontend:v1.2.3
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: API_URL
          value: "https://api.stellar.ai"
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 60
          periodSeconds: 30
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          readOnlyRootFilesystem: true
---

# api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stellar-api
  namespace: stellar-production
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 3
      maxUnavailable: 2
  selector:
    matchLabels:
      app: stellar-api
  template:
    metadata:
      labels:
        app: stellar-api
    spec:
      containers:
      - name: api
        image: stellar/api:v1.2.3
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: stellar-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: stellar-secrets
              key: redis-url
        resources:
          requests:
            memory: "4Gi"
            cpu: "2000m"
          limits:
            memory: "8Gi"
            cpu: "4000m"
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 60
          periodSeconds: 30
---

# ai-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stellar-ai
  namespace: stellar-production
spec:
  replicas: 5
  selector:
    matchLabels:
      app: stellar-ai
  template:
    metadata:
      labels:
        app: stellar-ai
    spec:
      nodeSelector:
        node-type: gpu
      containers:
      - name: ai-processor
        image: stellar/ai-processor:v1.2.3
        ports:
        - containerPort: 8001
        env:
        - name: CUDA_VISIBLE_DEVICES
          value: "0"
        - name: MODEL_CACHE_DIR
          value: "/models"
        resources:
          requests:
            memory: "16Gi"
            cpu: "4000m"
            nvidia.com/gpu: 1
          limits:
            memory: "32Gi"
            cpu: "8000m"
            nvidia.com/gpu: 1
        volumeMounts:
        - name: model-cache
          mountPath: /models
        readinessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 120
          periodSeconds: 30
      volumes:
      - name: model-cache
        persistentVolumeClaim:
          claimName: ai-model-cache
---

# hpa.yaml (Horizontal Pod Autoscaler)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: stellar-api-hpa
  namespace: stellar-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: stellar-api
  minReplicas: 5
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
---

# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: stellar-api-service
  namespace: stellar-production
spec:
  selector:
    app: stellar-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: ClusterIP
---

# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: stellar-ingress
  namespace: stellar-production
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.stellar.ai
    - app.stellar.ai
    secretName: stellar-tls
  rules:
  - host: api.stellar.ai
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: stellar-api-service
            port:
              number: 80
  - host: app.stellar.ai
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: stellar-frontend-service
            port:
              number: 80
```

---

## 📊 Monitoring & Observability

### Prometheus Monitoring Stack

```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    scrape_configs:
    - job_name: 'stellar-api'
      kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
          - stellar-production
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: stellar-api
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: (.+)
        replacement: ${1}:8000
    
    - job_name: 'stellar-ai'
      kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
          - stellar-production
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: stellar-ai
    
    - job_name: 'postgres-exporter'
      static_configs:
      - targets: ['postgres-exporter:9187']
    
    - job_name: 'redis-exporter'
      static_configs:
      - targets: ['redis-exporter:9121']
    
    rule_files:
    - "/etc/prometheus/rules/*.yml"
    
    alerting:
      alertmanagers:
      - static_configs:
        - targets:
          - alertmanager:9093

---
# alerts.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-rules
  namespace: monitoring
data:
  alerts.yml: |
    groups:
    - name: stellar.rules
      rules:
      - alert: HighCPUUsage
        expr: (100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% on {{ $labels.instance }}"
      
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 85% on {{ $labels.instance }}"
      
      - alert: APIHighLatency
        expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "API high latency"
          description: "95th percentile latency is above 2 seconds"
      
      - alert: AIProcessingQueueBacklog
        expr: ai_processing_queue_size > 100
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "AI processing queue backlog"
          description: "AI processing queue has {{ $value }} items"
      
      - alert: DatabaseConnectionsHigh
        expr: pg_stat_database_numbackends > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "Database has {{ $value }} active connections"
```

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Stellar Intelligence Platform - Production",
    "panels": [
      {
        "title": "API Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m]))",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "title": "API Latency",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "50th percentile"
          },
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "AI Processing Time",
        "type": "graph",
        "targets": [
          {
            "expr": "avg(ai_processing_duration_seconds)",
            "legendFormat": "Average processing time"
          }
        ]
      },
      {
        "title": "Database Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_tup_fetched",
            "legendFormat": "Rows fetched"
          },
          {
            "expr": "pg_stat_database_tup_inserted",
            "legendFormat": "Rows inserted"
          }
        ]
      }
    ]
  }
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/production-deploy.yml
name: Production Deployment
on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: stellar/platform

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [frontend, api, ai-processor]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
      working-directory: ./${{ matrix.service }}
    
    - name: Run tests
      run: npm test
      working-directory: ./${{ matrix.service }}
    
    - name: Run security audit
      run: npm audit --audit-level high
      working-directory: ./${{ matrix.service }}

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [frontend, api, ai-processor]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.service }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: ./${{ matrix.service }}
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --name stellar-production --region us-east-1
    
    - name: Deploy to Kubernetes
      run: |
        # Update image tags in deployment manifests
        sed -i "s|image: stellar/frontend:.*|image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:${{ github.sha }}|" k8s/frontend-deployment.yaml
        sed -i "s|image: stellar/api:.*|image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api:${{ github.sha }}|" k8s/api-deployment.yaml
        sed -i "s|image: stellar/ai-processor:.*|image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/ai-processor:${{ github.sha }}|" k8s/ai-deployment.yaml
        
        # Apply manifests
        kubectl apply -f k8s/
        
        # Wait for rollout
        kubectl rollout status deployment/stellar-frontend -n stellar-production --timeout=600s
        kubectl rollout status deployment/stellar-api -n stellar-production --timeout=600s
        kubectl rollout status deployment/stellar-ai -n stellar-production --timeout=600s
    
    - name: Run smoke tests
      run: |
        # Wait for services to be ready
        sleep 60
        
        # Test API health
        kubectl exec -n stellar-production deployment/stellar-api -- curl -f http://localhost:8000/api/v1/health
        
        # Test frontend
        curl -f https://app.stellar.ai/health
        
        # Test AI service
        kubectl exec -n stellar-production deployment/stellar-ai -- curl -f http://localhost:8001/health
    
    - name: Notify deployment status
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

---

## 📈 Performance Optimization

### Database Optimization

```sql
-- Production Database Optimization
-- Indexing Strategy
CREATE INDEX CONCURRENTLY idx_inspections_status_date 
ON inspections(status, created_at DESC) 
WHERE status IN ('pending', 'processing');

CREATE INDEX CONCURRENTLY idx_damage_assessments_cost_severity 
ON damage_assessments(estimated_cost DESC, severity_level DESC);

CREATE INDEX CONCURRENTLY idx_claims_intelligence_carrier_type 
ON claims_intelligence(carrier_name, claim_type);

-- Partitioning for large tables
CREATE TABLE inspections_2024 PARTITION OF inspections 
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE inspections_2025 PARTITION OF inspections 
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Connection pooling configuration
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '8GB';
ALTER SYSTEM SET effective_cache_size = '24GB';
ALTER SYSTEM SET work_mem = '64MB';
ALTER SYSTEM SET maintenance_work_mem = '1GB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
```

### Redis Caching Strategy

```typescript
// Production Redis Configuration
const redisConfig = {
  cluster: {
    enableReadyCheck: false,
    redisOptions: {
      password: process.env.REDIS_PASSWORD,
    },
    nodes: [
      { host: 'redis-cluster-001.cache.amazonaws.com', port: 6379 },
      { host: 'redis-cluster-002.cache.amazonaws.com', port: 6379 },
      { host: 'redis-cluster-003.cache.amazonaws.com', port: 6379 }
    ]
  },
  ttl: {
    short: 300,      // 5 minutes
    medium: 3600,    // 1 hour
    long: 86400,     // 24 hours
    persistent: 604800 // 7 days
  }
}

// Caching Strategy Implementation
class CacheManager {
  async getInspectionAnalysis(inspectionId: string) {
    const cacheKey = `analysis:${inspectionId}`
    
    // Try cache first
    const cached = await this.redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }
    
    // Generate analysis if not cached
    const analysis = await this.generateAnalysis(inspectionId)
    
    // Cache with appropriate TTL
    await this.redis.setex(
      cacheKey, 
      redisConfig.ttl.persistent, 
      JSON.stringify(analysis)
    )
    
    return analysis
  }
  
  async cacheMarketData(region: string, data: any) {
    const cacheKey = `market:${region}`
    await this.redis.setex(
      cacheKey, 
      redisConfig.ttl.medium, 
      JSON.stringify(data)
    )
  }
  
  async invalidateInspectionCache(inspectionId: string) {
    const pattern = `*${inspectionId}*`
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }
}
```

### CDN Configuration

```javascript
// CloudFront CDN Configuration
const cdnConfig = {
  behaviors: {
    images: {
      pathPattern: '/images/*',
      ttl: {
        min: 0,
        default: 86400,    // 1 day
        max: 31536000      // 1 year
      },
      compress: true,
      methods: ['GET', 'HEAD'],
      caching: {
        policy: 'CachingOptimized'
      }
    },
    api: {
      pathPattern: '/api/*',
      ttl: {
        min: 0,
        default: 0,
        max: 0
      },
      compress: true,
      methods: ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'],
      caching: {
        policy: 'CachingDisabled'
      },
      headers: ['Authorization', 'Content-Type']
    },
    reports: {
      pathPattern: '/reports/*',
      ttl: {
        min: 0,
        default: 3600,     // 1 hour
        max: 86400         // 1 day
      },
      compress: true,
      methods: ['GET', 'HEAD']
    }
  }
}
```

---

## 🔒 Security Configuration

### Production Security Checklist

```yaml
# Security Configuration
security:
  network:
    - Enable VPC with private subnets
    - Configure security groups with minimal access
    - Implement WAF rules for API protection
    - Enable GuardDuty for threat detection
    
  authentication:
    - Multi-factor authentication required
    - JWT tokens with short expiration
    - API key rotation every 90 days
    - OAuth 2.0 with PKCE for public clients
    
  encryption:
    - TLS 1.3 for all communications
    - Database encryption at rest (AES-256)
    - S3 bucket encryption enabled
    - Secrets stored in AWS Secrets Manager
    
  monitoring:
    - CloudTrail logging enabled
    - VPC Flow Logs activated
    - Application security monitoring
    - Automated vulnerability scanning
    
  compliance:
    - SOC 2 Type II audit preparation
    - GDPR compliance implementation
    - CCPA compliance for California users
    - HIPAA compliance for health data
```

### Secrets Management

```bash
# AWS Secrets Manager Integration
aws secretsmanager create-secret \
  --name "stellar/production/database" \
  --description "Database connection details" \
  --secret-string '{
    "username": "stellar_admin",
    "password": "secure_password_here",
    "host": "stellar-db.cluster-xyz.us-east-1.rds.amazonaws.com",
    "port": 5432,
    "database": "stellar_production"
  }'

aws secretsmanager create-secret \
  --name "stellar/production/api-keys" \
  --description "External API keys" \
  --secret-string '{
    "anthropic_api_key": "sk-...",
    "openai_api_key": "sk-...",
    "jwt_secret": "jwt_secret_here"
  }'

# Automatic rotation configuration
aws secretsmanager update-secret \
  --secret-id "stellar/production/database" \
  --rotation-lambda-arn "arn:aws:lambda:us-east-1:123456789:function:rotate-db-password" \
  --rotation-rules AutomaticallyAfterDays=90
```

---

## 🚀 Disaster Recovery & Backup

### Backup Strategy

```yaml
# Automated Backup Configuration
backup_strategy:
  database:
    automated_backups: true
    retention_period: 30_days
    backup_window: "03:00-04:00 UTC"
    point_in_time_recovery: true
    cross_region_backup: true
    
  file_storage:
    s3_versioning: enabled
    s3_replication: cross_region
    glacier_transition: 30_days
    deep_archive_transition: 365_days
    
  application_data:
    redis_persistence: enabled
    snapshot_frequency: daily
    retention: 7_days
    
  disaster_recovery:
    rpo_target: 1_hour    # Recovery Point Objective
    rto_target: 4_hours   # Recovery Time Objective
    secondary_region: us-west-2
    automated_failover: true
```

### Disaster Recovery Plan

```bash
#!/bin/bash
# Disaster Recovery Automation Script

# 1. Detect outage
monitor_health() {
    while true; do
        if ! curl -f https://api.stellar.ai/v1/health > /dev/null 2>&1; then
            echo "Health check failed, initiating failover..."
            initiate_failover
            break
        fi
        sleep 30
    done
}

# 2. Initiate failover to secondary region
initiate_failover() {
    # Switch Route 53 to point to secondary region
    aws route53 change-resource-record-sets \
        --hosted-zone-id Z123456789 \
        --change-batch file://failover-dns.json
    
    # Scale up secondary region infrastructure
    aws ecs update-service \
        --cluster stellar-disaster-recovery \
        --service stellar-api \
        --desired-count 10
    
    # Restore database from latest backup
    aws rds restore-db-instance-from-db-snapshot \
        --db-instance-identifier stellar-failover-db \
        --db-snapshot-identifier latest-automated-snapshot
    
    # Notify team
    send_alert "Failover initiated to us-west-2"
}

# 3. Recovery validation
validate_recovery() {
    # Test API endpoints
    curl -f https://api.stellar.ai/v1/health
    
    # Test database connectivity
    kubectl exec deployment/stellar-api -- pg_isready -h $DB_HOST
    
    # Verify data integrity
    run_data_integrity_checks
}
```

---

This comprehensive deployment and scaling guide provides enterprise-grade infrastructure patterns for the Stellar Intelligence Platform. The configuration supports high availability, auto-scaling, monitoring, security, and disaster recovery requirements for production environments.

**Implementation Timeline:**
- **Week 1-2**: Infrastructure setup and basic deployment
- **Week 3-4**: Monitoring and security configuration
- **Week 5-6**: Performance optimization and scaling tests
- **Week 7-8**: Disaster recovery setup and testing