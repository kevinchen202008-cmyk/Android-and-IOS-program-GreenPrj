# JSON Schema Definition

统一的数据格式定义，用于Android和Web平台之间的数据交换。

## 命名约定

- **字段命名**: camelCase（小驼峰）
- **日期格式**: ISO 8601字符串（例如：`2026-01-26T10:30:00Z`）
- **布尔值**: `true`/`false`（不使用1/0）
- **空值**: 使用`null`，不使用`undefined`

## 核心实体Schema

### AccountEntry (账目记录)

```json
{
  "id": "string (UUID)",
  "amount": "number (double, > 0)",
  "date": "string (ISO 8601)",
  "category": "string",
  "notes": "string | null",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

**示例:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 100.50,
  "date": "2026-01-26T10:30:00Z",
  "category": "food",
  "notes": "午餐",
  "createdAt": "2026-01-26T10:30:00Z",
  "updatedAt": "2026-01-26T10:30:00Z"
}
```

### Category (类别)

```json
{
  "id": "string (UUID)",
  "name": "string",
  "icon": "string | null",
  "color": "string | null",
  "createdAt": "string (ISO 8601)"
}
```

**示例:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "food",
  "icon": "restaurant",
  "color": "#FF9800",
  "createdAt": "2026-01-26T10:30:00Z"
}
```

### Budget (预算)

```json
{
  "id": "string (UUID)",
  "type": "string ('monthly' | 'yearly')",
  "amount": "number (double, > 0)",
  "year": "number (integer, >= 2000)",
  "month": "number (integer, 1-12) | null (for yearly budget)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

**示例 (月度预算):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "type": "monthly",
  "amount": 5000.00,
  "year": 2026,
  "month": 1,
  "createdAt": "2026-01-26T10:30:00Z",
  "updatedAt": "2026-01-26T10:30:00Z"
}
```

**示例 (年度预算):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "type": "yearly",
  "amount": 60000.00,
  "year": 2026,
  "month": null,
  "createdAt": "2026-01-26T10:30:00Z",
  "updatedAt": "2026-01-26T10:30:00Z"
}
```

### OperationLog (操作日志)

```json
{
  "id": "string (UUID)",
  "operation": "string",
  "type": "string",
  "content": "string",
  "result": "string ('success' | 'failure')",
  "timestamp": "string (ISO 8601)"
}
```

**示例:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "operation": "accounting.entry.created",
  "type": "create",
  "content": "Created account entry with amount 100.50",
  "result": "success",
  "timestamp": "2026-01-26T10:30:00Z"
}
```

## 数据交换格式

### 导出格式 (Export Format)

```json
{
  "version": "string (schema version, e.g., '1.0.0')",
  "exportedAt": "string (ISO 8601)",
  "data": {
    "accounts": "AccountEntry[]",
    "categories": "Category[]",
    "budgets": "Budget[]",
    "operationLogs": "OperationLog[]"
  }
}
```

**示例:**
```json
{
  "version": "1.0.0",
  "exportedAt": "2026-01-26T10:30:00Z",
  "data": {
    "accounts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "amount": 100.50,
        "date": "2026-01-26T10:30:00Z",
        "category": "food",
        "notes": "午餐",
        "createdAt": "2026-01-26T10:30:00Z",
        "updatedAt": "2026-01-26T10:30:00Z"
      }
    ],
    "categories": [],
    "budgets": [],
    "operationLogs": []
  }
}
```

## 验证规则

### AccountEntry验证
- `id`: 必填，非空字符串，UUID格式
- `amount`: 必填，数字，必须大于0
- `date`: 必填，ISO 8601格式字符串
- `category`: 必填，非空字符串
- `notes`: 可选，字符串或null
- `createdAt`: 必填，ISO 8601格式字符串
- `updatedAt`: 必填，ISO 8601格式字符串

### Category验证
- `id`: 必填，非空字符串，UUID格式
- `name`: 必填，非空字符串
- `icon`: 可选，字符串或null
- `color`: 可选，字符串或null（颜色代码格式）
- `createdAt`: 必填，ISO 8601格式字符串

### Budget验证
- `id`: 必填，非空字符串，UUID格式
- `type`: 必填，必须是'monthly'或'yearly'
- `amount`: 必填，数字，必须大于0
- `year`: 必填，整数，>= 2000
- `month`: 如果type为'monthly'则必填（1-12），如果type为'yearly'则必须为null
- `createdAt`: 必填，ISO 8601格式字符串
- `updatedAt`: 必填，ISO 8601格式字符串

## 版本控制

Schema版本格式：`MAJOR.MINOR.PATCH`

- **MAJOR**: 不兼容的格式变更
- **MINOR**: 向后兼容的新字段
- **PATCH**: 向后兼容的修复

当前版本：`1.0.0`

## 未来增强

Schema设计支持以下未来增强：
- 添加新字段（向后兼容）
- 添加新的实体类型
- 扩展枚举值
- 添加可选字段

## 跨平台一致性

- Android和Web平台必须使用相同的JSON格式
- 所有日期时间必须使用ISO 8601格式
- 所有字段名必须使用camelCase
- 布尔值必须使用true/false，不使用1/0
- 空值必须使用null，不使用undefined
