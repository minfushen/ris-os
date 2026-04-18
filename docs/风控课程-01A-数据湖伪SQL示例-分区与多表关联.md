# 风控课程 · 01A 附录：数据湖伪 SQL 示例（分区 `dt` + 多表关联）

> 配合《风控课程-01-数据湖取数与多表关联》使用。以下为 **Hive/Spark SQL 风格** 的**伪代码**，表名、字段名按常见信贷数据湖习惯编写；落地时以贵机构元数据为准。

---

## 1. 场景目标

- **输入**：申请明细、审批结果、渠道维表；均以 **`dt`（分区日期，一般为业务日或落表日）** 分区。  
- **输出**：**按申请日 `dt` + 渠道** 的进件量、通过笔数、**通过率**。

---

## 2. 三张表（逻辑结构）

### 2.1 申请事实表 `dwd_loan_apply_di`

| 字段 | 类型 | 说明 |
|------|------|------|
| apply_id | string | 申请单号（主键粒度：一笔申请） |
| cust_id | string | 客户号 |
| channel_id | string | 渠道编码，关联维表 |
| product_code | string | 产品编码 |
| apply_ts | timestamp | 申请时间 |
| **dt** | string | **分区字段**，一般为 **申请日** `yyyy-MM-dd` |

> 约定：分析「按日进件」时，业务上常用 **申请发生日** 作为 `dt` 口径。

### 2.2 审批结果表 `dwd_loan_approve_result_di`

| 字段 | 类型 | 说明 |
|------|------|------|
| apply_id | string | 与申请表一致 |
| approve_flag | tinyint | 1=通过，0=拒绝（或枚举 P/R） |
| approve_ts | timestamp | 审批完成时间 |
| reject_reason_code | string | 可选，拒绝原因码 |
| **dt** | string | **分区**：常见两种口径——①与申请表一致（按申请日分区同步一行）；②按**审批日落表**（此时 JOIN 要特别注意，见 §5） |

下文 **示例 A** 假设：结果表与申请表 **均以申请日 `dt` 对齐**（即每条申请在「申请日分区」下能关联到唯一审批结果，或 T+1 回补）。

### 2.3 渠道维表 `dim_channel`

| 字段 | 类型 | 说明 |
|------|------|------|
| channel_id | string | 渠道编码（主键） |
| channel_name | string | 渠道名称 |
| channel_type | string | 可选：线上/线下/合作方 |
| start_date / end_date | string | 可选：缓慢变化维（SCD），简化时可忽略，仅全量维表 |

> 维表通常 **不按日分区** 或 **按全量快照日分区**；以下为简化 **LEFT JOIN 单版本维表**。

---

## 3. 示例 SQL（一）：单日单分区 —— 避免全表扫

**业务问题**：只看 **2025-03-01** 当天申请，按渠道算通过率。

```sql
-- 务必带分区，否则容易全表扫描
SELECT
  c.channel_id,
  c.channel_name,
  COUNT(1) AS apply_cnt,
  SUM(CASE WHEN r.approve_flag = 1 THEN 1 ELSE 0 END) AS approve_cnt,
  SUM(CASE WHEN r.approve_flag = 1 THEN 1 ELSE 0 END) * 1.0 / COUNT(1) AS approval_rate
FROM dwd_loan_apply_di AS a
LEFT JOIN dwd_loan_approve_result_di AS r
  ON a.apply_id = r.apply_id
 AND a.dt = r.dt                    -- 分区对齐：同日申请同分区结果
LEFT JOIN dim_channel AS c
  ON a.channel_id = c.channel_id
WHERE a.dt = '2025-03-01'          -- 申请分区：只扫一天
  AND r.dt = '2025-03-01'            -- 结果表若同口径，一并限制
GROUP BY c.channel_id, c.channel_name
ORDER BY apply_cnt DESC;
```

**说明**：

- `LEFT JOIN` 结果表：保留「尚未出结果」的申请时，拒绝笔数会算进 `apply_cnt`，通过率为 0；若只要已终审，可改为 `INNER JOIN r` 或加 `WHERE r.approve_flag IS NOT NULL`。  
- **分母口径**：此处分母为 **所有申请**；若分母改为「仅已审批」，需在 `WHERE` 或子查询中限定。

---

## 4. 示例 SQL（二）：多日区间 —— 按申请日 + 渠道趋势

