## supabase

### 注册账号

使用任意一个邮箱，我用的126邮箱
按照步骤创建组织，创建project
在上面有一个connect按钮，点击可以看到链接方式

### 三种链接

Supabase 的连接有三种常见方式（端口以 Dashboard 为准）：
• Direct（直连）：5432，直连数据库；适合长连接的后端服务（前提是你的运行环境支持 IPv6）。 ￼
• Session pooler（会话池）：5432（经由 Supavisor 代理到库），每个客户端会话独占底层连接；支持 IPv4，且在连接满时会排队，行为几乎等同直连。适合长连后端又不具备 IPv6 的环境。 ￼
• Transaction pooler（事务池）：6543（Supavisor 事务模式），只在事务/查询期间借用底层连接，事务结束就把连接还回池子；更省连接数，适合 Serverless/短连接场景。

### 查看对IP支持

看到一个 IPv6 地址（如 2406:...）=> 有 IPv6 出口
curl -6 https://ipv6.icanhazip.com
看到一个 IPv4 地址（如 203.0.113.5）=> 有 IPv4 出口
curl -4 https://ipv4.icanhazip.com

### 开启ssl

TypeORM 配 SSL 是在 传输层启用 TLS 加密与证书校验

1. 到 Supabase 项目 Dashboard → Connect / Database Settings → SSL（或 Connection Info & Certificate），下载 Supabase CA 根证书，并在客户端开启严格校验（verify-full / 提供 CA）。这是官方推荐的最强校验模式。
2. 将下载的crt文件放到src/config/目录下即可
   注意：在 Node pg 里不要把 sslmode 等 SSL 参数塞进连接串里混用，否则会覆盖你在 ssl:{...} 里传的设置；用上面这种 ssl 对象方式最稳。

### 修改环境变量

DB_HOST=
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=postgres(数据库名固定，不能修改)

### 测试是否连接成功

直接看自己的空间应该已经初始化出来表了
然后我还做了测试接口：
POST http://localhost:3000/api/supabase-test
{
"title": "Sample title", // 必填，<=200 字符
"description": "Optional..." // 选填，<=1000 字符
}

GET http://localhost:3000/api/supabase-test

GET http://localhost:3000/api/supabase-test/xxx

PATCH http://localhost:3000/api/supabase-test
{
"title": "New title", // 选填
"description": "Updated..." // 选填
}

DELETE http://localhost:3000/api/supabase-test/xxx
