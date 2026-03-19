# Ando Vending Machine - Full Stack Application

A web-based ordering system for the Ando robot dog vending machine that serves matcha lattes. The system features real-time status updates as the robot prepares and dispenses drinks.

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Mobile Web    │         │   FastAPI        │         │ Raspberry Pi     │
│   (React)       │◄───────►│   Backend        │◄───────►│ Hardware Control │
│                 │ REST    │                  │ WebSocket│                  │
│ • QR Scan       │  + WS   │ • Orders         │         │ • Servos (7)     │
│ • Menu Select   │         │ • Queue Mgmt     │         │ • Lighting       │
│ • Stripe Pay    │         │ • Stripe API     │         │ • Audio          │
│ • State Display │         │ • State Machine  │         │ • State Tracking │
└─────────────────┘         └──────────────────┘         └──────────────────┘
```

## Project Structure

```
Ando Vending Machine/
├── ando-vending-frontend/      # React web app
│   ├── src/
│   │   ├── pages/              # Page components (ScanQR, Menu, Checkout, etc)
│   │   ├── components/         # Reusable components (RobotStateDisplay)
│   │   ├── styles/             # Design system tokens
│   │   ├── hooks/              # Custom React hooks
│   │   └── services/           # API integration
│   └── package.json
├── ando-vending-backend/       # FastAPI backend
│   ├── app/
│   │   ├── models/             # Pydantic models
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # Business logic
│   │   └── websockets/         # WebSocket managers
│   ├── main.py
│   └── requirements.txt
└── README.md
```

## Quick Start

### Prerequisites

- **Node.js** (v18+) - Already installed at C:\Program Files\nodejs\
- **Python** (v3.10+) - For the backend

### 1. Start the Frontend

```bash
cd "C:\Users\vedha\Desktop\Ando Vending Machine\ando-vending-frontend"
npm run dev
```

The app will start at **http://localhost:5173**

### 2. Start the Backend

First, install Python dependencies:

```bash
cd "C:\Users\vedha\Desktop\Ando Vending Machine\ando-vending-backend"
pip install -r requirements.txt
```

Then run the server:

```bash
python main.py
```

The API will be available at **http://localhost:8000**

API docs available at **http://localhost:8000/docs**

### 3. (Optional) Start the Raspberry Pi Service

When hardware is ready, create a similar WebSocket server on the Pi to receive state commands.

---

## Features Implemented (Sprint 1)

### Frontend
✅ **Design System** - Ando cafe aesthetic (colors, typography, spacing)
✅ **QR Code Scanner** - Scan machine QR code to start order
✅ **Menu Selection** - Browse drinks and select size
✅ **Checkout Page** - Payment form (test card: 4242 4242 4242 4242)
✅ **Order Status** - Real-time robot state display with animations
✅ **Confirmation** - Order complete screen
✅ **Mobile Responsive** - Works on iOS/Android browsers

### Backend
✅ **FastAPI Setup** - CORS enabled, ready for frontend integration
✅ **Order Routes** - Create orders, validate sessions, track status
✅ **Menu API** - Retrieve available drinks and sizes
✅ **Machine Status** - Check if machine is idle/busy
✅ **WebSocket Infrastructure** - Real-time state updates
✅ **Queue Management** - Enforce single order at a time

---

## Testing the System

### 1. Test QR Scan Flow

1. Open http://localhost:5173
2. You'll see "Scan QR Code" page
3. Use manual entry: type any value (e.g., "test-session")
4. Proceed to menu

### 2. Test Menu & Checkout

1. Select "Matcha Latte" drink
2. Choose size (Small, Medium, Large)
3. Click "Continue to Payment"
4. Use test card: `4242 4242 4242 4242`
5. Complete payment

### 3. Monitor Real-Time State

After payment:
- Frontend connects to backend via WebSocket
- Robot state display shows live updates
- Currently cycles through states (Idle → Selection → Purchase → Preparation → Fulfillment → Conclusion → Idle)

### 4. Check Backend API

Visit **http://localhost:8000/docs** to:
- Test endpoints directly
- View API schemas
- Check request/response formats

---

## Design System Reference

The Ando design system provides consistency across all interfaces:

**Colors:**
- Background: `#FAF7ED` (warm cream)
- Text: `#282C15` (dark olive)
- Brand Green: `#15452D` (deep forest)
- Accent: `#FFA500` (amber for robot lights)

