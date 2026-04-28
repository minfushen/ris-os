#!/bin/bash

echo "======================================"
echo "企业风险评估 Agent 功能测试"
echo "======================================"
echo ""

# 测试 API
echo "1. 测试后端 API..."
echo "请求: POST /api/qcc/assess-vendor-risk"
echo "企业: 华为技术有限公司"
echo ""

RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/qcc/assess-vendor-risk \
  -H "Content-Type: application/json" \
  -d '{"company_name": "华为技术有限公司"}')

echo "响应:"
echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"企业名称: {data['company_name']}\")
print(f\"整体风险: {data['overall_risk']}\")
print(f\"评估时间: {data['assessment_time']}\")
print(f\"风险维度数: {len(data['dimensions'])}\")
print(f\"风险类别数: {len(data['risk_categories'])}\")
print(f\"证据链数: {len(data['evidence_chain'])}\")
print(f\"处置建议数: {len(data['disposition_suggestions'])}\")
"

echo ""
echo "======================================"
echo "2. 前端页面访问地址"
echo "======================================"
echo "企业风险评估 Agent: http://localhost:5173/agents/vendor-risk-assessment"
echo ""
echo "操作步骤:"
echo "1. 打开浏览器访问上述地址"
echo "2. 在输入框中输入企业名称（如：华为技术有限公司）"
echo "3. 点击"开始评估"按钮"
echo "4. 查看评估结果"
echo ""
echo "======================================"
echo "测试完成！"
echo "======================================"
