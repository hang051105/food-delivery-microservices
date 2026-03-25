# Food Delivery Microservices MVP

Backend MVP cho đề tài **Nền tảng giao đồ ăn & logistics thời gian thực**.

## Kiến trúc đang có
- API Gateway
- Auth Service
- Restaurant Service
- Order Service
- Delivery Service
- Tracking Service
- Notification Service
- Integration/ESB Service (mock Google Maps, Payment Gateway, SMS)

## Cách chạy
```bash
cd food-delivery-microservices
npm run install:all
npm run dev
```

## Ports
- API Gateway: 4000
- Auth Service: 4001
- Restaurant Service: 4002
- Order Service: 4003
- Delivery Service: 4004
- Tracking Service: 4005
- Notification Service: 4006
- Integration Service: 4007

## Tài khoản mẫu
- customer@example.com / 123456
- driver@example.com / 123456
- restaurant@example.com / 123456
- admin@example.com / 123456

## Luồng demo nhanh
1. Đăng nhập lấy JWT qua `POST /auth/login`
2. Lấy danh sách nhà hàng qua `GET /restaurants`
3. Tạo đơn qua `POST /orders`
4. Thanh toán qua `POST /orders/:id/pay`
5. Cập nhật vị trí tài xế qua `POST /tracking/update-location`
6. Xem vị trí realtime mô phỏng qua `GET /tracking/:orderId`

## Ví dụ payload tạo đơn
```json
{
  "customerId": 1,
  "customerName": "Nguyen Van A",
  "customerPhone": "0900000001",
  "restaurantId": 1,
  "customerLocation": { "lat": 10.7765, "lng": 106.7012 },
  "items": [
    { "menuItemId": 101, "quantity": 2 },
    { "menuItemId": 102, "quantity": 1 }
  ]
}
```
