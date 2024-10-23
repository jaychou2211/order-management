import { Injectable } from '@nestjs/common';

enum Category {
  FOOD = "FOOD", // 寵物食品
  SUPPLIES = "SUPPLIES", // 寵物用品
  HEALTH = "HEALTH" // 寵物保健品
}

const products = [
  {
    id: 'PROD-0001',
    name: "無膠主食罐",
    description: "98%鮮肉無膠主食罐,多種口味",
    price: 46,
    category: Category.FOOD,
    stock: 100
  },
  {
    id: 'PROD-0002',
    name: "冷凍乾燥生食餐",
    description: "使用冷凍乾燥技術製作的生食餐",
    price: 229,
    category: Category.FOOD,
    stock: 100
  },
  {
    id: 'PROD-0003',
    name: "低磷低蛋白無膠主食罐",
    description: "適合老年貓或特殊需求的貓咪",
    price: 48,
    category: Category.FOOD,
    stock: 100
  },
  {
    id: 'PROD-0004',
    name: "台灣海味太空小零嘴",
    description: "冷凍乾燥技術製作的魚類零食",
    price: 120,
    category: Category.FOOD,
    stock: 100
  },
  {
    id: 'PROD-0005',
    name: "貓用益生菌",
    description: "幫助腸胃健康的益生菌補充品",
    price: 650,
    category: Category.FOOD,
    stock: 100
  },
  {
    id: 'PROD-0006',
    name: "玩具總動員系列特濃貓草球",
    description: "迪士尼授權,含貓草的玩具球",
    price: 129,
    category: Category.SUPPLIES,
    stock: 100
  },
  {
    id: 'PROD-0007',
    name: "台灣小吃貓草包",
    description: "模仿台灣小吃造型的貓草玩具",
    price: 220,
    category: Category.SUPPLIES,
    stock: 100
  },
  {
    id: 'PROD-0008',
    name: "寵物洗碗酵素",
    description: "專為寵物餐具設計的清潔劑",
    price: 95,
    category: Category.SUPPLIES,
    stock: 100
  },
  {
    id: 'PROD-0009',
    name: "吸水速乾浴巾",
    description: "玩具總動員系列,2倍吸水量",
    price: 390,
    category: Category.SUPPLIES,
    stock: 100
  },
  {
    id: 'PROD-010',
    name: "貓砂",
    description: "多種類型可選,包括豆腐砂",
    price: 180,
    category: Category.SUPPLIES,
    stock: 100
  },
  {
    id: 'PROD-011',
    name: "牛磺酸",
    description: "支持心臟和視力健康",
    price: 880,
    category: Category.HEALTH,
    stock: 100
  },
  {
    id: 'PROD-012',
    name: "鱉蛋粉",
    description: "促進皮膚和毛髮健康",
    price: 750,
    category: Category.HEALTH,
    stock: 100
  },
  {
    id: 'PROD-013',
    name: "離胺酸",
    description: "支持免疫系統",
    price: 680,
    category: Category.HEALTH,
    stock: 100
  }
];

/**
 * 商品服務
 * 📌 先不考慮 database，直接 in-memory 實作
 * 📌 先不提供標準的 CRUD 功能，只提供 id 查詢
 * 👉 只是想讓訂單系統能檢查商品庫存(以上2項, 是訂單系統並不在意的細節)
 */
@Injectable()
export class ProductsService {

  getById(id: string) {
    return products.find(product => product.id === id);
  };

}
