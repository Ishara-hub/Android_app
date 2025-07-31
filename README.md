# Microfinance Mobile Payment App

A React Native mobile application built with Expo for processing microfinance payments. This app allows field agents to search for loans, process payments, and manage member information on-the-go.

## Features

### Core Features
- **Authentication**: Secure login with email/password
- **Loan Search**: Search loans by ID or NIC number
- **Payment Processing**: Process payments with multiple payment methods
- **Member Management**: View member profiles and payment history
- **Offline Support**: Store payments offline when connectivity is poor
- **Receipt Generation**: Generate and share payment receipts

### Payment Methods
- Cash
- Mobile Money
- Bank Transfer

### Security Features
- Token-based authentication
- Secure storage for sensitive data
- Input validation
- Error handling

## Technology Stack

- **Frontend**: React Native with Expo
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **UI Components**: Custom components with React Native

## Project Structure

```
src/
├── api/                    # API services
│   ├── auth.ts            # Authentication API
│   ├── payments.ts        # Payment processing API
│   └── members.ts         # Member management API
├── components/            # Reusable components
│   ├── common/           # Common UI components
│   ├── payment/          # Payment-specific components
│   └── member/           # Member-specific components
├── screens/              # App screens
│   ├── auth/             # Authentication screens
│   ├── dashboard/        # Dashboard and main screens
│   ├── payment/          # Payment processing screens
│   └── member/           # Member management screens
├── store/                # Redux store
│   ├── authSlice.ts      # Authentication state
│   ├── paymentSlice.ts   # Payment state
│   └── store.ts          # Store configuration
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── navigation/           # Navigation configuration
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MicrofinanceApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web
   npm run web
   ```

## Configuration

### Backend API Configuration

Update the API base URL in `src/utils/api.ts`:

```typescript
const API_BASE_URL = 'http://your-laravel-backend.com/api';
```

### Environment Variables

Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:8000/api
```

## API Endpoints

The app expects the following Laravel backend endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Payment Processing
- `POST /api/mobile/search-loan` - Search loan by ID or NIC
- `GET /api/mobile/loan/{id}/details` - Get loan details
- `GET /api/mobile/loan/{id}/installments` - Get loan installments
- `POST /api/mobile/process-payment` - Process payment
- `GET /api/mobile/payment/{id}/receipt` - Get payment receipt

### Member Management
- `GET /api/mobile/member/{id}/profile` - Get member profile
- `GET /api/mobile/member/{id}/loans` - Get member loans
- `GET /api/mobile/member/{id}/payment-history` - Get payment history

## Usage

### For Field Agents

1. **Login**: Enter your email and password to access the app
2. **Search Loans**: Use the search function to find loans by ID or NIC
3. **Process Payments**: Select installments and process payments
4. **View History**: Check payment history and member profiles

### Offline Mode

The app supports offline functionality:
- Payments are stored locally when offline
- Data syncs when connection is restored
- Search history is cached locally

## Development

### Adding New Screens

1. Create a new screen component in `src/screens/`
2. Add the screen to the navigation in `src/navigation/AppNavigator.tsx`
3. Update the navigation types if needed

### Adding New API Endpoints

1. Add the endpoint to the appropriate API service in `src/api/`
2. Create Redux actions in the relevant slice
3. Update TypeScript types if needed

### Styling

The app uses a consistent design system:
- Primary color: `#007AFF`
- Secondary color: `#F2F2F7`
- Error color: `#FF3B30`
- Text colors: `#000000`, `#8E8E93`

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **Navigation issues**
   - Ensure all screen names are properly typed
   - Check navigation dependencies

3. **API connection issues**
   - Verify API base URL configuration
   - Check network connectivity
   - Ensure Laravel backend is running

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Changelog

### Version 1.0.0
- Initial release
- Basic payment processing
- Authentication system
- Loan search functionality
- Offline support 