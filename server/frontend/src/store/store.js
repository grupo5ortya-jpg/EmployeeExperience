
import { configureStore, createSlice } from "@reduxjs/toolkit";

// Reducer temporal para evitar errores
const dummySlice = createSlice({
	name: "dummy",
	initialState: {},
	reducers: {}
});

export const store = configureStore({
	reducer: {
		dummy: dummySlice.reducer,
	},
});
