import { createSlice } from '@reduxjs/toolkit';

interface themeState {
    mode: string
}

const initialState: themeState = {
    mode: localStorage.getItem('theme') === 'light' ? 'light' : 'dark',
}

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        switchTheme(state) {
            state.mode = state.mode === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', state.mode);
        }
    },
});

export const { switchTheme } = themeSlice.actions;
export default themeSlice.reducer;