# Tim's Fantasy World - 測試自動化 Makefile

.PHONY: help test-all test-basic test-interactive test-performance test-setup clean

# 預設目標
help:
	@echo "Tim's Fantasy World - 測試套件"
	@echo "================================"
	@echo ""
	@echo "可用命令："
	@echo "  make test-setup      - 設置測試環境"
	@echo "  make test-all        - 執行完整測試套件"
	@echo "  make test-basic      - 執行基礎連接測試"
	@echo "  make test-interactive - 執行互動功能測試"
	@echo "  make test-performance - 執行效能測試"
	@echo "  make test-api        - 執行 API 測試"
	@echo "  make test-frontend   - 執行前端測試"
	@echo "  make test-backend    - 執行後端測試"
	@echo "  make test-cms        - 執行 CMS 測試"
	@echo "  make clean           - 清理測試文件"
	@echo "  make logs            - 查看最新測試日誌"
	@echo "  make status          - 檢查服務狀態"

# 設置測試環境
test-setup:
	@echo "🔧 設置測試環境..."
	@chmod +x curl-test-suite.sh
	@chmod +x interactive-test-suite.sh
	@echo "✅ 測試腳本權限設置完成"

# 檢查服務狀態
status:
	@echo "📊 檢查服務狀態..."
	@echo "前端 (localhost:8000):"
	@curl -s -o /dev/null -w "  狀態碼: %{http_code}\n" http://localhost:8000 || echo "  ❌ 前端服務未運行"
	@echo "後端 (localhost:9000):"
	@curl -s -o /dev/null -w "  狀態碼: %{http_code}\n" http://localhost:9000/health || echo "  ❌ 後端服務未運行"
	@echo "CMS (localhost:8000/CMS):"
	@curl -s -o /dev/null -w "  狀態碼: %{http_code}\n" http://localhost:8000/CMS || echo "  ❌ CMS 服務未運行"

# 執行完整測試套件
test-all: test-setup
	@echo "🚀 執行完整測試套件..."
	@./curl-test-suite.sh
	@echo ""
	@echo "🎯 執行互動功能測試..."
	@./interactive-test-suite.sh

# 執行基礎連接測試
test-basic: test-setup
	@echo "🔌 執行基礎連接測試..."
	@curl -s -w "前端首頁 - 狀態碼: %{http_code}, 響應時間: %{time_total}s\n" -o /dev/null http://localhost:8000
	@curl -s -w "後端 API - 狀態碼: %{http_code}, 響應時間: %{time_total}s\n" -o /dev/null http://localhost:9000/health
	@curl -s -w "CMS 頁面 - 狀態碼: %{http_code}, 響應時間: %{time_total}s\n" -o /dev/null http://localhost:8000/CMS

# 執行互動功能測試
test-interactive: test-setup
	@echo "🎮 執行互動功能測試..."
	@./interactive-test-suite.sh

# 執行效能測試
test-performance: test-setup
	@echo "⚡ 執行效能測試..."
	@echo "測試首頁載入時間..."
	@for i in 1 2 3 4 5; do \
		curl -s -w "第 $$i 次 - 響應時間: %{time_total}s\n" -o /dev/null http://localhost:8000/tw; \
	done
	@echo "測試 API 響應時間..."
	@for i in 1 2 3 4 5; do \
		curl -s -w "第 $$i 次 API - 響應時間: %{time_total}s\n" -o /dev/null http://localhost:9000/store/products; \
	done

# 執行 API 測試
test-api: test-setup
	@echo "🔌 執行 API 測試..."
	@echo "測試 Medusa API..."
	@curl -s -w "商店資訊 - 狀態碼: %{http_code}\n" -H "Accept: application/json" -o /dev/null http://localhost:9000/store
	@curl -s -w "產品列表 - 狀態碼: %{http_code}\n" -H "Accept: application/json" -o /dev/null http://localhost:9000/store/products
	@curl -s -w "區域資訊 - 狀態碼: %{http_code}\n" -H "Accept: application/json" -o /dev/null http://localhost:9000/store/regions
	@echo "測試前端 API..."
	@curl -s -w "客戶 API - 狀態碼: %{http_code}\n" -H "Accept: application/json" -o /dev/null http://localhost:8000/api/customer
	@curl -s -w "頁面列表 API - 狀態碼: %{http_code}\n" -H "Accept: application/json" -o /dev/null http://localhost:8000/api/pages/list

