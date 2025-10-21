## 添加helmet防护

1. Helmet 加的是一组 HTTP 头部来减小常见攻击面：dnsPrefetchControl 限制 DNS 预取、frameguard
2. 阻止 clickjacking、hsts 强制 HTTPS、xssFilter/contentSecurityPolicy
3. 降低 XSS、noSniff/ieNoOpen 等减少 MIME 嗅探与文件下载风险，单个项目可以按需开启或关闭这些子模块。

Content-Security-Policy 限制资源加载来源：页面只能向自身请求脚本/表单/图片等，阻止外链脚本和 clickjacking。
Cross-Origin-Opener-Policy 强制同源窗口环境，避免跨站共享浏览上下文，降低 Spectre 等攻击面。
Cross-Origin-Resource-Policy 禁止其他域直接访问你的资源，防止被当成跨站子资源盗用。
Origin-Agent-Cluster 让浏览器把该源隔离成独立 agent cluster，防止共享进程导致的跨站泄露。
Referrer-Policy 控制 Referer 头：no-referrer 让浏览器不携带来源 URL，保护隐私。
Strict-Transport-Security 强制浏览器未来只能用 HTTPS 访问该域（半年有效，含子域）。
X-Content-Type-Options 设为 nosniff 阻止浏览器 MIME 嗅探，避免脚本/样式误执行。
X-DNS-Prefetch-Control 设为 off 关闭 DNS 预取，防止提前暴露访问意图。
X-Download-Options 设为 noopen 禁止 IE 直接打开下载文件，需先保存，减少恶意文件执行。
X-Frame-Options 设为 SAMEORIGIN 禁止外站 iframe 嵌入页面，防止 clickjacking。
X-Permitted-Cross-Domain-Policies 设为 none 禁止 Flash/Adobe 跨域策略文件访问。
X-XSS-Protection 设为 0 正常是禁止旧版浏览器的反射 XSS 过滤器，以免引入副作用（现代浏览器已自带防护）。
