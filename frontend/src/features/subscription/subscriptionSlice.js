import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../app/apiClient'

// Calculate payment summary locally as per requirements
export const calculateSummary = (basePrice, quantity, plan, duration) => {
  let discount = 0
  if (plan === 'monthly') discount = 10
  else if (plan === 'quarterly') discount = 15
  else if (plan === 'yearly') discount = 25

  const pricePerDelivery = basePrice * (1 - discount / 100)
  const totalAmount = pricePerDelivery * quantity * duration
  const savings = (basePrice * quantity * duration) - totalAmount

  return {
    pricePerDelivery,
    discount,
    savings,
    totalAmount
  }
}

export const createSubscription = createAsyncThunk(
  'subscription/create',
  async (subData, { rejectWithValue }) => {
    try {
      const resp = await api.post('/api/subscriptions/create/', subData)
      return resp.data
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

export const pauseSubscription = createAsyncThunk(
  'subscription/pause',
  async (pauseData, { rejectWithValue }) => {
    try {
      const resp = await api.post('/api/subscriptions/pause/', pauseData)
      return resp.data
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

export const resumeSubscription = createAsyncThunk(
  'subscription/resume',
  async (resumeData, { rejectWithValue }) => {
    try {
      const resp = await api.post('/api/subscriptions/resume/', resumeData)
      return resp.data
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

export const fetchMySubscriptions = createAsyncThunk(
  'subscription/my',
  async (_, { rejectWithValue }) => {
    try {
      const resp = await api.get('/api/subscriptions/my/')
      return resp.data
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

const initialState = {
  mySubscriptions: [],
  loading: false,
  error: null,
  currentCreatedSub: null
}

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearCurrentSub: (state) => {
      state.currentCreatedSub = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSubscription.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.loading = false
        state.currentCreatedSub = action.payload
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Failed to create subscription'
      })
      .addCase(fetchMySubscriptions.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMySubscriptions.fulfilled, (state, action) => {
        state.loading = false
        state.mySubscriptions = action.payload
      })
      .addCase(pauseSubscription.fulfilled, (state, action) => {
        const updated = action.payload.subscription
        const idx = state.mySubscriptions.findIndex(s => s.id === updated.id)
        if (idx !== -1) {
          state.mySubscriptions[idx] = updated
        }
      })
      .addCase(resumeSubscription.fulfilled, (state, action) => {
        const updated = action.payload.subscription
        const idx = state.mySubscriptions.findIndex(s => s.id === updated.id)
        if (idx !== -1) {
          state.mySubscriptions[idx] = updated
        }
      })
  }
})

export const { clearCurrentSub } = subscriptionSlice.actions
export default subscriptionSlice.reducer