# 執行前端測試
test-frontend: test-setup
	@echo "💻 執行前端頁面測試..."
	@echo "主要頁面測試..."
	@curl -s -w "首頁 - 狀態碼: %{http_code}\n" -o /dev/null http://localhost:8000/tw
	@curl -s -w "商品頁 - 狀態碼: %{http_code}\n" -o /dev/null http://localhost:8000/tw/store
	@curl -s -w "部落格 - 狀態碼: %{http_code}\n" -o /dev/null http://localhost:8000/tw/blog
	@curl -s -w "購物車 - 狀態碼: %{http_code}\n" -o /dev/null http://localhost:8000/tw/cart
	@echo "會員功能測試..."
	@curl -s -w "登入頁 - 狀態碼: %{http_code}\n" -o /dev/null http://localhost:8000/tw/account/login
	@curl -s -w "註冊頁 - 狀態碼: %{http_code}\n" -o /dev/null http://localhost:8000/tw/account/register
	@curl -s -w "會員中心 - 狀態碼: %{http_code}\n" -o /dev/null http://localhost:8000/tw/account

# 執行後端測試
test-backend: test-setup
	@echo "🛠️ 執行後端服務測試..."
	@curl -s -w "健康檢查 - 狀態碼: %{http_code}\n" -H "Accept: application/json" -o /dev/null http://localhost:9000/health
	@curl -s -w "商店資訊 - 狀態碼: %{http_code}\n" -H "Accept: application/json" -o /dev/null http://localhost:9000/store
	@curl -s -w "產品 API - 狀態碼: %{http_code}\n" -H "Accept: application/json" -o /dev/null http://localhost:9000/store/products
	@curl -s -w "分類 API - 狀態碼: %{http_code}\n" -H "Accept: application/json" -o /dev/null http://localhost:9000/store/categories

# 執行 CMS 測試
test-cms: test-setup
	@echo "📝 執行 CMS 測試..."
	@curl -s -w "Sanity Studio - 狀態碼: %{http_code}\n" -o /dev/null http://localhost:8000/CMS
	@curl -s -w "Sanity Vision - 狀態碼: %{http_code}\n" -o /dev/null http://localhost:8000/CMS/vision || echo "  Vision 可能需要認證"
	@curl -s -w "頁面 API - 狀態碼: %{http_code}\n" -H "Accept: application/json" -o /dev/null http://localhost:8000/api/pages/list

# 查看最新測試日誌
logs:
	@echo "📄 最新測試日誌..."
	@ls -t curl-test-results-*.log 2>/dev/null | head -1 | xargs tail -20 || echo "找不到測試日誌文件"

# 清理測試文件
clean:
	@echo "🧹 清理測試文件..."
	@rm -f curl-test-results-*.log
	@rm -f test-cookies.txt
	@rm -f interactive-test-*.log
	@echo "✅ 清理完成"

# 快速健康檢查
health-check:
	@echo "🏥 快速健康檢查..."
	@printf "前端: "
	@curl -s -f http://localhost:8000/tw >/dev/null && echo "✅ 正常" || echo "❌ 異常"
	@printf "後端: "
	@curl -s -f http://localhost:9000/health >/dev/null && echo "✅ 正常" || echo "❌ 異常"
	@printf "CMS: "
	@curl -s -f http://localhost:8000/CMS >/dev/null && echo "✅ 正常" || echo "❌ 異常"

# 連續監控
monitor:
	@echo "👀 開始連續監控 (每 30 秒檢查一次，按 Ctrl+C 停止)..."
	@while true; do \
		echo "$(date): 檢查中..."; \
		make health-check; \
		echo ""; \
		sleep 30; \
	done

# 壓力測試
stress-test:
	@echo "💪 執行輕量壓力測試..."
	@echo "對首頁執行 10 次並發請求..."
	@for i in {1..10}; do \
		(curl -s -w "請求 $$i - 時間: %{time_total}s, 狀態: %{http_code}\n" -o /dev/null http://localhost:8000/tw &); \
	done; \
	wait
	@echo "壓力測試完成"

# 生成測試報告
report:
	@echo "📊 生成測試報告..."
	@echo "# Tim's Fantasy World 測試報告" > test-report.md
	@echo "生成時間: $(shell date)" >> test-report.md
	@echo "" >> test-report.md
	@echo "## 服務狀態" >> test-report.md
	@make status >> test-report.md 2>/dev/null || true
	@echo "" >> test-report.md
	@echo "## 最新測試結果" >> test-report.md
	@ls -t curl-test-results-*.log 2>/dev/null | head -1 | xargs tail -10 >> test-report.md || echo "無測試日誌" >> test-report.md
	@echo "✅ 報告已生成: test-report.md"