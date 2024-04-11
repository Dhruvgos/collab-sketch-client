'use client'
import React, { createContext, useContext, useState } from 'react';

const DrawContext = createContext()


export const DrawProvider = ({ children }) => {
    const [rectangles, setrectangles] = useState([])
    const [circles, setcircles] = useState([])
    const [image, setimage] = useState(null)
    // const [isrect, setisrect] = useState(false)

  return(  <DrawContext.Provider value={{rectangles,setrectangles,image, setimage,circles, setcircles}}>
    {children}
</DrawContext.Provider>)

}

export const useDrawContext = () => {
    return useContext(DrawContext)
}