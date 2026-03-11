import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import cartReducer from '../features/cart/cartSlice'
import subscriptionReducer from '../features/subscription/subscriptionSlice'
import subscriptionAdminReducer from '../features/subscription/subscriptionAdminSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    subscription: subscriptionReducer,
    adminSubscription: subscriptionAdminReducer,
  },
})