**业务问题**：**2025-03-01～2025-03-07**，按 **申请日 + 渠道** 看通过率（可做「本周通过率」曲线）。

```sql
SELECT
  a.dt AS apply_dt,
  c.channel_id,
  c.channel_name,
  COUNT(1) AS apply_cnt,
  SUM(CASE WHEN r.approve_flag = 1 THEN 1 ELSE 0 END) AS approve_cnt,
  SUM(CASE WHEN r.approve_flag = 1 THEN 1 ELSE 0 END) * 1.0 / COUNT(1) AS approval_rate
FROM dwd_loan_apply_di AS a
LEFT JOIN dwd_loan_approve_result_di AS r
  ON a.apply_id = r.apply_id
 AND a.dt = r.dt
LEFT JOIN dim_channel AS c
  ON a.channel_id = c.channel_id
WHERE a.dt BETWEEN '2025-03-01' AND '2025-03-07'
  AND r.dt BETWEEN '2025-03-01' AND '2025-03-07'
GROUP BY a.dt, c.channel_id, c.channel_name
ORDER BY a.dt, c.channel_id;
```

**产品侧提示**：分析虾若说「本周通过率下降」，背后可能是 **按 `apply_dt` 维度的 GROUP BY**；需与数据侧确认 **周定义**（自然周 / 滚动 7 天）。

---

## 5. 常见坑：审批结果表的 `dt` 是「审批日」不是「申请日」

若结果表 **按审批日落分区**，则不能简单 `a.dt = r.dt`。常见做法：

### 5.1 子查询：先不限死 r 的分区，用 `apply_id` 关联后再过滤申请日

```sql
SELECT
  a.dt AS apply_dt,
  a.channel_id,
  COUNT(1) AS apply_cnt,
  SUM(CASE WHEN r.approve_flag = 1 THEN 1 ELSE 0 END) AS approve_cnt
FROM dwd_loan_apply_di AS a
LEFT JOIN dwd_loan_approve_result_di AS r
  ON a.apply_id = r.apply_id
-- 不在 ON 里写 a.dt = r.dt，避免丢数
WHERE a.dt = '2025-03-01'
  -- 若结果表很大，可能需要 r.dt 的范围估计，例如审批滞后不超过 30 天：
  AND (r.dt IS NULL OR r.dt BETWEEN '2025-03-01' AND '2025-03-31')
GROUP BY a.dt, a.channel_id;
```

**要点**：真实环境要查 **元数据**：结果表分区语义、**审批滞后** 分布，否则范围给太窄会 **丢关联**，太宽会 **扫太多分区**。

---

## 6. 示例 SQL（三）：维表缓慢变化（简化）

若渠道改名，存在 `dim_channel_scd` 带 `start_date`、`end_date`，关联时要保证 **申请日落在有效期内**（伪代码）：

```sql
LEFT JOIN dim_channel_scd AS c
  ON a.channel_id = c.channel_id
 AND a.dt >= c.start_date
 AND a.dt <= c.end_date
```

产品侧：若分析虾展示「渠道名称」，需知名称可能随时间变化，**历史看板**与**当前维表**可能不一致。

---

## 7. 与本地 Demo 数据的对照

| 真实多表（上文） | 本地 `Loan_approval_data_2025.csv` |
|------------------|-------------------------------------|
| 申请 + 结果 + 渠道维表 + `dt` 分区 | 单表宽表，无 `dt`，无独立维表 |
| 可做按日、按真实渠道体系归因 | 适合按 `product_type` / `loan_intent` 等**单表维度**做通过率 Demo |

**结论**：产品上要区分 **「多表 + 分区」的真实分析** 与 **「单表 + 无日期」的 Demo**；上线前需在 PRD/数据说明中写清 **口径与表依赖**。

---

## 8. 自检清单（给产品 / 分析一起过）

- [ ] `dt` 是 **申请日** 还是 **落表日** 还是 **审批日**？  
- [ ] 通过率分母是否包含 **审批中**？  
- [ ] 渠道用 **维表** 还是申请上 **冗余编码**？  
- [ ] 多日查询是否 **所有大表都带分区条件**？  
- [ ] 结果表与申请表 **是否同日分区**，若不是，JOIN 策略是什么？

---

*文档版本：与《风控课程-01-数据湖取数与多表关联》配套。*