**Typography:**
- Display: Lufga (Light for large text, Bold for CTAs)
- Body: Inter (400 weight for readable prose)
- Scales: 10px, 18px, 30px, 60px, 120px

**Spacing:**
- Card radius: 18px
- Button radius: 10px
- Nav radius: 10px

---

## Next Steps (Sprint 2 & 3)

### Sprint 2: Payment & Backend Logic
- [ ] Integrate Stripe payment processing
- [ ] Implement webhook handling for payment confirmation
- [ ] Add error handling and edge cases
- [ ] Persistent order storage (SQLite/PostgreSQL)

### Sprint 3: Raspberry Pi Integration
- [ ] Servo motor control (7 servos for movement)
- [ ] LED lighting control (color transitions, animations)
- [ ] Audio playback (wind chimes, gong, zen music)
- [ ] Vision tracking (Pixy2 camera, head following)
- [ ] State machine orchestration

### Sprint 4: End-to-End Integration
- [ ] Full flow testing (QR → Payment → Robot moves → Drink dispensed)
- [ ] Error recovery and resilience
- [ ] Performance optimization
- [ ] Deployment (Docker, systemd)

---

## API Endpoints

### Menu
- `GET /api/menu` - Get available drinks
- `GET /api/menu/{drink_id}` - Get drink details

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/{order_id}` - Get order status
- `POST /api/orders/{order_id}/confirm-payment` - Confirm payment
- `POST /api/orders/{order_id}/complete` - Mark as complete

### Machine
- `GET /api/machine/status` - Get current machine state
- `GET /api/health` - Health check

### WebSocket
- `WS /ws/{order_id}` - Real-time state updates

---

## Environment Variables

Create `.env` files in both frontend and backend directories:

**Frontend (.env):**
```
VITE_API_URL=http://localhost:8000
VITE_API_HOST=localhost:8000
```

**Backend (.env):**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
RASPBERRY_PI_HOST=192.168.1.100
RASPBERRY_PI_PORT=8001
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + Vite | 18.x / 5.x |
| Styling | CSS3 + Design Tokens | — |
| State | React Hooks | — |
| Backend | FastAPI | 0.104 |
| WebSocket | websockets | 12.0 |
| Database | SQLite | — |
| Payment | Stripe API | 7.4 |
| Hardware | Python GPIO | — |

---

## Troubleshooting

### Frontend won't connect to backend
- Ensure backend is running on port 8000
- Check `.env` file has correct `VITE_API_URL`
- Verify CORS is enabled (should be)

### WebSocket connection fails
- Backend must be running at ws://localhost:8000
- Check browser console for errors
- Verify order_id is valid

### Menu not loading
- Backend `/api/menu` endpoint might be down
- Check backend logs for errors

---

## Design Aesthetic

The interface matches Ando Cafe's Japanese-Hawaiian minimalist aesthetic:
- Clean white space and cream backgrounds
- Deep forest green accents
- Large, airy typography (Lufga Light for display)
- No decorative borders or complex UI patterns
- Photography and warmth come from content, not decoration

---

## Contributing

When adding new features:
1. Follow the design system tokens in `src/styles/design-system.js`
2. Maintain mobile responsiveness
3. Use semantic HTML
4. Add WebSocket handlers for real-time updates
5. Test on both desktop and mobile browsers

---

## License

Internal project for Ando Cafe vending machine system.

---

**Status:** Sprint 1 Complete ✅
**Last Updated:** March 2026
**Next Milestone:** Sprint 2 - Payment Integration
