import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 性能监控指标实体
 * 存储前端性能数据，用于分析和优化
 */
@Entity('performance_metrics')
@Index(['url', 'createdAt']) // 为URL和创建时间创建索引，提升查询性能
@Index(['userAgent']) // 为用户代理创建索引
export class PerformanceMetric {
  @PrimaryGeneratedColumn()
  id: number;

  // ===== 页面信息 =====
  @Column({ type: 'varchar', length: 2000, comment: '页面URL' })
  url: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '页面标题' })
  pageTitle?: string;

  // ===== 用户信息 =====
  @Column({ type: 'varchar', length: 1000, nullable: true, comment: '用户代理' })
  userAgent?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '用户IP地址' })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '用户钱包地址' })
  walletAddress?: string;

  // ===== 核心Web指标 (Core Web Vitals) =====
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'First Contentful Paint (ms)' })
  fcp?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Largest Contentful Paint (ms)' })
  lcp?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'First Input Delay (ms)' })
  fid?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, comment: 'Cumulative Layout Shift' })
  cls?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Time to First Byte (ms)' })
  ttfb?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'First Meaningful Paint (ms)' })
  fmp?: number;

  // ===== 性能评分 =====
  
  @Column({ type: 'varchar', length: 20, nullable: true, comment: 'FCP评分: good/needs-improvement/poor' })
  fcpScore?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: 'LCP评分: good/needs-improvement/poor' })
  lcpScore?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: 'FID评分: good/needs-improvement/poor' })
  fidScore?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: 'CLS评分: good/needs-improvement/poor' })
  clsScore?: string;

  // ===== 资源加载信息 =====
  
  @Column({ type: 'int', nullable: true, comment: 'DNS查询时间 (ms)' })
  dnsTime?: number;

  @Column({ type: 'int', nullable: true, comment: 'TCP连接时间 (ms)' })
  tcpTime?: number;

  @Column({ type: 'int', nullable: true, comment: 'SSL握手时间 (ms)' })
  sslTime?: number;

  @Column({ type: 'int', nullable: true, comment: '请求响应时间 (ms)' })
  requestTime?: number;

  @Column({ type: 'int', nullable: true, comment: '资源下载时间 (ms)' })
  downloadTime?: number;

  @Column({ type: 'int', nullable: true, comment: 'DOM解析时间 (ms)' })
  domParseTime?: number;

  @Column({ type: 'int', nullable: true, comment: 'DOM内容加载完成时间 (ms)' })
  domContentLoadedTime?: number;

  @Column({ type: 'int', nullable: true, comment: '页面完全加载时间 (ms)' })
  loadTime?: number;

  // ===== 设备和网络信息 =====
  
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '设备类型: mobile/tablet/desktop' })
  deviceType?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '操作系统' })
  os?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '浏览器' })
  browser?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '浏览器版本' })
  browserVersion?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '网络类型: 4g/5g/wifi等' })
  connectionType?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '有效网络类型下行速度 (Mbps)' })
  downlink?: number;

  @Column({ type: 'int', nullable: true, comment: '往返时间 (ms)' })
  rtt?: number;

  // ===== 错误信息 =====
  
  @Column({ type: 'int', default: 0, comment: 'JavaScript错误数量' })
  errorCount?: number;

  @Column({ type: 'text', nullable: true, comment: '错误详情(JSON格式)' })
  errors?: string;

  // ===== 附加数据 =====
  
  @Column({ type: 'text', nullable: true, comment: '额外元数据(JSON格式)' })
  metadata?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '会话ID' })
  sessionId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '监控SDK版本' })
  sdkVersion?: string;

  // ===== 时间戳 =====
  
  @CreateDateColumn({ comment: '记录创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '记录更新时间' })
  updatedAt: Date;

  @Column({ type: 'bigint', nullable: true, comment: '性能数据采集时间戳' })
  timestamp?: number;
}

