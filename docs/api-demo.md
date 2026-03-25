# API Demo nhanh

## 1. Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"123456"}'
```

## 2. Lấy nhà hàng
```bash
curl http://localhost:4000/restaurants \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 3. Tạo đơn
```bash
curl -X POST http://localhost:4000/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId":1,
    "customerName":"Nguyen Van A",
    "customerPhone":"0900000001",
    "restaurantId":1,
    "customerLocation":{"lat":10.7765,"lng":106.7012},
    "items":[{"menuItemId":101,"quantity":2},{"menuItemId":102,"quantity":1}]
  }'
```

## 4. Thanh toán đơn
```bash
curl -X POST http://localhost:4000/orders/1/pay \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 5. Tài xế cập nhật vị trí
```bash
curl -X POST http://localhost:4000/tracking/update-location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":1,"driverId":2,"lat":10.7777,"lng":106.7025,"status":"DELIVERING"}'
```

## 6. Xem vị trí hiện tại của đơn
```bash
curl http://localhost:4000/tracking/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
