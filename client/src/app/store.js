import {configureStore} from "@reduxjs/toolkit"
import listingReducer from "./features/listingSlice.js"
export const store=configureStore({
    reducer:{
        listing:listingReducer
    }
})

