# 데이터베이스 마이그레이션 도구

이 도구는 OLD 데이터베이스에서 NEW 데이터베이스로 데이터를 마이그레이션하기 위한 스크립트 모음입니다.

## 전제 조건

- Node.js 및 npm/yarn이 설치되어 있어야 합니다.
- PostgreSQL 클라이언트 도구(psql)가 설치되어 있어야 합니다.
- Python 3이 설치되어 있어야 합니다.
- TypeScript와 ts-node가 설치되어 있어야 합니다.

## 설치

1. 필요한 패키지 설치:

```bash
npm install
# 또는
yarn
```

2. `.env` 파일 설정:

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음과 같이 설정합니다:

```
# OLD 데이터베이스 설정
OLD_AWS_RDS_DB_HOST=old-db-host
OLD_AWS_RDS_DB_PORT=5432
OLD_AWS_RDS_DB_USER=username
OLD_AWS_RDS_DB_PASSWORD=password
OLD_AWS_RDS_DB_NAME=moby

# NEW 데이터베이스 설정
AWS_RDS_DB_HOST=new-db-host
AWS_RDS_DB_PORT=5432
AWS_RDS_DB_USER=username
AWS_RDS_DB_PASSWORD=password
AWS_RDS_DB_NAME=moby
```

## 사용 방법

### 단일 엔티티 마이그레이션 (권장)

엔티티를 하나씩 마이그레이션하려면 다음 명령을 사용하세요:

```bash
bash scripts/migrate-entity.sh
```

이 명령은 인터랙티브 모드로 실행되어 마이그레이션할 엔티티와 배치 크기를 선택할 수 있습니다.

또는 직접 엔티티와 배치 크기를 지정할 수도 있습니다:

```bash
bash scripts/migrate-entity.sh position 500
```

단일 엔티티 마이그레이션은 다음 과정으로 진행됩니다:

1. 사용 가능한 엔티티 목록 표시
2. 마이그레이션할 엔티티 선택
3. 배치 크기 설정
4. 스키마 비교 실행으로 엔티티 구조 확인 (자동 수행)
5. 스키마 비교 결과 확인 후 계속 진행 여부 선택
6. 선택한 엔티티 마이그레이션 실행

**개선된 기능:**
- 스키마 비교가 자동으로 수행되어 마이그레이션 전에 문제점을 확인할 수 있습니다
- 치명적인 이슈가 발견될 경우 경고 메시지와 함께 취소 기회를 제공합니다
- OLD 데이터베이스 연결 실패 시 자동으로 대응 방안을 제시합니다

### 전체 마이그레이션

모든 엔티티를 한 번에 마이그레이션하려면:

```bash
bash scripts/migrate-old-to-new.sh
```

이 스크립트는 다음 단계를 제공합니다:

1. **스키마 비교**: OLD 및 NEW 데이터베이스의 스키마를 비교하여 차이점을 분석합니다.
2. **TypeORM 마이그레이션**: TypeORM을 사용하여 데이터를 마이그레이션합니다.
3. **PostgreSQL 직접 마이그레이션**: PostgreSQL 명령을 사용하여 데이터를 마이그레이션합니다.
4. **모든 단계 실행**: 위의 모든 단계를 순서대로 실행합니다.

### 실행 순서 권장사항

스키마 의존성이 있는 엔티티들을 고려하여 다음 순서로 마이그레이션을 진행하는 것이 좋습니다:

1. `synced-block`
2. `synced-request-index`
3. `position`
4. `position-history`
5. 그 외 엔티티들

## 스크립트 설명

### schema-compare.ts

두 데이터베이스의 스키마를 비교하고 차이점을 분석합니다. 마이그레이션 전에 이 스크립트를 실행하여 테이블과 컬럼의 차이를 확인하는 것이 좋습니다.

```bash
npx ts-node scripts/schema-compare.ts
```

### typeorm-migrate-single.ts

TypeORM을 사용하여 단일 엔티티의 데이터를 마이그레이션합니다. 엔티티 키와 선택적으로 배치 크기를 인수로 받습니다. 이 스크립트는 스키마 비교를 자동으로 수행합니다.

```bash
npx ts-node scripts/typeorm-migrate-single.ts position 500
```

### typeorm-migrate.ts

TypeORM을 사용하여 모든 엔티티의 데이터를 마이그레이션합니다.

```bash
npx ts-node scripts/typeorm-migrate.ts
```

### migrate-db.sh

PostgreSQL 명령을 직접 사용하여 데이터를 마이그레이션합니다. 이 방법은 대량의 데이터를 빠르게 마이그레이션하는 데 좋습니다.

```bash
bash scripts/migrate-db.sh
```

## 로그

모든 마이그레이션 작업은 `logs` 디렉토리에 로그 파일을 생성합니다. 마이그레이션 진행 상황과 오류를 확인하려면 이 디렉토리의 로그 파일을 참조하세요.

## 문제 해결

### OLD 데이터베이스 연결 실패

- OLD 데이터베이스 호스트가 접근 가능한지 확인하세요.
- AWS RDS의 경우 보안 그룹 설정에서 현재 IP가 허용되어 있는지 확인하세요.
- 내부 VPC IP를 사용하는 경우 SSH 터널을 설정해 보세요:
  ```bash
  ssh -L 5433:내부-IP:5432 유저@접근가능한-EC2-인스턴스 -N
  ```
  그런 다음 .env 파일에서 OLD_AWS_RDS_DB_HOST=localhost, OLD_AWS_RDS_DB_PORT=5433으로 설정하세요.

## 주의사항

1. 마이그레이션 전에 항상 OLD 및 NEW 데이터베이스의 백업을 생성하세요.
2. 스키마 차이가 있는 경우 데이터 손실 가능성이 있으므로 신중하게 마이그레이션을 진행하세요.
3. 대용량 테이블의 경우 배치 크기를 적절히 조정하여 메모리 문제를 방지하세요.
4. 마이그레이션 중에는 데이터베이스에 대한 쓰기 작업을 일시 중지하는 것이 좋습니다. 