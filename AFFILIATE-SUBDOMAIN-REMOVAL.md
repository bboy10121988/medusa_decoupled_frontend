# 🔄 Affiliate Admin 子網域移除完成

## ✅ 已完成的變更

### 1. **Middleware 更新**
- 移除了 `affiliate.localhost:8000` 子網域處理邏輯
- 現在 affiliate-admin 路由直接使用子路徑 `/[countryCode]/affiliate-admin`

### 2. **路由結構**
原本的路由結構已經正確設置為子路徑：
```
/tw/affiliate-admin              - 主頁
/tw/affiliate-admin/login        - 登入頁面
/tw/affiliate-admin/applications - 申請審核頁面
```

### 3. **API 路由**
API 路由保持不變，仍使用：
```
/api/affiliate-admin/applications
/api/affiliate-admin/applications/[id]/approve
/api/affiliate-admin/applications/[id]/reject
```

## 🎯 **新的訪問方式**

**原本（子網域）**：
- ❌ `http://affiliate.localhost:8000`

**現在（子路徑）**：
- ✅ `http://localhost:8000/tw/affiliate-admin`

## 📋 **測試清單**

請確認以下功能正常：

1. **基本頁面**：
   - [x] `http://localhost:8000/tw/affiliate-admin` - 主頁
   - [x] `http://localhost:8000/tw/affiliate-admin/login` - 登入
   - [x] `http://localhost:8000/tw/affiliate-admin/applications` - 申請管理

2. **API 功能**：
   - [x] 登入/登出功能
   - [x] 申請列表顯示
   - [x] 申請審核（通過/拒絕）

3. **導航**：
   - [x] 內部頁面間的導航連結
   - [x] 登入狀態檢查和重定向

## 🔗 **可選：添加快速導航**

如果需要，可以在主網站的某個地方添加到 affiliate-admin 的連結：

```tsx
<Link href="/tw/affiliate-admin">
  聯盟管理後台
</Link>
```

## ⚠️ **注意事項**

- 不再需要設定 `affiliate.localhost` 的子網域
- 所有現有的 affiliate-admin 功能都保持不變
- 如果有書籤或外部連結指向舊的子網域，需要更新為新的路徑
