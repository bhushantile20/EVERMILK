import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../app/apiClient'

export const fetchAdminSubscriptions = createAsyncThunk(
  'adminSubscription/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const resp = await api.get('/api/subscriptions/admin/all/')
      return resp.data
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

export const fetchAdminSubscriptionDetail = createAsyncThunk(
  'adminSubscription/fetchDetail',
  async (subId, { rejectWithValue }) => {
    try {
      const resp = await api.get(`/api/subscriptions/admin/${subId}/`)
      return resp.data
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

export const cancelAdminSubscription = createAsyncThunk(
  'adminSubscription/cancel',
  async (subId, { rejectWithValue }) => {
    try {
      await api.patch(`/api/subscriptions/admin/${subId}/cancel/`)
      return subId
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

export const deleteAdminSubscription = createAsyncThunk(
  'adminSubscription/delete',
  async (subId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/subscriptions/admin/${subId}/delete/`)
      return subId
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

const initialState = {
  subscriptions: [],
  currentDetail: null,
  loading: false,
  error: null,
}

const subscriptionAdminSlice = createSlice({
  name: 'adminSubscription',
  initialState,
  reducers: {
    clearCurrentDetail: (state) => {
      state.currentDetail = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAdminSubscriptions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdminSubscriptions.fulfilled, (state, action) => {
        state.loading = false
        state.subscriptions = action.payload
      })
      .addCase(fetchAdminSubscriptions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Failed to fetch subscriptions'
      })
      
      // Fetch Detail
      .addCase(fetchAdminSubscriptionDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdminSubscriptionDetail.fulfilled, (state, action) => {
        state.loading = false
        state.currentDetail = action.payload
      })
      .addCase(fetchAdminSubscriptionDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Failed to fetch details'
      })

      // Cancel
      .addCase(cancelAdminSubscription.fulfilled, (state, action) => {
        const subId = action.payload
        const index = state.subscriptions.findIndex(s => s.id === subId)
        if (index !== -1) {
          state.subscriptions[index].status = 'cancelled'
        }
        if (state.currentDetail && state.currentDetail.subscription.id === subId) {
          state.currentDetail.subscription.status = 'cancelled'
        }
      })

      // Delete
      .addCase(deleteAdminSubscription.fulfilled, (state, action) => {
        const subId = action.payload
        state.subscriptions = state.subscriptions.filter(s => s.id !== subId)
        if (state.currentDetail && state.currentDetail.subscription.id === subId) {
          state.currentDetail = null
        }
      })
  }
})

export const { clearCurrentDetail } = subscriptionAdminSlice.actions
export default subscriptionAdminSlice.reducer
