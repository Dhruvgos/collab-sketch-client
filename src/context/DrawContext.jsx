'use client'
import React, { createContext, useContext, useState } from 'react';

const DrawContext = createContext()


export const DrawProvider = ({ children }) => {
    const [rectangles, setrectangles] = useState([])
    const [image, setimage] = useState(null)

  return(  <DrawContext.Provider value={{rectangles,setrectangles,image, setimage}}>
    {children}
</DrawContext.Provider>)

}

export const useDrawContext = () => {
    return useContext(DrawContext)
}