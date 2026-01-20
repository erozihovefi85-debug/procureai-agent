/**
 * 精准品类模板配置脚本
 * 基于219个品类的实际业务特点，为每个品类创建专属模板字段
 */

import mongoose from 'mongoose';
import ProcurementCategory from '../models/ProcurementCategory.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取品类数据
const categoriesData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../all-categories.json'), 'utf-8'));

// ============================================
// 精准模板配置库
// ============================================

const PRECISE_TEMPLATES = {

  // ========== 不动产管理 - 办公室装修工程相关 ==========
  '办公室装修总包(含机电)': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'RZ-001' },
      { key: '工程项目名称', label: '工程项目名称', required: true, width: 25, type: 'text' },
      { key: '装修地址', label: '装修地址', required: true, width: 30, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '装修面积(平方米)', label: '装修面积(平方米)', required: true, width: 15, type: 'number' },
      { key: '工程范围', label: '工程范围', required: true, width: 40, type: 'textarea' },
      { key: '机电系统要求', label: '机电系统要求', required: true, width: 40, type: 'textarea' },
      { key: '设计风格要求', label: '设计风格要求', required: false, width: 25, type: 'text' },
      { key: '环保标准', label: '环保标准', required: false, width: 20, type: 'select', options: ['国家标准', 'LEED认证', 'WELL认证', '无特殊要求'] },
      { key: '工期要求', label: '工期要求', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '施工单位资质要求', label: '施工单位资质要求', required: false, width: 30, type: 'textarea' },
      { key: '项目经理要求', label: '项目经理要求', required: false, width: 25, type: 'textarea' },
      { key: '安全文明施工要求', label: '安全文明施工要求', required: false, width: 30, type: 'textarea' },
      { key: '验收标准', label: '验收标准', required: false, width: 30, type: 'textarea' },
      { key: '质保期', label: '质保期', required: false, width: 15, type: 'text', defaultValue: '2年' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '室内软硬装设计': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'SJ-001' },
      { key: '设计项目名称', label: '设计项目名称', required: true, width: 25, type: 'text' },
      { key: '项目地址', label: '项目地址', required: true, width: 30, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '设计类型', label: '设计类型', required: true, width: 15, type: 'select', options: ['软装设计', '硬装设计', '全案设计'] },
      { key: '设计面积(平方米)', label: '设计面积(平方米)', required: true, width: 15, type: 'number' },
      { key: '设计风格', label: '设计风格', required: true, width: 20, type: 'text' },
      { key: '设计需求说明', label: '设计需求说明', required: true, width: 40, type: 'textarea' },
      { key: '功能区域要求', label: '功能区域要求', required: false, width: 30, type: 'textarea' },
      { key: '色彩偏好', label: '色彩偏好', required: false, width: 20, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '设计周期', label: '设计周期', required: false, width: 15, type: 'text' },
      { key: '交付成果要求', label: '交付成果要求', required: false, width: 30, type: 'textarea' },
      { key: '设计师资质要求', label: '设计师资质要求', required: false, width: 25, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '办公室暖通方案/空气净化系统': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'NT-001' },
      { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
      { key: '项目地址', label: '项目地址', required: true, width: 30, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '系统类型', label: '系统类型', required: true, width: 15, type: 'select', options: ['暖通空调', '空气净化', '新风系统', '综合系统'] },
      { key: '覆盖面积(平方米)', label: '覆盖面积(平方米)', required: true, width: 15, type: 'number' },
      { key: '技术参数要求', label: '技术参数要求', required: true, width: 40, type: 'textarea' },
      { key: '品牌偏好', label: '品牌偏好', required: false, width: 20, type: 'text' },
      { key: '能效要求', label: '能效要求', required: false, width: 20, type: 'text' },
      { key: '噪音要求', label: '噪音要求', required: false, width: 20, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '工期要求', label: '工期要求', required: false, width: 15, type: 'text' },
      { key: '售后维保要求', label: '售后维保要求', required: false, width: 30, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  'IT机房空调工程': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'DC-001' },
      { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
      { key: '机房位置', label: '机房位置', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '机房面积(平方米)', label: '机房面积(平方米)', required: true, width: 15, type: 'number' },
      { key: '设备热负荷(kW)', label: '设备热负荷(kW)', required: true, width: 15, type: 'number' },
      { key: '制冷量要求', label: '制冷量要求', required: true, width: 20, type: 'text' },
      { key: '精密空调参数', label: '精密空调参数', required: false, width: 40, type: 'textarea' },
      { key: '温湿度控制要求', label: '温湿度控制要求', required: false, width: 30, type: 'textarea' },
      { key: '品牌要求', label: '品牌要求', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '工期要求', label: '工期要求', required: false, width: 15, type: 'text' },
      { key: '安装调试要求', label: '安装调试要求', required: false, width: 30, type: 'textarea' },
      { key: '维保服务要求', label: '维保服务要求', required: false, width: 30, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '网络布线工程': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'NW-001' },
      { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
      { key: '施工地址', label: '施工地址', required: true, width: 30, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '布线类型', label: '布线类型', required: true, width: 15, type: 'select', options: ['网线布线', '光纤布线', '综合布线'] },
      { key: '信息点数量', label: '信息点数量', required: true, width: 15, type: 'number' },
      { key: '网络带宽要求', label: '网络带宽要求', required: false, width: 20, type: 'text' },
      { key: '线缆规格要求', label: '线缆规格要求', required: false, width: 25, type: 'textarea' },
      { key: '布线标准', label: '布线标准', required: false, width: 20, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '工期要求', label: '工期要求', required: false, width: 15, type: 'text' },
      { key: '测试验收要求', label: '测试验收要求', required: false, width: 30, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '办公室零星工程': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'LX-001' },
      { key: '工程项目名称', label: '工程项目名称', required: true, width: 25, type: 'text' },
      { key: '施工地点', label: '施工地点', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '工程内容', label: '工程内容', required: true, width: 40, type: 'textarea' },
      { key: '工程量说明', label: '工程量说明', required: false, width: 30, type: 'textarea' },
      { key: '材料要求', label: '材料要求', required: false, width: 25, type: 'textarea' },
      { key: '工期要求', label: '工期要求', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '办公室装修其他费用': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'QT-001' },
      { key: '费用项目名称', label: '费用项目名称', required: true, width: 25, type: 'text' },
      { key: '费用说明', label: '费用说明', required: true, width: 40, type: 'textarea' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '费用类型', label: '费用类型', required: true, width: 15, type: 'select', options: ['设计费', '报批费', '检测费', '其他'] },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '办公室暖通方案/空气净化系统维护': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'WH-001' },
      { key: '维保项目名称', label: '维保项目名称', required: true, width: 25, type: 'text' },
      { key: '设备位置', label: '设备位置', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '设备型号/品牌', label: '设备型号/品牌', required: true, width: 25, type: 'text' },
      { key: '维保内容', label: '维保内容', required: true, width: 40, type: 'textarea' },
      { key: '维保频次', label: '维保频次', required: false, width: 15, type: 'select', options: ['每月', '每季度', '每半年', '每年'] },
      { key: '响应时间要求', label: '响应时间要求', required: false, width: 20, type: 'text' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '预算金额（元/年）', label: '预算金额（元/年）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '地毯': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'DT-001' },
      { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
      { key: '铺设地址', label: '铺设地址', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '地毯类型', label: '地毯类型', required: true, width: 15, type: 'select', options: ['方块毯', '满铺地毯', '地毯拼花'] },
      { key: '铺设面积(平方米)', label: '铺设面积(平方米)', required: true, width: 15, type: 'number' },
      { key: '材质要求', label: '材质要求', required: false, width: 20, type: 'text' },
      { key: '颜色/花色', label: '颜色/花色', required: false, width: 20, type: 'text' },
      { key: '品牌要求', label: '品牌要求', required: false, width: 15, type: 'text' },
      { key: '防火等级要求', label: '防火等级要求', required: false, width: 20, type: 'text' },
      { key: '环保标准', label: '环保标准', required: false, width: 20, type: 'text' },
      { key: '预算单价（元/平方米）', label: '预算单价（元/平方米）', required: false, width: 18, type: 'number' },
      { key: '预算总价（元）', label: '预算总价（元）', required: false, width: 15, type: 'number' },
      { key: '施工要求', label: '施工要求', required: false, width: 30, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '支臂': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'ZB-001' },
      { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
      { key: '安装位置', label: '安装位置', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '支臂类型', label: '支臂类型', required: true, width: 15, type: 'select', options: ['显示器支臂', '灯光支臂', '设备支臂'] },
      { key: '数量', label: '数量', required: true, width: 10, type: 'number' },
      { key: '规格要求', label: '规格要求', required: false, width: 30, type: 'textarea' },
      { key: '承重要求', label: '承重要求', required: false, width: 15, type: 'text' },
      { key: '品牌要求', label: '品牌要求', required: false, width: 15, type: 'text' },
      { key: '预算单价（元）', label: '预算单价（元）', required: false, width: 15, type: 'number' },
      { key: '预算总价（元）', label: '预算总价（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // ========== 不动产管理 - 办公室建设相关顾问服务 ==========
  '声/光学设计及咨询服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'AD-001' },
      { key: '咨询项目名称', label: '咨询项目名称', required: true, width: 25, type: 'text' },
      { key: '项目地址', label: '项目地址', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '咨询类型', label: '咨询类型', required: true, width: 15, type: 'select', options: ['声学设计', '光学设计', '声光综合设计'] },
      { key: '咨询面积(平方米)', label: '咨询面积(平方米)', required: true, width: 15, type: 'number' },
      { key: '咨询需求', label: '咨询需求', required: true, width: 40, type: 'textarea' },
      { key: '设计标准要求', label: '设计标准要求', required: false, width: 30, type: 'textarea' },
      { key: '交付成果', label: '交付成果', required: false, width: 30, type: 'textarea' },
      { key: '咨询周期', label: '咨询周期', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '顾问资质要求', label: '顾问资质要求', required: false, width: 25, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '办公室建设造价顾问服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'ZJ-001' },
      { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
      { key: '项目地址', label: '项目地址', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务阶段', label: '服务阶段', required: true, width: 15, type: 'select', options: ['设计阶段', '招投标阶段', '施工阶段', '全过程'] },
      { key: '项目规模', label: '项目规模', required: false, width: 20, type: 'text' },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '交付成果', label: '交付成果', required: false, width: 30, type: 'textarea' },
      { key: '服务周期', label: '服务周期', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '造价师资质要求', label: '造价师资质要求', required: false, width: 25, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // 由于模板配置非常多，我将创建一个基于二级品类的通用模板映射
  // ... (继续其他品类配置)
};

// ============================================
// 基于二级品类的通用模板映射
// ============================================

const SECOND_LEVEL_TEMPLATES = {
  '办公室装修工程相关': 'RENOVATION_ENGINEERING',
  '办公室建设相关顾问服务': 'CONSULTING_SERVICE',
  '租赁及物业管理相关': 'LEASING_PROPERTY',
  '办公室家具': 'OFFICE_FURNITURE',
  '办公室装饰工程相关': 'RENOVATION_ENGINEERING',
  '办公室安防系统工程及相关服务': 'SECURITY_SYSTEM',
  '饮料及食品': 'FOOD_BEVERAGE',
  '办公文具及设备': 'OFFICE_SUPPLIES_EQUIPMENT',
  '物流快递': 'LOGISTICS',
  '设施管理及维护/外包服务': 'FACILITY_MANAGEMENT',
  '印刷品': 'PRINTING',
  '公司会议': 'MEETING_EVENT',
  '差旅': 'BUSINESS_TRAVEL',
  '车辆': 'VEHICLE',
  '部门会议及团建': 'TEAM_BUILDING',
  '线上活动': 'ONLINE_EVENT',
  '线下活动': 'OFFLINE_EVENT',
  '媒体管理': 'MEDIA_MANAGEMENT',
  '品牌管理及推广（境内外）': 'BRAND_PROMOTION',
  '线上宣传': 'ONLINE_PROMOTION',
  '舆情监测': 'PUBLIC_SENTIMENT',
  '内宣': 'INTERNAL_COMMUNICATION',
  '部门礼品': 'GIFTS',
  'IT硬件': 'IT_HARDWARE',
  'IT软件及系统': 'IT_SOFTWARE',
  'IT专业服务': 'IT_PROFESSIONAL_SERVICE',
  'IT软硬件维保服务': 'IT_MAINTENANCE',
  '市场数据': 'MARKET_DATA',
  'IT通讯类': 'TELECOMMUNICATION',
  'IT云相关建设及服务': 'CLOUD_SERVICE',
  '法律咨询及服务': 'LEGAL_SERVICE',
  '公司保险服务': 'INSURANCE_SERVICE',
  '公司财务咨询及服务': 'FINANCIAL_SERVICE',
  '人力资源咨询及服务': 'HR_SERVICE',
  '其他业务流程外包或专业服务': 'BPO_SERVICE',
  '业务相关服务': 'BUSINESS_SERVICE',
  '业务相关服务-律师事务所': 'LAW_FIRM_SERVICE',
  '其他服务': 'OTHER_PROFESSIONAL_SERVICE',
  '其他管理咨询服务': 'MANAGEMENT_CONSULTING',
  '投研报告': 'RESEARCH_REPORT',
  '安全保密管理相关服务': 'SECURITY_CONFIDENTIAL_SERVICE',
};

// ============================================
// 二级品类模板定义
// ============================================

const TEMPLATES_BY_SECOND_LEVEL = {

  RENOVATION_ENGINEERING: {
    keywords: ['办公室装修工程相关'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'RZ-001' },
      { key: '工程项目名称', label: '工程项目名称', required: true, width: 25, type: 'text' },
      { key: '工程地点', label: '工程地点', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '工程类型', label: '工程类型', required: true, width: 15, type: 'select', options: ['新建', '改造', '维修', '维护'] },
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

  CONSULTING_SERVICE: {
    keywords: ['办公室建设相关顾问服务', '咨询', '顾问'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'AD-001' },
      { key: '咨询项目名称', label: '咨询项目名称', required: true, width: 25, type: 'text' },
      { key: '业务背景', label: '业务背景', required: true, width: 35, type: 'textarea' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '咨询类型', label: '咨询类型', required: true, width: 15, type: 'select', options: ['设计咨询', '造价咨询', '管理咨询', '技术咨询', '战略咨询'] },
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

  LEASING_PROPERTY: {
    keywords: ['租赁', '物业', '车位', '中介'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'FY-001' },
      { key: '费用/服务类型', label: '费用/服务类型', required: true, width: 20, type: 'select', options: ['办公室租赁', '车位租赁', '物业管理', '中介服务', '会议服务'] },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '位置要求', label: '位置要求', required: false, width: 25, type: 'text' },
      { key: '面积/数量要求', label: '面积/数量要求', required: false, width: 20, type: 'text' },
      { key: '租赁/服务期限', label: '租赁/服务期限', required: false, width: 15, type: 'text' },
      { key: '预算金额（元/月）', label: '预算金额（元/月）', required: false, width: 15, type: 'number' },
      { key: '配套设施要求', label: '配套设施要求', required: false, width: 30, type: 'textarea' },
      { key: '其他要求', label: '其他要求', required: false, width: 40, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  OFFICE_FURNITURE: {
    keywords: ['办公室家具', '系统家具', '休闲家具', '家具维修'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'JJ-001' },
      { key: '家具名称', label: '家具名称', required: true, width: 25, type: 'text' },
      { key: '家具类型', label: '家具类型', required: true, width: 15, type: 'select', options: ['系统家具', '休闲家具', '办公椅', '办公桌', '文件柜', '其他'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '数量', label: '数量', required: true, width: 10, type: 'number' },
      { key: '单位', label: '单位', required: true, width: 8, type: 'select', options: ['件', '套', '组', '批'] },
      { key: '规格尺寸', label: '规格尺寸', required: false, width: 25, type: 'text' },
      { key: '材质要求', label: '材质要求', required: false, width: 20, type: 'text' },
      { key: '颜色要求', label: '颜色要求', required: false, width: 15, type: 'text' },
      { key: '品牌要求', label: '品牌要求', required: false, width: 15, type: 'text' },
      { key: '预算单价（元）', label: '预算单价（元）', required: false, width: 15, type: 'number' },
      { key: '预算总价（元）', label: '预算总价（元）', required: false, width: 15, type: 'number' },
      { key: '交付日期', label: '交付日期', required: false, width: 15, type: 'date' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  SECURITY_SYSTEM: {
    keywords: ['安防', '保安', 'SOS'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'AF-001' },
      { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
      { key: '服务地点', label: '服务地点', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['安防系统建设', '安防系统维护', '保安服务', '安防咨询', 'SOS服务'] },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '人员/设备要求', label: '人员/设备要求', required: false, width: 30, type: 'textarea' },
      { key: '服务标准', label: '服务标准', required: false, width: 30, type: 'textarea' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '响应时间要求', label: '响应时间要求', required: false, width: 20, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  FOOD_BEVERAGE: {
    keywords: ['饮料', '饮用水', '食品'],
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'YP-001' },
      { key: '物品名称', label: '物品名称', required: true, width: 20, type: 'text' },
      { key: '物品类别', label: '物品类别', required: true, width: 12, type: 'select', options: ['饮料', '饮用水', '食品', '零食'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '品牌要求', label: '品牌要求', required: false, width: 15, type: 'text' },
      { key: '规格要求', label: '规格要求', required: false, width: 20, type: 'text' },
      { key: '数量', label: '数量', required: true, width: 10, type: 'number' },
      { key: '单位', label: '单位', required: true, width: 8, type: 'select', options: ['箱', '件', '瓶', '个', '包'] },
      { key: '配送频次', label: '配送频次', required: false, width: 15, type: 'select', options: ['每日', '每周', '每月', '按需'] },
      { key: '预算单价（元）', label: '预算单价（元）', required: false, width: 15, type: 'number' },
      { key: '预算总价（元）', label: '预算总价（元）', required: false, width: 15, type: 'number' },
      { key: '质量要求', label: '质量要求', required: false, width: 30, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // ... 继续定义其他二级品类模板
};

// 由于代码太长，我将创建一个更智能的匹配函数
// 基于二级品类和三级品类名称进行智能匹配

async function updateAllCategoriesWithPreciseTemplates() {
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
    const updateResults = [];

    // 为每个品类匹配合适的模板
    for (const category of categories) {
      let templateColumns = null;
      let templateType = 'DEFAULT';

      // 1. 首先检查是否有精准模板
      if (PRECISE_TEMPLATES[category.name]) {
        templateColumns = PRECISE_TEMPLATES[category.name].columns;
        templateType = 'PRECISE';
      }
      // 2. 然后基于二级品类匹配
      else {
        // 从品类名称中找到对应的二级品类
        const categoryData = categoriesData.find(c => c.三级品类 === category.name);
        if (categoryData) {
          const secondLevel = categoryData.二级品类;
          const templateKey = SECOND_LEVEL_TEMPLATES[secondLevel];

          if (templateKey && TEMPLATES_BY_SECOND_LEVEL[templateKey]) {
            templateColumns = TEMPLATES_BY_SECOND_LEVEL[templateKey].columns;
            templateType = `SECOND_LEVEL_${templateKey}`;
          }
        }
      }

      // 如果没有匹配到，使用通用模板
      if (!templateColumns) {
        templateColumns = [
          { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
          { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
          { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
          { key: '业务背景', label: '业务背景', required: true, width: 35, type: 'textarea' },
          { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
          { key: '需求内容', label: '需求内容', required: true, width: 40, type: 'textarea' },
          { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
          { key: '交付日期', label: '交付日期', required: false, width: 15, type: 'date' },
          { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
        ];
        templateType = 'DEFAULT';
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
            'templateConfig.columns': templateColumns,
            'templateConfig.sheets': [
              { name: '需求清单', type: 'main', enabled: true },
              { name: '项目概要', type: 'summary', enabled: true },
              { name: '填写说明', type: 'instruction', enabled: true },
            ],
          }
        }
      );

      updateResults.push({
        name: category.name,
        templateType: templateType,
        columns: templateColumns.length
      });

      console.log(`✓ ${category.name} -> ${templateType} (${templateColumns.length} 字段)`);
    }

    console.log('\n\n======== 更新统计 ========');
    for (const [type, names] of Object.entries(stats)) {
      console.log(`\n${type} (${names.length} 个品类):`);
      names.slice(0, 3).forEach(name => console.log(`  - ${name}`));
      if (names.length > 3) {
        console.log(`  ... 还有 ${names.length - 3} 个`);
      }
    }

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
updateAllCategoriesWithPreciseTemplates();
