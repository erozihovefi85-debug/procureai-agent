/**
 * 更新所有219个品类模板配置
 * 根据品类类型自动分配合适的模板字段
 */

import mongoose from 'mongoose';
import ProcurementCategory from '../models/ProcurementCategory.js';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 不同类型品类的模板配置
const CATEGORY_TEMPLATES = {
  // 软件开发类模板
  SOFTWARE_DEVELOPMENT: {
    keywords: ['软件', '开发', '系统', '平台', 'APP', '网站', '小程序', 'ERP', 'CRM', 'OA', '代码', '编程', '数据库类软件', '网络管理类软件', '办公类软件', '业务类软件', '其他类软件'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
      { key: '业务背景', label: '业务背景', required: true, width: 35, type: 'textarea' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '模块类别', label: '模块类别', required: true, width: 12, type: 'select', options: ['前端开发', '后端开发', '全栈开发', '移动端开发'] },
      { key: '功能需求', label: '功能需求', required: true, width: 40, type: 'textarea' },
      { key: '性能要求', label: '性能要求', required: false, width: 30, type: 'textarea' },
      { key: '安全要求', label: '安全要求', required: false, width: 30, type: 'textarea' },
      { key: '兼容性要求', label: '兼容性要求', required: false, width: 30, type: 'textarea' },
      { key: '技术栈', label: '技术栈', required: false, width: 25, type: 'text' },
      { key: '部署方式', label: '部署方式', required: false, width: 12, type: 'select', options: ['云服务器', '本地服务器', '混合部署'] },
      { key: '集成要求', label: '集成要求', required: false, width: 30, type: 'textarea' },
      { key: '代码标准', label: '代码标准', required: false, width: 25, type: 'text' },
      { key: '交付物', label: '交付物', required: false, width: 35, type: 'textarea' },
      { key: '预估工作量', label: '预估工作量', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '供应商经验要求', label: '供应商经验要求', required: false, width: 25, type: 'text' },
      { key: '认证要求', label: '认证要求', required: false, width: 30, type: 'text' },
      { key: '团队规模', label: '团队规模', required: false, width: 10, type: 'number' },
      { key: '交付日期', label: '交付日期', required: false, width: 15, type: 'date' },
      { key: '付款条件', label: '付款条件', required: false, width: 20, type: 'text' },
      { key: '质保期', label: '质保期', required: false, width: 15, type: 'text' },
      { key: '知识产权', label: '知识产权', required: false, width: 25, type: 'select', options: ['归甲方所有', '归乙方所有', '共同拥有'] },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 硬件采购类模板
  HARDWARE_PROCUREMENT: {
    keywords: ['服务器', '电脑', '硬件', '设备', '网络', '存储', '打印机', '办公设备', '办公电脑', '机房', 'IT硬件', '办公及外围设备', '办公室及会议室设备', '集中打印设备'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '物品名称', label: '物品名称', required: true, width: 25, type: 'text' },
      { key: '规格型号', label: '规格型号', required: true, width: 30, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '数量', label: '数量', required: true, width: 10, type: 'number' },
      { key: '单位', label: '单位', required: true, width: 8, type: 'select', options: ['台', '个', '套', '批'] },
      { key: '技术参数', label: '技术参数', required: false, width: 40, type: 'textarea' },
      { key: '品牌要求', label: '品牌要求', required: false, width: 20, type: 'text' },
      { key: '预算单价（元）', label: '预算单价（元）', required: false, width: 15, type: 'number' },
      { key: '预算总价（元）', label: '预算总价（元）', required: false, width: 15, type: 'number' },
      { key: '交货期限', label: '交货期限', required: false, width: 15, type: 'date' },
      { key: '质保期', label: '质保期', required: false, width: 15, type: 'text' },
      { key: '售后要求', label: '售后要求', required: false, width: 30, type: 'textarea' },
      { key: '验收标准', label: '验收标准', required: false, width: 30, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 咨询服务类模板
  CONSULTING_SERVICE: {
    keywords: ['咨询', '顾问', '培训', '服务', '咨询方案', '咨询报告', '专家', '顾问服务', '法律服务', '财务咨询', '人力资源', '猎头', '背景调查', '审计', '税务', '管理咨询', '战略咨询'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '咨询项目名称', label: '咨询项目名称', required: true, width: 25, type: 'text' },
      { key: '业务背景', label: '业务背景', required: true, width: 35, type: 'textarea' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '咨询类型', label: '咨询类型', required: true, width: 15, type: 'select', options: ['管理咨询', '技术咨询', '培训服务', '战略咨询'] },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '服务方式', label: '服务方式', required: false, width: 15, type: 'select', options: ['现场服务', '远程服务', '混合服务'] },
      { key: '服务周期', label: '服务周期', required: false, width: 15, type: 'text' },
      { key: '专家资质要求', label: '专家资质要求', required: false, width: 30, type: 'textarea' },
      { key: '交付成果', label: '交付成果', required: false, width: 35, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '开始日期', label: '开始日期', required: false, width: 15, type: 'date' },
      { key: '结束日期', label: '结束日期', required: false, width: 15, type: 'date' },
      { key: '付款方式', label: '付款方式', required: false, width: 20, type: 'text' },
      { key: '验收标准', label: '验收标准', required: false, width: 30, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 装修工程类模板
  RENOVATION_ENGINEERING: {
    keywords: ['装修', '工程', '机电', '暖通', '空调', '布线', '网络', '安防', '软装', '硬装', '设计', '地毯', '支臂', '窗帘', '灯具'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '工程项目名称', label: '工程项目名称', required: true, width: 25, type: 'text' },
      { key: '工程地点', label: '工程地点', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '工程类型', label: '工程类型', required: true, width: 15, type: 'select', options: ['新建工程', '改造工程', '维修工程'] },
      { key: '工程范围', label: '工程范围', required: true, width: 40, type: 'textarea' },
      { key: '技术要求', label: '技术要求', required: false, width: 40, type: 'textarea' },
      { key: '材料品牌要求', label: '材料品牌要求', required: false, width: 25, type: 'text' },
      { key: '施工标准', label: '施工标准', required: false, width: 30, type: 'textarea' },
      { key: '工期要求', label: '工期要求', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '资质要求', label: '资质要求', required: false, width: 30, type: 'textarea' },
      { key: '安全要求', label: '安全要求', required: false, width: 30, type: 'textarea' },
      { key: '环保要求', label: '环保要求', required: false, width: 30, type: 'textarea' },
      { key: '验收标准', label: '验收标准', required: false, width: 30, type: 'textarea' },
      { key: '质保期', label: '质保期', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 办公用品类模板
  OFFICE_SUPPLIES: {
    keywords: ['办公文具', '办公设备', '硒鼓', '行政电器', '耗材', '饮料', '饮用水', '食品', '印刷', '健身', '财产保险', '家具', '休闲家具'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '物品名称', label: '物品名称', required: true, width: 25, type: 'text' },
      { key: '规格/型号', label: '规格/型号', required: true, width: 20, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '品牌要求', label: '品牌要求', required: false, width: 15, type: 'text' },
      { key: '数量', label: '数量', required: true, width: 10, type: 'number' },
      { key: '单位', label: '单位', required: true, width: 8, type: 'select', options: ['个', '盒', '包', '箱', '台', '套'] },
      { key: '预算单价（元）', label: '预算单价（元）', required: false, width: 15, type: 'number' },
      { key: '预算总价（元）', label: '预算总价（元）', required: false, width: 15, type: 'number' },
      { key: '交付日期', label: '交付日期', required: false, width: 15, type: 'date' },
      { key: '质量要求', label: '质量要求', required: false, width: 30, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 物流快递类模板
  LOGISTICS: {
    keywords: ['快递', '物流', '搬运', '仓储', '文件管理'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['快递服务', '物流服务', '搬运服务', '仓储服务', '文件管理'] },
      { key: '服务区域', label: '服务区域', required: true, width: 20, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '服务要求', label: '服务要求', required: true, width: 40, type: 'textarea' },
      { key: '预计业务量', label: '预计业务量', required: false, width: 15, type: 'text' },
      { key: '时效要求', label: '时效要求', required: false, width: 20, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 设施维护类模板
  FACILITY_MANAGEMENT: {
    keywords: ['设施管理', '维护', '外包', '保洁', '树木花卉', '驻场', '维修', '改造', '消毒', '杀虫', '租赁'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '服务项目名称', label: '服务项目名称', required: true, width: 25, type: 'text' },
      { key: '服务地点', label: '服务地点', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['日常维护', '定期保养', '应急维修', '外包服务'] },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '服务频次', label: '服务频次', required: false, width: 15, type: 'text' },
      { key: '服务标准', label: '服务标准', required: false, width: 30, type: 'textarea' },
      { key: '人员要求', label: '人员要求', required: false, width: 25, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 会议活动类模板
  EVENTS_MEETINGS: {
    keywords: ['会议', '年会', '团建', '活动', '线上会议', '线下会议', '品牌', '媒体', '宣传', '广告'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '活动名称', label: '活动名称', required: true, width: 25, type: 'text' },
      { key: '活动类型', label: '活动类型', required: true, width: 15, type: 'select', options: ['会议', '培训', '团建', '活动', '宣传', '其他'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '活动时间', label: '活动时间', required: true, width: 15, type: 'text' },
      { key: '活动地点', label: '活动地点', required: true, width: 25, type: 'text' },
      { key: '参与人数', label: '参与人数', required: false, width: 10, type: 'number' },
      { key: '活动内容', label: '活动内容', required: true, width: 40, type: 'textarea' },
      { key: '服务要求', label: '服务要求', required: false, width: 40, type: 'textarea' },
      { key: '物料需求', label: '物料需求', required: false, width: 30, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 差旅交通类模板
  TRAVEL_TRANSPORT: {
    keywords: ['差旅', '酒店', '机票', '火车', '班车', '网约车', '用车', '车辆'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['差旅服务', '酒店', '机票', '火车', '班车', '网约车', '领导用车'] },
      { key: '服务级别', label: '服务级别', required: false, width: 15, type: 'select', options: ['经济型', '舒适型', '商务型', '豪华型'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '服务要求', label: '服务要求', required: true, width: 40, type: 'textarea' },
      { key: '预计业务量', label: '预计业务量', required: false, width: 15, type: 'text' },
      { key: '服务区域', label: '服务区域', required: false, width: 20, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 租赁物业类模板
  LEASING: {
    keywords: ['租赁', '物业', '车位', '中介', '商务中心'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '租赁类型', label: '租赁类型', required: true, width: 15, type: 'select', options: ['办公室租赁', '车位租赁', '其他租赁'] },
      { key: '位置要求', label: '位置要求', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '面积/数量要求', label: '面积/数量要求', required: true, width: 20, type: 'text' },
      { key: '租赁期限', label: '租赁期限', required: false, width: 15, type: 'text' },
      { key: '预算金额（元/月）', label: '预算金额（元/月）', required: false, width: 15, type: 'number' },
      { key: '配套设施要求', label: '配套设施要求', required: false, width: 30, type: 'textarea' },
      { key: '其他要求', label: '其他要求', required: false, width: 40, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 通讯网络类模板
  TELECOMMUNICATIONS: {
    keywords: ['通讯', '话费', '流量', '专线', '线路', '移动通讯'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['语音通讯', '数据专线', '移动通讯', '网络线路'] },
      { key: '运营商', label: '运营商', required: false, width: 15, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '带宽/容量要求', label: '带宽/容量要求', required: false, width: 20, type: 'text' },
      { key: '使用人数', label: '使用人数', required: false, width: 10, type: 'number' },
      { key: '预算金额（元/月）', label: '预算金额（元/月）', required: false, width: 15, type: 'number' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 市场数据类模板
  MARKET_DATA: {
    keywords: ['市场数据', '数据库', '终端'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '数据产品名称', label: '数据产品名称', required: true, width: 25, type: 'text' },
      { key: '数据类型', label: '数据类型', required: true, width: 15, type: 'select', options: ['终端数据', '数据库数据', '研究报告'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '数据内容要求', label: '数据内容要求', required: true, width: 40, type: 'textarea' },
      { key: '使用部门', label: '使用部门', required: false, width: 15, type: 'text' },
      { key: '使用人数', label: '使用人数', required: false, width: 10, type: 'number' },
      { key: '预算金额（元/年）', label: '预算金额（元/年）', required: false, width: 15, type: 'number' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 云服务类模板
  CLOUD_SERVICES: {
    keywords: ['云服务', '服务器租赁', '网络设备租赁', '软件订阅'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '云服务类型', label: '云服务类型', required: true, width: 15, type: 'select', options: ['云服务器', '云存储', '云数据库', '软件订阅', '设备租赁'] },
      { key: '服务商', label: '服务商', required: false, width: 15, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '配置要求', label: '配置要求', required: true, width: 40, type: 'textarea' },
      { key: '性能要求', label: '性能要求', required: false, width: 30, type: 'textarea' },
      { key: '安全要求', label: '安全要求', required: false, width: 30, type: 'textarea' },
      { key: '预算金额（元/月）', label: '预算金额（元/月）', required: false, width: 15, type: 'number' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 维保服务类模板
  MAINTENANCE_SERVICE: {
    keywords: ['维护', '维保', '维修', '服务'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '维保项目名称', label: '维保项目名称', required: true, width: 25, type: 'text' },
      { key: '设备/系统类型', label: '设备/系统类型', required: true, width: 20, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '维保范围', label: '维保范围', required: true, width: 40, type: 'textarea' },
      { key: '服务级别要求', label: '服务级别要求', required: false, width: 30, type: 'textarea' },
      { key: '响应时间要求', label: '响应时间要求', required: false, width: 20, type: 'text' },
      { key: '维保期限', label: '维保期限', required: false, width: 15, type: 'text' },
      { key: '预算金额（元/年）', label: '预算金额（元/年）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 礼品品类模板
  GIFTS: {
    keywords: ['礼品', '礼品制作'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '礼品名称', label: '礼品名称', required: true, width: 20, type: 'text' },
      { key: '用途', label: '用途', required: true, width: 20, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '数量', label: '数量', required: true, width: 10, type: 'number' },
      { key: '单位', label: '单位', required: true, width: 8, type: 'select', options: ['份', '个', '盒', '套'] },
      { key: '规格要求', label: '规格要求', required: false, width: 25, type: 'textarea' },
      { key: '材质要求', label: '材质要求', required: false, width: 20, type: 'text' },
      { key: 'Logo/印字要求', label: 'Logo/印字要求', required: false, width: 20, type: 'text' },
      { key: '预算单价（元）', label: '预算单价（元）', required: false, width: 15, type: 'number' },
      { key: '预算总价（元）', label: '预算总价（元）', required: false, width: 15, type: 'number' },
      { key: '交付日期', label: '交付日期', required: false, width: 15, type: 'date' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },
};

// 根据品类名称匹配模板
function matchTemplate(categoryName) {
  const name = categoryName.toLowerCase();

  for (const [templateType, template] of Object.entries(CATEGORY_TEMPLATES)) {
    for (const keyword of template.keywords) {
      if (name.includes(keyword.toLowerCase())) {
        return template.columns;
      }
    }
  }

  // 默认返回通用模板
  return CATEGORY_TEMPLATES.GIFTS.columns; // 使用最简单的模板作为默认
}

async function updateCategories() {
  try {
    // 连接数据库
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/procureai';
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB Connected');

    // 获取所有品类
    const categories = await ProcurementCategory.find({});
    console.log(`\n找到 ${categories.length} 个品类`);

    // 统计信息
    const stats = {};

    // 更新每个品类的模板配置
    for (const category of categories) {
      const matchedColumns = matchTemplate(category.name);

      // 找出匹配的模板类型
      let templateType = '默认模板';
      for (const [type, template] of Object.entries(CATEGORY_TEMPLATES)) {
        if (template.columns === matchedColumns) {
          templateType = type;
          break;
        }
      }

      // 统计
      if (!stats[templateType]) {
        stats[templateType] = [];
      }
      stats[templateType].push(category.name);

      // 更新模板配置
      await ProcurementCategory.updateOne(
        { _id: category._id },
        {
          $set: {
            'templateConfig.columns': matchedColumns,
            'templateConfig.sheets': [
              { name: '需求清单', type: 'main', enabled: true },
              { name: '项目概要', type: 'summary', enabled: true },
              { name: '填写说明', type: 'instruction', enabled: true },
            ],
          }
        }
      );

      console.log(`✓ 更新: ${category.name} -> ${templateType} (${matchedColumns.length} 字段)`);
    }

    console.log('\n\n======== 更新统计 ========');
    for (const [type, names] of Object.entries(stats)) {
      console.log(`\n${type} (${names.length} 个品类):`);
      names.slice(0, 5).forEach(name => console.log(`  - ${name}`));
      if (names.length > 5) {
        console.log(`  ... 还有 ${names.length - 5} 个`);
      }
    }

    // 验证更新结果
    const updatedCategories = await ProcurementCategory.find({});
    const columnCounts = {};
    updatedCategories.forEach(cat => {
      const count = cat.templateConfig?.columns?.length || 0;
      columnCounts[count] = (columnCounts[count] || 0) + 1;
    });

    console.log('\n\n======== 字段数量分布 ========');
    Object.keys(columnCounts).sort((a, b) => a - b).forEach(count => {
      console.log(`${count} 字段: ${columnCounts[count]} 个品类`);
    });

    await mongoose.disconnect();
    console.log('\n✓ 数据库连接已关闭');
    console.log('\n✅ 所有品类模板更新完成!');

  } catch (error) {
    console.error('❌ 更新失败:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// 运行更新
updateCategories();
