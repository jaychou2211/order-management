const AmazonOrderId = '114-3941689-8772232';

// 假設該時間區段僅發生 1 筆訂單
// GET /orders/v0/orders
export const orderList = [
  {
    "AmazonOrderId": AmazonOrderId,
    "PurchaseDate": "2024-10-24T08:30:00Z",
    "LastUpdateDate": "2024-10-24T09:15:00Z",
    "OrderStatus": "Shipped",
    "FulfillmentChannel": "MFN",
    "SalesChannel": "Amazon.com",
    "OrderTotal": {
      "CurrencyCode": "USD",
      "Amount": "59.99"
    },
    "NumberOfItemsShipped": 1,
    "NumberOfItemsUnshipped": 0
  }
];

// GET /orders/v0/orders/{orderId}
export const order = {
  "AmazonOrderId": AmazonOrderId,
  "SellerOrderId": "1234-5678",
  "PurchaseDate": "2024-10-24T08:30:00Z",
  "LastUpdateDate": "2024-10-24T09:15:00Z",
  "OrderStatus": "Shipped",
  "FulfillmentChannel": "MFN",
  "SalesChannel": "Amazon.com",
  "OrderChannel": "Online",
  "ShipServiceLevel": "Standard",
  "OrderTotal": {
    "CurrencyCode": "USD",
    "Amount": "59.99"
  },
  "NumberOfItemsShipped": 1,
  "NumberOfItemsUnshipped": 0,
  "PaymentMethod": "Credit Card",
  "PaymentMethodDetails": ["CreditCard"],
  "MarketplaceId": "ATVPDKIKX0DER",
  "ShipmentServiceLevelCategory": "Standard",
  "ShippedByAmazonTFM": false,
  "OrderType": "StandardOrder",
  "EarliestShipDate": "2024-10-24T10:00:00Z",
  "LatestShipDate": "2024-10-25T10:00:00Z",
  "EarliestDeliveryDate": "2024-10-26T10:00:00Z",
  "LatestDeliveryDate": "2024-10-28T10:00:00Z",
  "IsBusinessOrder": false,
  "IsPrime": false,
  "IsGlobalExpressEnabled": false,
  "IsPremiumOrder": false,
  "IsReplacementOrder": false,
  "IsSoldByAB": false,
  "DefaultShipFromLocationAddress": {
    "Name": "Warehouse A",
    "AddressLine1": "123 Shipping St",
    "City": "Seattle",
    "StateOrRegion": "WA",
    "PostalCode": "98101",
    "CountryCode": "US"
  },
  "BuyerInfo": {
    "BuyerEmail": "buyer@example.com",
    "BuyerName": "John Doe",
    "BuyerCounty": "King",
    "BuyerTaxInfo": {
      "CompanyLegalName": "Buyer Company",
      "TaxingRegion": "WA",
      "TaxClassifications": [
        {
          "Name": "VATNumber",
          "Value": "XXX123456789"
        }
      ]
    },
    "PurchaseOrderNumber": "PO-12345"
  }
};

// GET /orders/v0/orders/{orderId}/orderItems
export const orderItems = [
  {
    "ASIN": "B07X6C9RMF",
    "SellerSKU": "SKU001",
    "OrderItemId": "12345678901234",
    "Title": "高品質藍牙耳機",
    "QuantityOrdered": 1,
    "QuantityShipped": 1,
    "ProductInfo": {
      "NumberOfItems": 1
    },
    "PointsGranted": {
      "PointsNumber": 60,
      "PointsMonetaryValue": {
        "CurrencyCode": "USD",
        "Amount": "0.60"
      }
    },
    "ItemPrice": {
      "CurrencyCode": "USD",
      "Amount": "59.99"
    },
    "ShippingPrice": {
      "CurrencyCode": "USD",
      "Amount": "0.00"
    },
    "ItemTax": {
      "CurrencyCode": "USD",
      "Amount": "0.00"
    },
    "ShippingTax": {
      "CurrencyCode": "USD",
      "Amount": "0.00"
    },
    "ShippingDiscount": {
      "CurrencyCode": "USD",
      "Amount": "0.00"
    },
    "ShippingDiscountTax": {
      "CurrencyCode": "USD",
      "Amount": "0.00"
    },
    "PromotionDiscount": {
      "CurrencyCode": "USD",
      "Amount": "0.00"
    },
    "PromotionDiscountTax": {
      "CurrencyCode": "USD",
      "Amount": "0.00"
    },
    "PromotionIds": [],
    "CODFee": {
      "CurrencyCode": "USD",
      "Amount": "0.00"
    },
    "CODFeeDiscount": {
      "CurrencyCode": "USD",
      "Amount": "0.00"
    },
    "IsGift": false,
    "ConditionNote": "New",
    "ConditionId": "New",
    "ConditionSubtypeId": "New",
    "ScheduledDeliveryStartDate": "2024-10-26T10:00:00Z",
    "ScheduledDeliveryEndDate": "2024-10-28T10:00:00Z",
    "PriceDesignation": "BusinessPrice",
    "TaxCollection": {
      "Model": "MarketplaceFacilitator",
      "ResponsibleParty": "Amazon Services, Inc."
    },
    "SerialNumberRequired": false,
    "IsTransparency": false,
    "IossNumber": "IM0123456789",
    "DeemedResellerCategory": "NONE"
  }
];