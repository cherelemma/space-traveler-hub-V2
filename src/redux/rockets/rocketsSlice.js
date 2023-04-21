import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  rockets: [],
  isLoading: false,
  error: '',
};

const client = axios.create({
  baseURL: 'https://api.spacexdata.com/v4/',
});

export const fetchRockets = createAsyncThunk(
  'rockets/fetchRockets',
  async (_, thunkAPI) => {
    try {
      const response = await client.get('rockets');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: 'Error fetching rockets from API' });
    }
  },
);

const rocketsSlice = createSlice({
  name: 'rockets',
  initialState,
  reducers: {
    reserveRocket: (state, action) => {
      const newRockets = state.rockets.map((rocket) => {
        if (rocket.id !== action.payload) {
          return rocket;
        }
        return { ...rocket, reserved: !rocket.reserved };
      });
      return ({
        ...state,
        rockets: newRockets,
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRockets.fulfilled, (state, action) => {
      const rocketList = action.payload.map((rocket) => ({
        id: rocket.id,
        name: rocket.name,
        description: rocket.description,
        flickr_images: [...rocket.flickr_images],
        wikipedia: rocket.wikipedia,
      }));
      return ({
        ...state,
        isLoading: false,
        rockets: rocketList,
      });
    })
      .addCase(fetchRockets.pending, (state) => ({
        ...state,
        isLoading: true,
        error: '',
      }))
      .addCase(fetchRockets.rejected, (state, action) => ({
        ...state,
        error: action.payload.error,
        isLoading: false,
      }));
  },
});

export const { reserveRocket } = rocketsSlice.actions;
export default rocketsSlice.reducer;
